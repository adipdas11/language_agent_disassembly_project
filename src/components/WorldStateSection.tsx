import {
  Activity,
  Camera,
  CheckCircle2,
  Crosshair,
  Database,
} from "lucide-react";
import { exampleState, readableJson } from "../content/world-state";
import { CopyButton, SectionHeader } from "./Primitives";

const fields = [
  {
    key: "global_view",
    symbol: "Oₜ",
    name: "Scene detections",
    text: "Component labels, confidence scores, and pixel bounding boxes.",
    icon: Camera,
  },
  {
    key: "local_view",
    symbol: "Fₜ",
    name: "Target alignment",
    text: "The target ID, tool and target pixel centres, and contact alignment.",
    icon: Crosshair,
  },
  {
    key: "assembly_state",
    symbol: "Eₜ",
    name: "Execution status",
    text: "What is held or removed, plus the latest action and verified outcome.",
    icon: CheckCircle2,
  },
  {
    key: "force_torque",
    symbol: "Wₜ",
    name: "Contact measurements",
    text: "Sensor-frame force in newtons and torque in newton-metres.",
    icon: Activity,
  },
];

export function WorldStateSection() {
  return (
    <section
      className="section state-section"
      id="state"
      aria-labelledby="state-title"
    >
      <div className="section-shell">
        <SectionHeader
          id="state-title"
          title="Structured world state"
          intro="The world state is the robot’s shared record of visible parts, tool alignment, execution outcomes, and contact measurements. The planner reads these four JSON fields before choosing an action. The illustrative packet below records a failed unscrewing attempt."
        />
        <div className="state-walkthrough">
          <div className="state-explanation">
            <div className="schema-equation">
              <Database aria-hidden="true" /> Sₜ = {"{Oₜ, Fₜ, Eₜ, Wₜ}"}
            </div>
            <div className="state-fields">
              {fields.map((field) => (
                <article key={field.key}>
                  <field.icon aria-hidden="true" />
                  <div>
                    <span>
                      {field.symbol} / {field.name}
                    </span>
                    <h3>
                      <code>{field.key}</code>
                    </h3>
                    <p>{field.text}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="state-change">
              <strong>After an unsuccessful invocation</strong>
              <p>
                The latest <code>unscrew</code> outcome is <code>failure</code>,
                while <code>removed</code> stays empty. The next decision must
                use the refreshed observations rather than treat the expected
                removal as complete.
              </p>
            </div>
          </div>
          <article
            className="state-example"
            aria-label="World-state packet example"
          >
            <div className="panel-toolbar">
              <div>
                <h3>world_state.json</h3>
              </div>
              <CopyButton
                value={JSON.stringify(exampleState, null, 2)}
                label="Copy state JSON"
              />
            </div>
            <pre className="state-display">
              <code>{readableJson(exampleState)}</code>
            </pre>
          </article>
        </div>
      </div>
    </section>
  );
}
