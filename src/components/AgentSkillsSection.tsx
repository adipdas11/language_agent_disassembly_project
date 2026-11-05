import { CheckCircle2, Eye, RotateCcw, ScanLine } from 'lucide-react'
import { SectionHeader } from './Primitives'

const scenarios = [
  { title: 'Successful removal', icon: CheckCircle2, evidence: 'The fastener is removed and the effect is verified.', response: 'Commit the removal and observe the next accessible target.', patch: 'fastener.status → removed' },
  { title: 'Misaligned contact', icon: ScanLine, evidence: 'The tool and fastener centres do not agree.', response: 'Keep the target active. Retract, re-localise, and retry before advancing.', patch: 'action.outcome → retry_required' },
  { title: 'Failed grasp', icon: RotateCcw, evidence: 'The component remains in place after an extraction attempt.', response: 'Release, refresh the scene, and select a new grasp or defer the part.', patch: 'component.status → installed' },
  { title: 'Newly revealed part', icon: Eye, evidence: 'Removing a cover exposes a component absent from the prior state.', response: 'Add the component and its fasteners before selecting the next action.', patch: 'objects → objects + revealed_part' },
]

export function AgentSkillsSection() {
  return <section className="section section-tint-peach" id="agent" aria-labelledby="agent-title"><div className="section-shell">
    <SectionHeader id="agent-title" eyebrow="05 / Decision examples" title="How observations change the next action" intro="The agent checks the result of each action before choosing the next one. These examples show how success, poor contact, a failed grasp, or a newly visible part changes its response." />
    <div className="parallel-scenarios">{scenarios.map(({ title, icon: Icon, evidence, response, patch }) => <article className="scenario-card" key={title}><Icon aria-hidden="true" /><h3>{title}</h3><dl><div><dt>Observation</dt><dd>{evidence}</dd></div><div><dt>Response</dt><dd>{response}</dd></div></dl><code>{patch}</code></article>)}</div>
  </div></section>
}
