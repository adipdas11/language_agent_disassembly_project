import type { ReactNode } from "react";
import { ArrowUpRight, FlaskConical } from "lucide-react";
import manuscript from "../content/manuscript-results.json";
import { SectionHeader } from "./Primitives";

const tables = manuscript.tables;
const detectionHeaders = [
  "Class",
  "Precision %",
  "Recall %",
  "AP@0.5 %",
  "AP@0.5:0.95 %",
];
const labels: Record<string, string> = {
  "R_{comp} (%)": "Completion (%)",
  "T_{cycle} (s)": "Cycle time (s)",
  "F_{step}": "Initial deviations",
  "R_{rec} (%)": "Recovery ratio (%)",
  F_C: "Cascade failures",
  "H_{int}": "Physical assistance",
  "N_{replan}": "Replanning events",
};

function Value({ value }: { value: string }) {
  const [mean, sd] = value.split(" ± ");
  return (
    <span className="metric-value">
      {mean}
      {sd && <small> ± {sd}</small>}
    </span>
  );
}
function DataTable({
  title,
  headers,
  rows,
  note,
  className = "",
}: {
  title: string;
  headers: string[];
  rows: string[][];
  note?: ReactNode;
  className?: string;
}) {
  return (
    <article className={`result-table-card ${className}`}>
      <table className="data-table">
        <caption>{title}</caption>
        <thead>
          <tr>
            {headers.map((header) => (
              <th scope="col" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, column) =>
                column === 0 ? (
                  <th scope="row" key={column}>
                    {labels[cell] ?? cell}
                  </th>
                ) : (
                  <td data-label={headers[column]} key={column}>
                    <Value value={cell} />
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {note && <p className="table-note">{note}</p>}
    </article>
  );
}

export function ResultsSection() {
  return (
    <section
      className="section results-section"
      id="results"
      aria-labelledby="results-title"
    >
      <div className="section-shell">
        <SectionHeader
          id="results-title"
          eyebrow="05 / Evaluation"
          title={
            <>
              Look beyond <em>a single score.</em>
            </>
          }
          intro="Perception is evaluated by detection and classification quality. The task-level protocol separately tracks autonomous target completion, time, recovery, failure propagation, and physical assistance, so each number answers a specific question."
        />
        <div className="result-group-heading">
          <span className="result-index">A</span>
          <div>
            <h3>Perception performance</h3>
            <p>
              Supplied development-set results · post-augmentation 70/20/10
              split
            </p>
          </div>
        </div>
        <div className="perception-results">
          <DataTable
            title="RF-DETR-Large · scene understanding"
            headers={detectionHeaders}
            rows={tables.vision_det}
            note="11 classes · 1,088 × 1,088 input · 800 raw images → 2,800 augmented samples"
          />
          <div className="perception-results-right">
            <DataTable
              title="RF-DETR-Small · local alignment"
              headers={detectionHeaders}
              rows={tables.vision_local}
              note="4 classes · 640 × 640 input · 800 raw images → 2,800 augmented samples"
            />
            <DataTable
              title="YOLOv11-Nano · state verification"
              headers={["Class", "Samples", "Correct", "Accuracy %", "Errors"]}
              rows={tables.vision_cls.map((row) => [
                row[0].replaceAll("_", " "),
                ...row.slice(1),
              ])}
              note="3 classes · 224 × 224 input · 175 raw images → 1,225 augmented samples"
            />
          </div>
        </div>
        <p className="evaluation-note">
          <strong>What the scores show.</strong> Precision measures how often
          detections are correct; recall measures how many labelled targets are
          found. Stricter box-overlap thresholds expose a localisation gap:
          scene-level AP@0.5:0.95 is 61.5% for screws versus 88.4% for cases.
          This is detection quality, not manipulation success.
        </p>
        <p className="evaluation-note">
          Augmentation preceded the split, so related image variants occur
          across partitions. These scores describe the development split and do
          not establish independent unseen-image generalisation.
        </p>

        <div className="result-group-heading controller-heading">
          <span className="result-index">B</span>
          <div>
            <h3>Task-level controller comparison</h3>
            <p>
              Same hardware, vision models, motion planning, skills, and target
              sets
            </p>
          </div>
        </div>
        <div className="data-status">
          <FlaskConical aria-hidden="true" />
          <p>
            <strong>Numerical reporting examples.</strong> The supplied V10
            manuscript explicitly identifies the controller, skill, and
            additional-HDD values as generated examples for calculation and
            layout checks. They are shown below as examples, not measured robot
            performance.
          </p>
        </div>
        <div className="comparison-intro">
          <div>
            <span>Completion, equal weight per device</span>
            <h4>
              58.1% <ArrowUpRight aria-hidden="true" /> <em>86.0%</em>
            </h4>
            <p>+27.9 percentage points in the example records</p>
          </div>
          <p>
            Higher completion comes with longer execution: the mean device-wise
            cycle-time increase is <strong>16.1%</strong>. The protocol compares
            the complete feedback and planning systems; it does not isolate the
            language model’s contribution.
          </p>
        </div>
        <div className="controller-cards">
          {["HDD", "Mini PC", "Laptop"].map((device, index) => {
            const baseline = tables.ablation[index * 2],
              agent = tables.ablation[index * 2 + 1];
            const metrics = [
              ["Cycle time (s)", baseline[3], agent[3]],
              ["Initial deviations", baseline[4], agent[4]],
              ["Recovery ratio (%)", baseline[5], agent[5]],
              ["Cascade failures", baseline[6], agent[6]],
              ["Physical assistance", baseline[7], agent[7]],
              ["Replanning events", "n/a", tables.generalisation[7][index + 1]],
            ];
            return (
              <article className="controller-card" key={device}>
                <header>
                  <h4>{device}</h4>
                  <span>{[11, 9, 12][index]} target steps</span>
                </header>
                <div
                  className="completion-comparison"
                  aria-label={`${device} autonomous target completion`}
                >
                  <span className="eyebrow">Autonomous target completion</span>
                  {[baseline, agent].map((row) => (
                    <div
                      className={`completion-row ${row[1].toLowerCase()}`}
                      key={row[1]}
                    >
                      <div>
                        <span>{row[1]}</span>
                        <strong>
                          <Value value={row[2]} />%
                        </strong>
                      </div>
                      <div className="completion-track">
                        <span style={{ width: `${parseFloat(row[2])}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <table className="controller-metrics">
                  <caption className="sr-only">
                    {device} controller example metrics, mean plus or minus
                    sample standard deviation
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Metric</th>
                      <th scope="col">Scripted</th>
                      <th scope="col">Agentic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((row) => (
                      <tr key={row[0]}>
                        <th scope="row">{row[0]}</th>
                        <td>
                          <Value value={row[1]} />
                        </td>
                        <td>
                          <Value value={row[2]} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="table-note">
                  5 scripted / 10 agentic example records.
                  <br />
                  Means ± sample SD; events counted per record.
                  <br />Recovery: {[10, 9, 10][index]} eligible agentic records.
                </p>
              </article>
            );
          })}
        </div>
        <div className="metric-definitions">
          <article>
            <h4>Completion is per target</h4>
            <p>
              Autonomously completed targets ÷ the fixed target count. Assisted
              targets do not count; retries do not add targets.
            </p>
          </article>
          <article>
            <h4>Recovery is per failed call</h4>
            <p>
              Targets recovered autonomously ÷ all failed invocations, averaged
              over eligible records. The revised example macro-average is 22.6%.
            </p>
          </article>
          <article>
            <h4>Cascades are downstream failures</h4>
            <p>
              Initial deviations caused by an unresolved earlier step. The
              example mean counts decrease by 84.3% across devices.
            </p>
          </article>
        </div>

        <div className="result-group-heading">
          <span className="result-index">C</span>
          <div>
            <h3>Where the skills spend their effort</h3>
            <p>
              Generated examples · totals across ten agentic records per device
            </p>
          </div>
        </div>
        <DataTable
          title="Skill execution · initial success and recovery calls"
          headers={[
            "Device",
            "Skill",
            "Invocations",
            "First attempt %",
            "Recovery calls",
            "Time (s) ± SD",
            "Condition category",
          ]}
          rows={tables.perskill}
          className="skill-results"
          note="Initial attempts = invocations − recovery calls. First-attempt success uses initial attempts as its denominator. Condition categories are reporting labels, not measured diagnoses in these generated records. Flip is used only for the HDD."
        />
        <div className="additional-results">
          <div>
            <span className="eyebrow">A separate case</span>
            <h3>An additional HDD</h3>
            <p>
              The paper identifies another-brand HDD excluded from task-specific
              perception training. Its table is also a numerical example, so it
              does not establish transfer to an unseen device.
            </p>
            <p>
              These values are excluded from the three-device summaries above. A
              measured result would need the actual run count, target set,
              configuration, and variability.
            </p>
          </div>
          <DataTable
            title="Additional-HDD example · means only"
            headers={["Metric", "Original HDD", "Additional HDD"]}
            rows={tables["additional-hdd"]}
          />
        </div>
      </div>
    </section>
  );
}
