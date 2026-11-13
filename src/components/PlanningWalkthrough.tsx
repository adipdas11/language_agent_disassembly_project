import { Fragment, memo, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Activity, ArrowDown, ArrowLeft, ArrowRight, Braces, Camera, Check, CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, Code2, Crosshair, Database, FileJson2, Grip, Layers, Pause, Play, RotateCcw, ScanLine, ShieldCheck, Sparkles, Wrench } from './ResearchIcons'
import { processStages, runtimeFields } from '../content/planning-demo'
import { sitePath } from '../lib/site-path'
import { ArchitectureClip } from './ArchitectureClip'
import { DetectionOverlay } from './DetectionOverlay'

const stageIcons = [ScanLine, Database, Layers, Sparkles, Wrench, Grip]
const fieldIcons = [Camera, Crosshair, CheckCircle2, Activity]
const DURATION = 11000

// All three segments share one centre and radius; the phase labels sit in the gaps.
const reasoningArcs = [-74, 46, 166].map(start => {
  const point = (angle: number) => {
    const radians = angle * Math.PI / 180
    return `${(130 + 104 * Math.cos(radians)).toFixed(3)} ${(130 + 104 * Math.sin(radians)).toFixed(3)}`
  }
  return `M ${point(start)} A 104 104 0 0 1 ${point(start + 88)}`
})

function highlightCode(text: string) {
  return text.split(/("(?:[^"\\]|\\.)*"\s*:|"(?:[^"\\]|\\.)*"|\b(?:true|false|null|\d+(?:\.\d+)?)\b)/g).map((token, index) => {
    const kind = /^".*:\s*$/.test(token) ? 'key' : token.startsWith('"') ? 'string' : /^(?:true|false|null|\d)/.test(token) ? 'value' : ''
    return kind ? <span className={`syntax-${kind}`} key={index}>{token}</span> : <Fragment key={index}>{token}</Fragment>
  })
}

function CameraView({ sample, label, caption, active }: { sample: string; label: string; caption: string; active: boolean }) {
  return <figure className="process-camera">
    <div className="process-camera-frame">
      <img src={sitePath(`/assets/vision/${sample}-raw.webp`)} alt={caption} />
      <DetectionOverlay sampleId={sample} visible />
      {active && <span className="process-scan" aria-hidden="true" />}
    </div>
    <figcaption><strong>{label}</strong><span>{caption}</span></figcaption>
  </figure>
}

