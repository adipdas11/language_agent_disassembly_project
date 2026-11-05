import { ReactNode, useEffect, useRef, useState } from 'react'
import { ArrowRight, BrainCircuit, Camera, Database, Expand, Grip, Pause, Play, RefreshCw, ScanLine, ShieldCheck, Wrench, X } from 'lucide-react'
import actionClips from '../../public/assets/actions/clips.json'
import experimentClips from '../../public/assets/architecture/clips.json'
import { ArchitectureClip } from './ArchitectureClip'
import { DetectionOverlay } from './DetectionOverlay'
import { SkillContract } from './SkillContract'
import { devices } from '../content/research-data'
import { sitePath } from '../lib/site-path'
import './architecture.css'

const stages = [
  { id: 'scene', label: 'Scene-level perception', title: 'Understand the scene', text: 'A raw global-camera image becomes component and fastener detections.', input: 'Global RGB image', output: 'Component and fastener detections', icon: Camera },
  { id: 'local', label: 'Local fastener perception', title: 'Locate the contact point', text: 'The tool-camera image becomes tool and screw positions before engagement.', input: 'Tool-camera image', output: 'Tool and fastener positions', icon: ScanLine },
  { id: 'verification', label: 'State verification', title: 'Check the physical result', text: 'The classifier and execution feedback provide evidence for continuing or recovering.', input: 'Post-action observations', output: 'Verified outcome or retry request', icon: ShieldCheck },
  { id: 'state', label: 'Structured world state', title: 'Build the structured world state', text: 'Perception is represented as JSON describing objects, fasteners, and execution history. This preview is illustrative.', input: 'Perception and verified outcomes', output: 'Sₜ = {Oₜ, Fₜ, Eₜ}', icon: Database },
  { id: 'agent', label: 'Language-agent reasoning loop', title: 'Observe, think, and act', text: 'The ReAct loop observes the JSON state, reasons about the next operation, and selects one of the three validated skills.', input: 'World-state JSON, mission, and history', output: 'One selected skill and target', icon: BrainCircuit },
  { id: 'skills', label: 'Skill library', title: 'See the selected physical skill', text: 'Actual experiment clips demonstrate Unscrew, Pick-and-Extract, and Flip. Choose a skill to inspect its motion.', input: 'Proposed action and target', output: 'A skill with explicit preconditions', icon: Wrench },
  { id: 'interface', label: 'Validated skill interface', title: 'Validate before execution', text: 'A typed skill and target constrain the proposal before the robot executes it.', input: 'Skill name and target', output: 'Validated robot command', icon: ShieldCheck },
  { id: 'execution', label: 'Dual-arm execution', title: 'Coordinate physical execution', text: 'A separate excerpt shows screw removal followed by manipulation-arm extraction. The source footage retains its original demonstration speed.', input: 'Validated skill call', output: 'Motion, contact, and execution feedback', icon: Grip },
  { id: 'devices', label: 'Cross-device adaptation', title: 'Evaluate across device structures', text: 'Parallel HDD, Mini PC, and Laptop experiment excerpts show the same skills applied to different assemblies.', input: 'Device-specific observations', output: 'Physical disassembly outcomes', icon: RefreshCw },
] as const
const mainIds = ['scene', 'state', 'agent', 'skills', 'execution', 'devices'] as const
type StageId = typeof stages[number]['id']
type PerceptionKind = 'scene' | 'local' | 'verification'
const images = {
  scene: { base: 'global-1', model: 'RF-DETR-Large', caption: 'Global camera → device parts and fasteners' },
  local: { base: 'local-1', model: 'RF-DETR-Small', caption: 'Tool camera → screwdriver and screw centres' },
  verification: { base: 'state-2', model: 'YOLOv11-Nano', caption: 'Contact image → aligned / misaligned label' },
}
const reasoning = ['Observe', 'Think', 'Act']
const evaluationClips = [
  { ...experimentClips.find((clip) => clip.id === 'hdd')!, label: 'HDD', detail: 'PCB extraction' },
  { ...experimentClips.find((clip) => clip.id === 'mini-pc')!, label: 'Mini PC', detail: 'Heat-sink extraction' },
  { ...experimentClips.find((clip) => clip.id === 'laptop')!, label: 'Laptop', detail: 'Heat-sink extraction' },
]
const executionClip = experimentClips.find((clip) => clip.id === 'execution')!
const statePreviews = [
  '{\n  "objects": ["lid"],\n  "fasteners": {\n    "present": 7,\n    "removed": 0\n  },\n  "history": [],\n  "status": "lid_blocked"\n}',
  '{\n  "objects": ["lid"],\n  "fasteners": {\n    "present": 0,\n    "removed": 7\n  },\n  "history": ["unscrewed"],\n  "status": "lid_free"\n}',
  '{\n  "objects": ["hdd"],\n  "fasteners": {\n    "present": 0,\n    "removed": 7\n  },\n  "history": ["lid_removed"],\n  "status": "flip_ready"\n}',
]
const calls = ['unscrew(lid_screw_01)', 'pick_and_extract(lid)', 'flip(device)']

