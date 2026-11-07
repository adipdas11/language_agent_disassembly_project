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
          eyebrow="04 / The planning interface"
          title={
            <>
              Evidence in.
              <br />
              <em>Decisions grounded.</em>
            </>
          }
          intro="The language agent reads a JSON record, rather than raw images. Dedicated perception and verification models update its four fields after each skill call. The record describes what was observed—not what the agent assumes an action achieved."
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
              <strong>After a verified removal</strong>
              <p>
                <code>holder_screw_03</code> enters <code>removed</code>, and{" "}
                <code>last_outcome</code> becomes <code>success</code>. The
                agent then reassesses which operation is possible.
              </p>
            </div>
          </div>
          <article
            className="state-example"
            aria-label="Updated world-state example"
          >
            <div className="panel-toolbar">
              <div>
                <span className="eyebrow">Illustrative values</span>
                <h3>world_state.json</h3>
              </div>
              <CopyButton
                value={JSON.stringify(exampleState, null, 2)}
                label="Copy updated state"
              />
            </div>
            <pre className="state-display">
              <code>{readableJson(exampleState)}</code>
            </pre>
            <p className="code-note">
              Schema follows the paper. Values demonstrate the interface; this
              is not a recorded trial packet.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