const StageVisual = memo(function StageVisual({ stage, active }: { stage: number; active: boolean }) {
  if (stage === 0) return <div className="perception-visual">
    <CameraView sample="global-2" label="Global camera" caption="Scene components" active={active} />
    <div className="perception-closeups">
      <CameraView sample="local-2" label="Tool camera" caption="Fastener localisation" active={active} />
      <CameraView sample="state-2" label="Verification" caption="Contact assessment" active={active} />
    </div>
    <div className="sensor-input"><Activity /><span>Force–torque sensor</span><ArrowRight /><code>force_torque</code></div>
  </div>
  if (stage === 1) return <div className="state-visual">
    <div className="state-sources">{runtimeFields.map((field, i) => { const Icon = fieldIcons[i]; return <div className={`state-source field-${field.colour}`} key={field.key} style={{ '--arrival': `${i * .25}s` } as CSSProperties}><Icon /><div><strong>{field.name}</strong><code>{field.key}</code></div><span>{field.symbol}</span></div> })}</div>
    <div className="field-merge" aria-hidden="true"><span /><span /><span /><span /><i /></div>
    <div className="state-packet"><FileJson2 /><strong>world_state.json</strong><span>Sₜ = {'{Oₜ, Fₜ, Eₜ, Wₜ}'}</span></div>
    <div className="state-outcome"><span className="outcome-dot" /><strong>Latest outcome: failure</strong><code>removed: []</code></div>
  </div>
  if (stage === 2) return <div className="context-visual">
    <div className="context-card context-system"><header><ShieldCheck /> System instruction <span>Fixed</span></header><p>Select and parameterise one supported skill at a time.</p><div className="context-skills"><span>Unscrew</span><span>Pick-and-Extract</span><span>Flip</span></div></div>
    <div className="context-card context-mission"><ClipboardList /><div><strong>Mission</strong><p>Disassemble the observed components.</p></div></div>
    <div className="context-insertion"><FileJson2 /><div><strong>Current world state</strong><code>{'{state_packet}'}</code><span className="inserted-state-line">last_outcome: "failure"</span></div><span>Dynamic</span></div>
    <ArrowDown className="context-down" aria-hidden="true" />
    <div className="context-ready"><Sparkles /><span>Ready for state-conditioned selection</span></div>
  </div>
  if (stage === 3) return <div className="agent-visual">
    <div className="planning-orbit"><svg viewBox="0 0 260 260" aria-hidden="true"><defs><marker id="planning-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" /></marker></defs><g className="planning-orbit-track">{reasoningArcs.map(path => <path key={path} d={path} markerEnd="url(#planning-arrow)" />)}</g></svg><div className="planning-agent-centre"><Sparkles /><strong>ReAct</strong><span>LangGraph · GPT-5.1</span></div><span className="orbit-observe">Observe</span><span className="orbit-think">Think</span><span className="orbit-act">Act</span></div>
    <div className="decision-evidence"><span>Verified failure</span><ArrowRight /><span>Fresh state</span><ArrowRight /><strong>New decision</strong></div>
    <div className="selected-skill"><Wrench /><div><span>Selected skill</span><code>unscrew(holder_screw_03)</code></div></div>
  </div>
  if (stage === 4) return <div className="request-visual">
    <div className="request-origin"><Sparkles /><span>Selected decision</span><code>unscrew</code></div>
    <div className="request-transfer" aria-hidden="true"><span /><Braces /><span /></div>
    <div className="validated-request"><header><FileJson2 /><strong>Skill interface</strong><span>Action formatting</span></header><div className="request-checks">{['Supported skill identifier', 'Target grounded in the state', 'Verification and failure handling'].map((label, i) => <p style={{ '--arrival': `${i * .4}s` } as CSSProperties} key={label}><Check />{label}</p>)}</div><div className="request-destination"><ShieldCheck /><strong>Structured request</strong><ArrowRight /><Wrench /></div></div>
    <p className="expected-effect"><strong>Expected effect</strong> is checked after execution.</p>
  </div>
  return <div className="verification-visual">
    <div className="process-execution"><ArchitectureClip src="/assets/actions/unscrew.mp4" poster="/assets/actions/unscrew-poster.webp" label="Illustrative programmed unscrew execution" playing={active} /><span>Programmed robot skill</span></div>
    <div className="verification-result"><CheckCircle2 /><div><span>Illustrative verification result</span><strong>Removal not confirmed</strong></div></div>
    <div className="feedback-packet"><RotateCcw /><div><code>assembly_state.last_outcome</code><strong>failure</strong></div><ArrowLeft /></div>
    <p className="verification-next">Update Sₜ₊₁, then select the next action.</p>
  </div>
})

