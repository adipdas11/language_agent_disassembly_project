import { useState } from 'react'
import data from '../content/manuscript-results.json'

const tables = data.tables
const devices = ['HDD', 'Mini PC', 'Laptop']
const skillDevices = [...devices, 'Additional HDD']
const valueMean = (value: string) => parseFloat(value)

function ExactValue({ value, unit = '' }: { value: string; unit?: string }) {
  const [mean, sd] = value.split(' ± ')
  return <span className="visual-exact-value"><strong>{mean}{unit}</strong>{sd && <small>± {sd}{unit}</small>}</span>
}

function MeanBar({ label, value, max, tone = 'agentic', unit = '' }: { label: string; value: string; max: number; tone?: string; unit?: string }) {
  const number = valueMean(value)
  return <div className={`mean-bar-row tone-${tone}`}>
    <span className="mean-bar-label">{label}</span>
    <div className="mean-bar-track" role="img" aria-label={`${label}: ${value}${unit}; scale 0 to ${max}${unit}`}>
      <span className="mean-bar-fill" style={{ width: `${number / max * 100}%` }} />
      {number === 0 && <i className="mean-bar-zero" />}
    </div>
    <ExactValue value={value} unit={unit} />
  </div>
}
function Scale({ max, unit = '' }: { max: number; unit?: string }) {
  return <div className="visual-scale" aria-hidden="true"><span>0{unit}</span><span>{max / 2}{unit}</span><span>{max}{unit}</span></div>
}

const countMetrics = [
  { label: 'Initial deviations', column: 4, title: 'Targets initially failing to complete', explanation: 'Each target is counted once when its first full skill invocation does not achieve the expected transition.' },
  { label: 'Cascade failures', column: 6, title: 'Failures propagated to later targets', explanation: 'An unresolved earlier step makes a subsequent target inaccessible or invalid. Lower counts indicate less failure propagation.' },
  { label: 'Physical assistance', column: 7, title: 'Operator interventions', explanation: 'Physical help per trial. Assisted targets are excluded from autonomous completion and recovery.' },
]

export function OutcomeVisuals() {
  const [metric, setMetric] = useState(1)
  const selected = countMetrics[metric]
  return <div className="outcome-visuals">
    <figure className="results-visual failure-comparison" aria-label="Scripted and agentic failure comparison">
      <figcaption><h4>{selected.title}</h4><span>Mean count per trial · lower is better</span></figcaption>
      <div className="result-choice" role="group" aria-label="Failure metric">{countMetrics.map((item, i) => <button type="button" key={item.label} aria-pressed={metric === i} onClick={() => setMetric(i)}>{item.label}</button>)}</div>
      <div className="count-device-plots">{devices.map((device, i) => <div className="count-device-plot" key={device}><h5>{device}</h5><MeanBar label="Scripted" value={tables.ablation[i * 2][selected.column]} max={6} tone="scripted" /><MeanBar label="Agentic" value={tables.ablation[i * 2 + 1][selected.column]} max={6} /></div>)}</div>
      <Scale max={6} />
      <p className="visual-caption">{selected.explanation} Bar lengths show means; labels retain mean ± sample SD.</p>
    </figure>
    <div className="recovery-column">
      <figure className="results-visual recovery-comparison" aria-label="Agentic recovery ratios">
        <figcaption><h4>Autonomous recovery</h4><span>Recovered targets / failed full invocations</span></figcaption>
        <div className="recovery-device-plots">{devices.map((device, i) => <div key={device}><MeanBar label={device} value={tables.ablation[i * 2 + 1][5]} max={100} tone="recovery" unit="%" /><p>{[8, 8, 9][i]} eligible trials with at least one failed invocation</p></div>)}</div>
        <Scale max={100} unit="%" />
        <p className="visual-caption">Higher is better. Means are over eligible trials; scripted recovery is not reported.</p>
      </figure>
      <figure className="results-visual replanning-comparison" aria-label="Agentic replanning events">
        <figcaption><h4>State-informed replanning</h4><span>New recovery calls and sequence revisions per trial</span></figcaption>
        {devices.map((device, i) => <MeanBar key={device} label={device} value={tables.generalisation[i][8]} max={6} tone="replanning" />)}
        <Scale max={6} />
        <p className="visual-caption">Routine progression and corrections inside a skill are excluded.</p>
      </figure>
    </div>
  </div>
}

export function HddTransferVisual() {
  const highlights = [
    { index: 0, title: 'Autonomous completion', max: 100, unit: '%', direction: 'Higher is better' },
    { index: 3, title: 'Recovery ratio', max: 100, unit: '%', direction: 'Higher is better' },
    { index: 1, title: 'Cycle time', max: 400, unit: ' s', direction: 'Elapsed time per trial' },
  ]
  const counts = [
    { index: 2, title: 'Initial deviations' },
    { index: 4, title: 'Cascade failures' },
    { index: 5, title: 'Physical assistance' },
    { index: 6, title: 'Replanning events' },
  ]
  return <div className="hdd-transfer-visuals">
    <div className="hdd-highlight-grid">{highlights.map(item => <figure className="results-visual hdd-highlight" key={item.index} aria-label={`HDD comparison: ${item.title}`}><figcaption><h4>{item.title}</h4><span>{item.direction}</span></figcaption><MeanBar label="Original" value={tables.additional_hdd[item.index][1]} max={item.max} tone="original" unit={item.unit} /><MeanBar label="Additional" value={tables.additional_hdd[item.index][2]} max={item.max} tone="additional" unit={item.unit} /><Scale max={item.max} unit={item.unit} /></figure>)}</div>
    <figure className="results-visual hdd-count-comparison" aria-label="Original and additional HDD outcome counts"><figcaption><h4>Execution and replanning</h4><span>Mean count per trial · common 0–4 scale</span></figcaption><div className="hdd-count-grid">{counts.map(item => <div key={item.index}><h5>{item.title}</h5><MeanBar label="Original" value={tables.additional_hdd[item.index][1]} max={4} tone="original" /><MeanBar label="Additional" value={tables.additional_hdd[item.index][2]} max={4} tone="additional" /><Scale max={4} /></div>)}</div><p className="visual-caption">Both devices use the agentic controller. Labels show mean ± sample SD; recovery uses 8 eligible original-HDD trials and 9 additional-HDD trials.</p></figure>
  </div>
}

