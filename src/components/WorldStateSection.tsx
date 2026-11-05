import { Braces, CheckCircle2, History, Layers3 } from 'lucide-react'
import { makeWorldState } from '../content/research-data'
import { CopyButton, SectionHeader } from './Primitives'

function JsonTree({ value, name }: { value: unknown; name?: string }) {
  if (value === null || typeof value !== 'object' || (Array.isArray(value) && value.every((item) => typeof item !== 'object'))) return <div className="tree-leaf"><span>{name}</span><code>{JSON.stringify(value)}</code></div>
  const entries = Object.entries(value as Record<string, unknown>)
  return <div className="tree-branch"><div className="tree-name">{name ?? 'state'} <small>{Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`}</small></div><div className="tree-children">{entries.map(([key, child]) => <JsonTree key={key} name={key} value={child} />)}</div></div>
}

const example = makeWorldState('hdd').paper
example.fasteners[0].status = 'removed'
example.history.push({ action: 'unscrew', outcome: 'success', at: 't1' })
example.timestamp = '2026-01-01T12:00:01.000Z'

export function WorldStateSection() {
  return <section className="section" id="state" aria-labelledby="state-title"><div className="section-shell">
    <SectionHeader id="state-title" eyebrow="04 / Structured state" title="A shared memory of the device" intro="The world state is the robot’s shared record of visible parts, fasteners, and past actions. Perception fills this record; verified execution results update it before the agent chooses what to do next." />
    <div className="schema-callouts static-schema">
      <div><Layers3 aria-hidden="true" /><strong>Parts · Oₜ</strong><span>What is visible, where it is, and whether it is still installed.</span></div>
      <div><Braces aria-hidden="true" /><strong>Fasteners · Fₜ</strong><span>Which screws hold parts in place and which have been removed.</span></div>
      <div><History aria-hidden="true" /><strong>Action history · Eₜ</strong><span>What the robot tried and whether each action succeeded.</span></div>
    </div>
    <div className="state-walkthrough">
      <div className="state-explanation"><span className="eyebrow">A simplified example</span><h3>Removing one lid screw</h3>
        <ol className="state-example-steps">
          <li><span>01</span><div><h4>Observe the device</h4><p>The lid is installed, and the fastener entry <code>lid_screw_03</code> is marked <strong>present</strong>.</p></div></li>
          <li><span>02</span><div><h4>Execute and verify</h4><p>The tooling arm runs <code>unscrew(lid_screw_03)</code>. Verification confirms that the screw has been removed.</p></div></li>
          <li><span>03</span><div><h4>Update the record</h4><p>The fastener becomes <strong>removed</strong>, and a successful <code>unscrew</code> event is added to <code>history</code>. The lid remains installed until a separate extraction succeeds.</p></div></li>
        </ol>
        <p className="state-example-note"><CheckCircle2 aria-hidden="true" />The JSON record shows the device state after the verified removal.</p>
      </div>
      <article className="state-example" aria-label="Updated world-state example"><div className="panel-toolbar"><h3>Updated state</h3><CopyButton value={JSON.stringify(example, null, 2)} label="Copy updated state" /></div><div className="state-display"><JsonTree value={example} /></div></article>
    </div>
  </div></section>
}