export function PlanningWalkthrough() {
  const board = useRef<HTMLDivElement>(null)
  const codeBox = useRef<HTMLPreElement>(null)
  const [visible, setVisible] = useState(false)
  const [foreground, setForeground] = useState(true)
  const [reduced, setReduced] = useState(() => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [playing, setPlaying] = useState(true)
  const [manual, setManual] = useState(false)
  const [head, setHead] = useState({ stage: 0, elapsed: 0, cycle: 0 })
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .12 })
    if (board.current) observer.observe(board.current)
    const onVisibility = () => setForeground(!document.hidden)
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotion = () => setReduced(media.matches)
    onVisibility()
    media.addEventListener('change', onMotion)
    document.addEventListener('visibilitychange', onVisibility)
    return () => { observer.disconnect(); media.removeEventListener('change', onMotion); document.removeEventListener('visibilitychange', onVisibility) }
  }, [])
  const running = playing && visible && foreground && !reduced
  useEffect(() => {
    if (!running) return
    let last = performance.now()
    const timer = window.setInterval(() => {
      const now = performance.now(), delta = Math.min(now - last, 250)
      last = now
      setHead(current => current.elapsed + delta >= DURATION ? { stage: (current.stage + 1) % processStages.length, elapsed: 0, cycle: current.cycle + 1 } : { ...current, elapsed: current.elapsed + delta })
    }, 65)
    return () => clearInterval(timer)
  }, [running])
  const stage = processStages[head.stage]
  const complete = manual || reduced
  const lines = stage.code.split('\n')
  const lineDelay = Math.min(110, 3500 / lines.length)
  const visibleLines = complete ? lines.length : Math.min(lines.length, Math.floor(head.elapsed / lineDelay))
  const text = lines.slice(0, visibleLines).join('\n')
  const length = text.length
  useEffect(() => {
    if (codeBox.current && running) codeBox.current.scrollTop = codeBox.current.scrollHeight
  }, [length, head.stage, running])
  function selectStage(index: number) {
    setHead(current => ({ stage: index, elapsed: 0, cycle: current.cycle + 1 }))
    setManual(true)
    setPlaying(false)
  }
  function togglePlay() {
    if (!playing || manual) { setManual(false); setPlaying(true) } else setPlaying(false)
  }
  function replay() {
    setHead(current => ({ stage: 0, elapsed: 0, cycle: current.cycle + 1 }))
    setManual(false)
    setPlaying(true)
  }
  return <div ref={board} className={`planning-walkthrough ${running ? 'is-running' : 'is-paused'} ${complete ? 'is-manual' : ''}`} data-stage={stage.id} style={{ '--process-accent': stage.accent } as CSSProperties}>
    <div className="process-topline"><span><i aria-hidden="true" />Perception → planning → verified execution</span><div className="process-controls">{!reduced && <button type="button" onClick={togglePlay} aria-label={playing && !manual ? 'Pause walkthrough' : 'Play walkthrough'}>{playing && !manual ? <Pause /> : <Play />}<span>{playing && !manual ? 'Pause' : 'Play'}</span></button>}<button type="button" onClick={replay} aria-label="Replay walkthrough"><RotateCcw /><span>Replay</span></button></div></div>
    <nav className="process-rail" aria-label="Planning walkthrough stages">
      {processStages.map((item, i) => { const Icon = stageIcons[i]; return <button type="button" key={item.id} className={i === head.stage ? 'process-node active' : 'process-node'} aria-current={i === head.stage ? 'step' : undefined} onClick={() => selectStage(i)} style={{ '--node-accent': item.accent } as CSSProperties}><span className="process-node-icon"><Icon /></span><strong>{item.label}</strong>{i < processStages.length - 1 && <ArrowRight className="process-rail-arrow" aria-hidden="true" />}</button> })}
    </nav>
    <div className="process-stage" key={`${head.stage}-${head.cycle}`}>
      <div className="process-visual"><StageVisual stage={head.stage} active={running} /></div>
      <article className="process-code-window" aria-label={stage.file}>
        <header><span className="code-window-dots" aria-hidden="true"><i /><i /><i /></span><strong>{stage.file}</strong><span>{complete || length === stage.code.length ? 'Ready' : 'Writing'}</span></header>
        <pre ref={codeBox} className="process-code" tabIndex={0} aria-label={`${stage.file} content`}><code>{highlightCode(text)}{!complete && length < stage.code.length && <span className="typing-caret" aria-hidden="true" />}</code></pre>
        <footer><span><Braces />{head.stage === 2 ? 'Fixed instructions + dynamic observations' : head.stage === 0 ? 'Dedicated perception and verification models' : 'Schematic example · paper interface'}</span><span className="code-transfer" aria-hidden="true"><i /><ArrowRight /></span></footer>
      </article>
    </div>
    <div className="process-caption"><div><h3>{stage.title}</h3><p>{stage.text}</p></div><div className="process-step-controls"><button type="button" aria-label="Previous stage" onClick={() => selectStage((head.stage + processStages.length - 1) % processStages.length)}><ChevronLeft /></button><button type="button" aria-label="Next stage" onClick={() => selectStage((head.stage + 1) % processStages.length)}><ChevronRight /></button></div></div>
    <div className="process-time" aria-hidden="true"><span style={{ transform: `scaleX(${complete ? 1 : head.elapsed / DURATION})` }} /></div>
    <p className="process-evidence-note">Illustrative sequence based on the paper’s interface. Camera samples and recorded footage are shown for context; they are not a synchronised trial.</p>
  </div>
}
