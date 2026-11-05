import { AnimatedArchitectureDiagram } from './AnimatedArchitectureDiagram'
import { DatasetSamples } from './DatasetSamples'
import { Reveal, SectionHeader } from './Primitives'

export function AbstractSection() {
  return <section className="section abstract-section" id="abstract" aria-labelledby="abstract-title"><div className="section-shell">
    <SectionHeader id="abstract-title" eyebrow="01 / Overview" title="From a fixed sequence to a responsive system" intro="Disassembly changes the scene at every step. The next action needs to reflect what is actually there." />
    <Reveal className="abstract-card concise-abstract"><p className="abstract-lead">A perception-to-action system represents a changing device as structured state, selects a constrained skill, and checks the physical result before deciding what comes next.</p><p>Global vision identifies components, a tool camera localises fasteners, and contact verification grounds execution. The language agent uses this evidence to choose among unscrewing, extraction, and reorientation, recovering when the observed result differs from the intended effect.</p></Reveal>
  </div></section>
}

export function ArchitectureSection() {
  return <section className="section" id="architecture" aria-labelledby="architecture-title"><div className="section-shell">
    <SectionHeader id="architecture-title" eyebrow="02 / System architecture" title="A closed loop, from observation to action" intro="Follow camera observations through structured state and reasoning to the robot’s skills and cross-device evaluation." />
    <AnimatedArchitectureDiagram />
  </div></section>
}

export function DatasetsSection() {
  return <section className="section section-tint-mint" id="datasets" aria-labelledby="datasets-title"><div className="section-shell">
    <SectionHeader id="datasets-title" eyebrow="03 / Perception data" title="Compare the input, labels, and predictions" intro="Additional samples complement the architecture examples. Original images, annotation masks, and model outputs are displayed together." />
    <DatasetSamples />
  </div></section>
}
