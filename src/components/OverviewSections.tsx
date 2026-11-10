import { AnimatedArchitectureDiagram } from "./AnimatedArchitectureDiagram";
import { DatasetSamples } from "./DatasetSamples";
import { SectionHeader } from "./Primitives";

export function AbstractSection() {
  return (
    <section
      className="section abstract-section"
      id="abstract"
      aria-labelledby="abstract-title"
    >
      <div className="section-shell">
        <SectionHeader
          id="abstract-title"
          title="Overview"
          intro="REMAKE combines hierarchical perception, a structured world state, and ReAct-based task planning for dual-arm disassembly. The agent selects one of three programmed skills from observed conditions, without a supplied device identity or action sequence."
        />
      </div>
    </section>
  );
}
export function ArchitectureSection() {
  return (
    <section
      className="section architecture-section"
      id="architecture"
      aria-labelledby="architecture-title"
    >
      <div className="section-shell">
        <SectionHeader
          id="architecture-title"
          title="System architecture"
          intro="Perception updates the shared state, the agent selects a validated skill, and the arms execute it. Verified outcomes feed back into the state before the next decision."
        />
        <AnimatedArchitectureDiagram />
      </div>
    </section>
  );
}
export function DatasetsSection() {
  return (
    <section
      className="section section-tint-blue"
      id="datasets"
      aria-labelledby="datasets-title"
    >
      <div className="section-shell">
        <SectionHeader
          id="datasets-title"
          title="Perception"
          intro="Global detection identifies components; local detection refines tool alignment; classification checks execution states. The raw and labelled dataset examples below illustrate these three roles."
        />
        <DatasetSamples />
      </div>
    </section>
  );
}
