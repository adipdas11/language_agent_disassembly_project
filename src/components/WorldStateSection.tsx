import { Activity, Camera, CheckCircle2, ChevronDown, Crosshair } from './ResearchIcons'
import { exampleState, readableJson } from '../content/world-state'
import { runtimeFields } from '../content/planning-demo'
import { CopyButton, SectionHeader } from './Primitives'
import { PlanningWalkthrough } from './PlanningWalkthrough'

const icons = [Camera, Crosshair, CheckCircle2, Activity]

export function WorldStateSection() {
  return <section className="section state-section planning-section" id="state" aria-labelledby="state-title">
    <div className="section-shell">
      <SectionHeader id="state-title" title="From observations to a skill call" intro="Perception builds the state. The language agent uses it to select one action, then a second prompt formats the skill request. Follow how observations become a decision—and how verified feedback shapes what happens next." />
      <PlanningWalkthrough />
      <div className="runtime-fields" aria-label="The four world-state fields">{runtimeFields.map((field, i) => { const Icon = icons[i]; return <article className={`runtime-field field-${field.colour}`} key={field.key}><Icon aria-hidden="true" /><div><span>{field.symbol} · {field.name}</span><h3>{field.key}</h3></div></article> })}</div>
      <details className="schema-reference">
        <summary><span><strong>Explore the world-state schema</strong><span>The four fields in one complete example packet</span></span><ChevronDown aria-hidden="true" /></summary>
        <article className="state-example" aria-label="World-state packet example">
          <div className="panel-toolbar"><h3>world_state.json</h3><CopyButton value={JSON.stringify(exampleState, null, 2)} label="Copy state JSON" /></div>
          <div className="schema-reference-body"><pre className="state-display"><code>{readableJson(exampleState)}</code></pre><div className="schema-reference-notes">{runtimeFields.map(field => <p key={field.key}><strong>{field.key}</strong>{field.text}</p>)}<p className="schema-failure-note"><strong>Observed outcome, not intended effect</strong>This illustrative packet records a failed unscrew. The removed list stays empty; aligned contact alone does not confirm fastener removal.</p></div></div>
        </article>
      </details>
    </div>
  </section>
}
