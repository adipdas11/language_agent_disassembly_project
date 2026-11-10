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
          intro="REMAKE lets a dual-arm robot choose its next disassembly action as new parts become visible. A language agent uses observations and verified outcomes to select one of three programmed skills: unscrew, pick-and-extract, or flip."
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
          intro="The diagram follows the path from camera observations to a shared world state, a language-agent decision, and robot execution. Feedback updates the state after each action; the right-hand videos show the same system working on three devices."
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
          intro="Three vision models answer different questions: which parts are visible, where the tool and screw are, and whether contact is aligned. Each row pairs a raw camera image with its supplied dataset labels, showing what that model is trained to recognise."
        />
        <DatasetSamples />
      </div>
    </section>
  );
}
