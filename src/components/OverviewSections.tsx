import { AnimatedArchitectureDiagram } from './AnimatedArchitectureDiagram'
import { DatasetSamples } from './DatasetSamples'
import { Reveal, SectionHeader } from './Primitives'

export function AbstractSection() {
  return <section className="section abstract-section" id="abstract" aria-labelledby="abstract-title"><div className="section-shell">
    <SectionHeader id="abstract-title" eyebrow="01 / Overview" title="From a fixed sequence to a responsive system" intro="Every removed part changes what the robot can see and reach. This project connects visual perception, shared memory, and language reasoning so the next action reflects the current device." />
    <Reveal className="abstract-card concise-abstract"><p className="abstract-lead">A perception-to-action system represents a changing device as structured state, selects a constrained skill, and checks the physical result before deciding what comes next.</p><p>Global vision identifies components, a tool camera localises fasteners, and contact verification grounds execution. The language agent uses this evidence to choose among unscrewing, extraction, and reorientation, recovering when the observed result differs from the intended effect.</p></Reveal>
  </div></section>
}

export function ArchitectureSection() {
  return <section className="section" id="architecture" aria-labelledby="architecture-title"><div className="section-shell">
    <SectionHeader id="architecture-title" eyebrow="02 / System architecture" title="A closed loop, from observation to action" intro="This diagram traces how camera images become a structured state, how the ReAct agent selects a skill, and how the robot carries it out. Execution results feed back into the state before the next decision." />
    <AnimatedArchitectureDiagram />
  </div></section>
}

export function DatasetsSection() {
  return <section className="section section-tint-mint" id="datasets" aria-labelledby="datasets-title"><div className="section-shell">
    <SectionHeader id="datasets-title" eyebrow="03 / Perception data" title="Explore the labelled perception data" intro="Each row shows one of the three vision models and a sample from its dataset. Compare the raw camera image with its supplied masks or class label to see what the model is trained to recognise." />
    <DatasetSamples />
  </div></section>
}