export function SkillVisuals() {
  const [device, setDevice] = useState('HDD')
  const rows = tables.perskill.filter(row => row[0] === device)
  return <div className="skill-visuals">
    <div className="result-choice skill-device-choice" role="group" aria-label="Skill execution device">{skillDevices.map(name => <button key={name} type="button" aria-pressed={device === name} onClick={() => setDevice(name)}>{name}</button>)}</div>
    <div className="skill-visual-grid">{rows.map(row => {
      const [successes, initial] = row[3].split('/').map(Number)
      const total = Number(row[2]), recovery = Number(row[5])
      const [duration, sd] = row[6].split(' ± ').map(Number)
      return <article className="results-visual skill-result-card" key={row[1]} aria-label={`${device}: ${row[1]}`}>
        <header><h4>{row[1]}</h4><span>{device} · ten trials</span></header>
        <div className="skill-success"><div><span>Initial-invocation success</span><strong>{row[4]}%</strong></div><div className="skill-success-track" role="img" aria-label={`${successes} of ${initial} initial invocations succeeded, ${row[4]} percent`}><span style={{ width: `${row[4]}%` }} /></div><p><strong>{successes} / {initial}</strong> successful initial invocations</p></div>
        <div className="skill-invocation-count"><h5>Where the calls go <strong>{total} total</strong></h5><div className="invocation-mix" role="img" aria-label={`${initial} initial calls and ${recovery} recovery calls, ${total} total`}><span className="initial-call-segment" style={{ width: `${initial / total * 100}%` }} /><span className="recovery-call-segment" style={{ width: `${recovery / total * 100}%` }} /></div><p><span><i className="initial-call-key" />{initial} initial</span><span><i className="recovery-call-key" />{recovery} recovery</span></p></div>
        <div className="skill-duration"><h5>Invocation duration <ExactValue value={row[6]} unit=" s" /></h5><div className="duration-track" role="img" aria-label={`${row[1]} duration ${row[6]} seconds, mean plus or minus sample SD; scale zero to 40 seconds`}><span className="duration-fill" style={{ width: `${duration / 40 * 100}%` }} /><i className="duration-whisker" style={{ left: `${(duration - sd) / 40 * 100}%`, width: `${2 * sd / 40 * 100}%` }} /></div><Scale max={40} unit=" s" /></div>
      </article>
    })}</div>
    <p className="visual-caption">Success bars use successful initial invocations over all initial invocations (S₀/N₀). Duration whiskers show mean ± sample SD. Local alignment/contact corrections can occur within an initial call.</p>
  </div>
}

const perceptionMetrics = [
  { column: 1, label: 'Precision' }, { column: 2, label: 'Recall' },
  { column: 3, label: 'AP@0.5' }, { column: 4, label: 'AP@0.5:0.95' },
]
export function PerceptionVisuals() {
  const [metric, setMetric] = useState(3)
  const selected = perceptionMetrics[metric]
  return <div className="perception-visual-results">
    <div className="result-choice" role="group" aria-label="Detection evaluation metric">{perceptionMetrics.map((item, i) => <button key={item.label} type="button" aria-pressed={metric === i} onClick={() => setMetric(i)}>{item.label}</button>)}</div>
    <div className="detector-visual-grid">{[{ title: 'RF-DETR-Large', text: 'Global-camera components and fasteners', rows: tables.vision_det }, { title: 'RF-DETR-Small', text: 'Tool-camera fastener localisation', rows: tables.vision_local }].map((model, i) => <figure className="results-visual detector-result" key={model.title} aria-label={`${model.title}: ${selected.label}`}><figcaption><h4>{model.title}</h4><span>{model.text} · {selected.label} (%)</span></figcaption>{model.rows.map(row => <MeanBar key={row[0]} label={row[0]} value={row[selected.column]} max={100} tone={i ? 'recovery' : 'agentic'} unit="%" />)}<Scale max={100} unit="%" /></figure>)}</div>
    <div className="classifier-visual"><header><h4>YOLOv11-Nano · state verification</h4><p>Class-wise accuracy on the development evaluation split, with the correct and total sample counts shown.</p></header><div className="classifier-class-grid">{tables.vision_cls.map(row => <div key={row[0]}><h5>{row[0]}</h5><div className="class-accuracy"><strong>{row[3]}%</strong><span>{row[2]} / {row[1]} correct</span></div><div className="class-accuracy-track" role="img" aria-label={`${row[0]}: ${row[2]} of ${row[1]} correct; ${row[3]} percent accuracy; ${row[4]} error`}><span style={{ width: `${row[3]}%` }} /></div><p>{row[4]} error in {row[1]} evaluation samples</p></div>)}</div></div>
  </div>
}