export function AnimatedArchitectureDiagram() {
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [step, setStep] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [visible, setVisible] = useState(false)
  const [pageVisible, setPageVisible] = useState(!document.hidden)
  const [skillIndex, setSkillIndex] = useState(0)
  const [skillManual, setSkillManual] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const expandRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const [connections, setConnections] = useState({ width: 1200, height: 980, paths: [] as string[], feedback: '' })
  const running = playing && visible && pageVisible
  const current = stages[step]
  const currentMain = current.id === 'local' || current.id === 'verification' ? 'scene' : current.id === 'interface' ? 'skills' : current.id
  const detected = !running || current.id !== 'scene' || elapsed >= 600
  const reasoningPhase = Math.min(2, Math.floor(elapsed / 1334))
  const selectedSkill = actionClips[skillIndex]
  const statePreview = statePreviews[skillIndex]
  const json = running && current.id === 'state' ? statePreview.slice(0, Math.max(1, Math.floor(elapsed / 3200 * statePreview.length))) : statePreview

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .05 })
    if (rootRef.current) observer.observe(rootRef.current)
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const motion = () => { if (media.matches) setPlaying(false) }
    const visibility = () => setPageVisible(!document.hidden)
    media.addEventListener('change', motion)
    document.addEventListener('visibilitychange', visibility)
    return () => { observer.disconnect(); media.removeEventListener('change', motion); document.removeEventListener('visibilitychange', visibility) }
  }, [])
  useEffect(() => {
    if (!running) return
    const start = performance.now()
    let previous = start
    const interval = window.setInterval(() => {
      const now = performance.now()
      const delta = now - previous
      previous = now
      setElapsed((value) => value + delta)
    }, 40)
    return () => window.clearInterval(interval)
  }, [running])
  useEffect(() => {
    if (elapsed < 4000) return
    setElapsed(0)
    setStep((value) => (value + 1) % stages.length)
  }, [elapsed])
  useEffect(() => {
    if (!running || skillManual) return
    const timer = window.setTimeout(() => setSkillIndex((value) => (value + 1) % actionClips.length), selectedSkill.duration * 1000)
    return () => window.clearTimeout(timer)
  }, [running, selectedSkill.duration, skillIndex, skillManual])
  useEffect(() => {
    const board = boardRef.current
    if (!board) return
    const measure = () => {
      const parent = board.getBoundingClientRect()
      const boxes = mainIds.map((id) => {
        const rect = board.querySelector(`[data-flow-panel="${id}"]`)!.getBoundingClientRect()
        return { left: rect.left-parent.left, right: rect.right-parent.left, top: rect.top-parent.top, bottom: rect.bottom-parent.top, cx: (rect.left+rect.right)/2-parent.left, cy: (rect.top+rect.bottom)/2-parent.top }
      })
      const paths = boxes.slice(0, -1).map((from, index) => {
        const to = boxes[index + 1]
        // Leave a clear margin at both ends; keep elbows inside the row gutter.
        if (to.left > from.right && Math.min(from.bottom,to.bottom) > Math.max(from.top,to.top)) {
          const y = (Math.max(from.top,to.top)+Math.min(from.bottom,to.bottom))/2
          return `M${from.right+8},${y} H${to.left-8}`
        }
        const start = from.bottom+8, end = to.top-10, middle = (start+end)/2
        const direction = Math.sign(to.cx-from.cx)
        if (Math.abs(to.cx-from.cx) < 1) return `M${from.cx},${start} V${end}`
        const radius = Math.min(10, Math.abs(to.cx-from.cx)/2, (end-start)/4)
        return `M${from.cx},${start} V${middle-radius} Q${from.cx},${middle} ${from.cx+direction*radius},${middle} H${to.cx-direction*radius} Q${to.cx},${middle} ${to.cx},${middle+radius} V${end}`
      })
      const execution = boxes[4], worldState = boxes[1]
      setConnections({ width: parent.width, height: parent.height, paths, feedback: `M${execution.right+8},${execution.cy} H${parent.width-8} V${worldState.cy} H${worldState.right+8}` })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(board)
    board.querySelectorAll('[data-flow-panel]').forEach((node) => observer.observe(node))
    measure()
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (!expanded) return
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false)
      if (event.key === 'Tab') { event.preventDefault(); dialogRef.current?.querySelector('button')?.focus() }
    }
    document.addEventListener('keydown', keydown)
    document.body.classList.add('modal-open')
    return () => { document.removeEventListener('keydown', keydown); document.body.classList.remove('modal-open'); expandRef.current?.focus() }
  }, [expanded])
  const select = (id: StageId) => { setStep(stages.findIndex((stage) => stage.id === id)); setElapsed(0); setPlaying(false) }
  const node = (id: StageId, children: ReactNode, className = '') => { const stage = stages.find((stage) => stage.id === id)!; return <button type="button" className={`diagram-node ${className}`} data-stage={id} aria-label={stage.label} aria-description={`Input: ${stage.input}. Output: ${stage.output}.`} aria-pressed={current.id === id} onClick={() => select(id)}>{children}</button> }
  const heading = (id: typeof mainIds[number], number: string, title: string, Icon: typeof Camera) => <h3 className="flow-heading">{node(id, <><span className="flow-number">{number}</span><Icon aria-hidden="true" /><span>{title}</span></>)}</h3>
  const toggle = () => { if (!playing) setSkillManual(false); setPlaying(!playing) }
  return (
    <div ref={rootRef} className={`system-diagram visual-flow ${running ? 'is-playing' : ''}`}>
      <div className="architecture-controls"><button className="icon-button" onClick={toggle} aria-label={`${playing ? 'Pause' : 'Play'} architecture animation`}>{playing ? <Pause /> : <Play />}{playing ? 'Pause' : 'Play'}</button></div>

      <div ref={boardRef} className="visual-flow-board">
        <svg className="visual-flow-connectors" viewBox={`0 0 ${connections.width} ${connections.height}`} aria-hidden="true"><defs><marker id="visual-flow-arrow" markerUnits="userSpaceOnUse" viewBox="0 0 12 12" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M2 1 L10 6 L2 11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></marker><marker id="execution-feedback-arrow" markerUnits="userSpaceOnUse" viewBox="0 0 12 12" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M2 1 L10 6 L2 11" fill="none" stroke="#52877b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></marker></defs>{connections.paths.map((path, index) => <path key={index} d={path} className={mainIds.indexOf(currentMain) === index ? 'active-link' : ''} />)}<path className="flow-feedback-line" d={connections.feedback} /></svg>
        <article data-flow-panel="scene" className={`flow-panel ${currentMain === 'scene' ? 'active' : ''}`}>
          {heading('scene', '01', 'Perception pipeline', Camera)}

          <div className="vision-column-headings"><span>Raw images</span><span /><span>Vision models</span><span /><span>Annotated outputs</span></div>
          <div className="flow-perception-views" role="group" aria-label="Parallel perception views">
            {(['scene', 'local', 'verification'] as PerceptionKind[]).map((kind) => {
              const image = images[kind]
              const modelContent = <strong>{image.model}</strong>
              return <div key={kind} className={`flow-perception-view vision-row ${current.id === kind ? 'active' : ''}`}>
                <div className="vision-input"><img src={sitePath(`/assets/vision/${image.base}-raw.webp`)} alt={`${image.model} raw camera sample`} />{running && !detected && <span className="flow-scanline" />}</div>
                <ArrowRight className="vision-row-arrow" aria-hidden="true" />
                {kind === 'scene' ? <button className="vision-model" onClick={() => select('scene')}>{modelContent}</button> : node(kind, modelContent, 'vision-model')}
                <ArrowRight className="vision-row-arrow" aria-hidden="true" />
                <div className="vision-output"><img src={sitePath(`/assets/vision/${image.base}-raw.webp`)} alt="" /><DetectionOverlay sampleId={image.base} visible={detected} /></div>
              </div>
            })}
          </div>

        </article>
        <div className="flow-reasoning-stack">
        <article data-flow-panel="state" className={`flow-panel ${currentMain === 'state' ? 'active' : ''}`}>
          {heading('state', '02', 'World state', Database)}
          <div className="flow-json-window"><pre className="flow-json-sizer" aria-hidden="true"><code>{statePreview}</code></pre><pre aria-label="Illustrative world-state JSON"><code>{json}</code>{running && current.id === 'state' && <span className="flow-type-cursor" aria-hidden="true">▌</span>}</pre></div>

        </article>
        <article data-flow-panel="agent" className={`flow-panel ${currentMain === 'agent' ? 'active' : ''}`}>
          {heading('agent', '03', 'ReAct agent', BrainCircuit)}
          <div className="flow-agent-visual"><div className="react-orbit"><svg viewBox="0 0 240 240" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><marker id="react-arrow" markerUnits="userSpaceOnUse" viewBox="0 0 9 9" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0 0 L8 4.5 L0 9 Z" fill="#7856a6" /></marker></defs><path className={reasoningPhase === 0 ? 'active' : ''} d="M144.63 52.34 A72 72 0 0 1 190.91 132.50" /><path className={reasoningPhase === 1 ? 'active' : ''} d="M166.28 175.16 A72 72 0 0 1 73.72 175.16" /><path className={reasoningPhase === 2 ? 'active' : ''} d="M49.09 132.50 A72 72 0 0 1 95.37 52.34" /></svg>{reasoning.map((phase, index) => <span key={phase} className={`flow-phase phase-${index} ${reasoningPhase === index ? 'active' : ''}`}>{phase}</span>)}<div className="react-centre"><BrainCircuit /><strong>ReAct</strong></div></div></div>
        </article>
        </div>
        <article id="actions" data-flow-panel="skills" className={`flow-panel ${currentMain === 'skills' ? 'active' : ''}`}>
          {heading('skills', '04', 'Skill library', Wrench)}
          <div className="parallel-skills" role="group" aria-label="Architecture skill videos">{actionClips.map((clip, index) => <div key={clip.id} className={`parallel-skill ${skillIndex === index ? 'selected' : ''}`}><ArchitectureClip {...clip} label={`${clip.label} skill video`} playing={running} /><button aria-pressed={skillIndex === index} onClick={() => { setSkillIndex(index); setSkillManual(true) }}>{clip.label}</button><SkillContract id={clip.id} /></div>)}</div>

          {node('interface', <><ShieldCheck /><span><strong>Validated interface</strong><code>{calls[skillIndex]}</code></span></>, 'flow-interface')}
        </article>
        <article data-flow-panel="execution" className={`flow-panel ${currentMain === 'execution' ? 'active' : ''}`}>
          {heading('execution', '05', 'Physical execution', Grip)}
          <ArchitectureClip {...executionClip} label="Dual-arm execution video" playing={running} />
          <div className="flow-arm-roles"><span><Grip /><strong>Manipulation</strong></span><span><Wrench /><strong>Tooling</strong></span></div>

        </article>
        <article id="devices" data-flow-panel="devices" className={`flow-panel ${currentMain === 'devices' ? 'active' : ''}`}>
          {heading('devices', '06', 'Cross-device evaluation', RefreshCw)}
          <div className="parallel-devices" role="group" aria-label="Architecture device videos">{evaluationClips.map((clip) => {
            const device = devices.find((item) => item.id === clip.id)!
            return <div className="parallel-device" key={clip.id}><ArchitectureClip {...clip} label={`${clip.label} evaluation video`} playing={running} /><strong>{clip.label}</strong><dl className="device-facts"><div><dt>Target steps</dt><dd>{device.targetSteps}</dd></div><div><dt>Fasteners</dt><dd>{device.screwTypes}</dd></div><div><dt>Extracted parts</dt><dd>{device.extractedParts.join(', ')}</dd></div><div><dt>Reorientation</dt><dd>{device.reorientation}</dd></div></dl></div>
          })}</div>

        </article>
        <div className="flow-feedback-caption"><RefreshCw />Execution feedback updates world state</div>
      </div>
      <div className="diagram-legend"><button ref={expandRef} type="button" onClick={() => setExpanded(true)} aria-label="Expand animated architecture figure"><Expand />Original research figure</button></div>
      {expanded && <div className="modal-backdrop" onClick={() => setExpanded(false)}><div ref={dialogRef} className="figure-modal" role="dialog" aria-modal="true" aria-label="Original research architecture" onClick={(event) => event.stopPropagation()}><button className="modal-close" autoFocus onClick={() => setExpanded(false)} aria-label="Close figure"><X /></button><img src={sitePath('/assets/architecture-figure.png')} alt="Original architecture including perception, reasoning, skill interface, dual-arm execution, and device adaptation" /><p>Original research architecture.</p></div></div>}
    </div>
  )
}
