import { AnimatedArchitectureDiagram } from "./AnimatedArchitectureDiagram";
import { DatasetSamples } from "./DatasetSamples";
import { SectionHeader } from "./Primitives";

export function AbstractSection() {
  return (
    <section
      className="section overview-section"
      id="abstract"
      aria-labelledby="abstract-title"
    >
      <div className="section-shell overview-layout">
        <div>
          <span className="eyebrow">01 / The idea</span>
          <h2 id="abstract-title">
            Taking things apart
            <br />
            takes <em>understanding.</em>
          </h2>
        </div>
        <div className="overview-copy">
          <p className="lead">
            A screw can stay seated. A part can remain stuck. The next action
            should follow what actually happened.
          </p>
          <p>
            UNMAKE connects three vision models, a structured world state, and a
            ReAct language agent. The agent chooses the next task from the
            observed device state, without a supplied device name or ordered
            action sequence. Two specialised arms carry out the programmed
            skills, and verification updates the evidence for the next decision.
          </p>
          <div className="idea-sequence">
            <span>Observe the scene</span>
            <b>→</b>
            <span>Select one skill</span>
            <b>→</b>
            <span>Verify the result</span>
          </div>
        </div>
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
          eyebrow="02 / How UNMAKE works"
          title={
            <>
              One state. One action.
              <br />
              <em>A continuous feedback loop.</em>
            </>
          }
          intro="Camera observations become structured evidence. The language agent selects a validated skill, the robot executes it, and the verified outcome updates the world state before the next decision. Follow the animated path below."
        />
        <AnimatedArchitectureDiagram />
      </div>
    </section>
  );
}

export function DatasetsSection() {
  return (
    <section
      className="section perception-section"
      id="datasets"
      aria-labelledby="datasets-title"
    >
      <div className="section-shell">
        <SectionHeader
          id="datasets-title"
          eyebrow="03 / Perception"
          title={
            <>
              Three views of <em>the task.</em>
            </>
          }
          intro="The overhead camera finds parts and fasteners; the tool camera refines alignment; a classifier checks contact and removal states. Each row pairs a real dataset image with its supplied annotation. The aligned class is shown for verification."
        />
        <DatasetSamples />
      </div>
    </section>
  );
}
