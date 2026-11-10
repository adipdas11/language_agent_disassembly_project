import type { ReactNode } from "react";
import data from "../content/manuscript-results.json";
import { SectionHeader } from "./Primitives";
const tables = data.tables;
const names = ["HDD", "Mini PC", "Laptop"];
const metricNames: Record<string, string> = {
  "R_{comp} (%)": "Autonomous completion (%)",
  "T_{cycle} (s)": "Cycle time (s)",
  "F_{step}": "Initially failed targets",
  "R_{rec} (%)": "Recovery ratio (%)",
  F_C: "Cascade failures",
  "H_{int}": "Physical assistance",
  "N_{replan}": "Replanning events",
};
const mean = (value: string) => parseFloat(value);
function NumberValue({ value }: { value: string }) {
  const [valueMean, sd] = value.split(" ± ");
  return (
    <span className="number-value">
      {valueMean}
      {sd && <small> ± {sd}</small>}
    </span>
  );
}
function Table({
  title,
  description,
  headers,
  rows,
  note,
  className = "",
}: {
  title: string;
  description?: string;
  headers: string[];
  rows: string[][];
  note?: ReactNode;
  className?: string;
}) {
  return (
    <article className={`paper-table ${className}`}>
      <table>
        <caption>
          {title}
          {description && <span className="table-description">{description}</span>}
        </caption>
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
                    {metricNames[cell] ?? cell}
                  </th>
                ) : (
                  <td data-label={headers[column]} key={column}>
                    <NumberValue value={cell} />
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
function ComparisonPlot({ time = false }: { time?: boolean }) {
  const left = 108,
    right = 516,
    scale = time ? 450 : 100;
  const x = (value: number) => left + (value / scale) * (right - left);
  const ticks = time ? [0, 100, 200, 300, 400] : [0, 25, 50, 75, 100];
  return (
    <figure className="comparison-plot">
      <figcaption>
        {time ? "Cycle time" : "Autonomous target-step completion"}
      </figcaption>
      <div className="plot-legend">
        <span className="scripted-dot" />
        Scripted
        <span className="agentic-dot" />
        Agentic
      </div>
      <svg
        viewBox="0 0 580 310"
        role="img"
        aria-label={
          time
            ? "Cycle time comparison, seconds. Agentic execution takes longer on all three devices."
            : "Autonomous target-step completion comparison, percent. Agentic completion is higher on all three devices."
        }
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={x(tick)} x2={x(tick)} y1="30" y2="260" stroke="#e5ebf3" />
            <text
              x={x(tick)}
              y="285"
              textAnchor="middle"
              className="axis-label"
            >
              {tick}
              {time ? "" : "%"}
            </text>
          </g>
        ))}
        {names.map((name, index) => {
          const baseline = tables.ablation[index * 2],
            agent = tables.ablation[index * 2 + 1],
            column = time ? 3 : 2,
            y = 60 + index * 84,
            a = x(mean(baseline[column])),
            b = x(mean(agent[column]));
          return (
            <g key={name}>
              <text x="0" y={y + 5} className="plot-device">
                {name}
              </text>
              <line
                x1={a}
                x2={b}
                y1={y}
                y2={y}
                stroke="#bed1ee"
                strokeWidth="5"
              />
              <circle cx={a} cy={y} r="5" fill="#7b8799" />
              <circle cx={b} cy={y} r="6" fill="#245bd8" />
              <text
                x={a}
                y={y + 25}
                textAnchor="middle"
                className="baseline-label"
              >
                {baseline[column]}
                {time ? " s" : "%"}
              </text>
              <text
                x={Math.min(520, b)}
                y={y - 17}
                textAnchor="middle"
                className="agent-label"
              >
                {agent[column]}
                {time ? " s" : "%"}
              </text>
            </g>
          );
        })}
      </svg>
      <p>
        {time
          ? "Elapsed time per trial; higher completion comes with longer execution."
          : "Completed autonomous targets divided by the fixed task size."}{" "}
        Labels show mean ± sample SD.
      </p>
    </figure>
  );
}
export function ResultsSection() {
  return (
    <section className="section" id="results" aria-labelledby="results-title">
      <div className="section-shell">
        <SectionHeader
          id="results-title"
          title="Experimental results"
          intro="The experiments compare a fixed scripted action order with an agentic controller that chooses the next skill from the updated world state. We measure how much each system completes autonomously, how it handles failures, and how long execution takes."
        />
        <div className="results-subheading">
          <h3>Task completion and time</h3>
          <p>
            The 45-trial comparison includes five scripted and ten agentic runs
            per device, using the same hardware, perception, motion planning,
            and skills. Each chart pairs the two controllers; labels show the
            average and variation across trials (mean ± sample SD).
          </p>
        </div>
        <div className="results-summary">
          <p>
            <strong>58.1% → 89.7%</strong>
            <span>Mean autonomous completion</span>
          </p>
          <p>
            <strong>90.0% lower</strong>
            <span>Mean cascade-failure count</span>
          </p>
          <p>
            <strong>258.0 → 315.3 s</strong>
            <span>Mean cycle time · +22.2%</span>
          </p>
        </div>
        <div className="comparison-plots">
          <ComparisonPlot />
          <ComparisonPlot time />
        </div>
        <div className="results-context">
          <p>
            The completion gain is <strong>31.6 percentage points</strong>.
            The agentic controller completes more targets on every device,
            with longer cycle times. The headline averages give each device
            equal weight and assess planning, verification, and recovery together.
          </p>
        </div>
        <div className="results-subheading">
          <h3>Failures and recovery</h3>
          <p>
            These tables separate initially failed targets, autonomous recovery,
            failures that spread to later steps, and physical assistance.
            Lower failure and assistance counts are better; a higher recovery
            ratio means more successful recovery per failed invocation.
          </p>
        </div>
        <div className="device-results">
          {names.map((name, index) => {
            const base = tables.ablation[index * 2],
              agent = tables.ablation[index * 2 + 1],
              replan = tables.generalisation[index][8];
            return (
              <Table
                key={name}
                title={`${name} · execution outcomes`}
                headers={["Metric", "Scripted", "Agentic"]}
                rows={[
                  ["Initially failed targets", base[4], agent[4]],
                  ["Recovery ratio (%)", base[5], agent[5]],
                  ["Cascade failures", base[6], agent[6]],
                  ["Physical assistance", base[7], agent[7]],
                  ["Replanning events", "n/a", replan],
                ]}
                note={`Means ± sample SD per trial. Recovery uses ${[8, 8, 9][index]} eligible agentic trials.`}
              />
            );
          })}
        </div>
        <div className="metric-notes">
          <p>
            <strong>Recovery:</strong> autonomously recovered targets divided by
            all failed full invocations, averaged over trials with failures. The
            paper reports a device-averaged ratio of 84.0%.
          </p>
          <p>
            <strong>Cascade failures:</strong> an unresolved earlier step makes
            a later target inaccessible or invalid, such as lifting a lid while
            a screw is still seated.
          </p>
          <p>
            <strong>Assistance:</strong> assisted targets contribute neither to
            autonomous completion nor to recovery. Initial deviations and
            subsequent recovery calls are counted separately.
          </p>
          <p>
            <strong>Replanning:</strong> new recovery calls and other changes to
            the remaining task sequence. Corrections inside a skill and routine
            progression to the next target are excluded.
          </p>
        </div>
        <div className="additional-hdd">
          <div>
            <h3>Additional HDD</h3>
            <p>
              This separate test checks transfer to a different-brand HDD
              excluded from global-camera detector training. Across ten
              further agentic trials, it achieved 90.9%
              mean autonomous completion and 88.9% mean recovery. This case is
              separate from the three-device aggregate.
            </p>
            <p className="small-note">
              Only the agentic controller was tested on this unit. Recovery
              statistics use nine eligible trials.
            </p>
          </div>
          <Table
            title="HDD comparison"
            headers={["Metric", "Original HDD", "Additional HDD"]}
            rows={tables.additional_hdd}
            note="Ten trials per device; mean ± sample SD."
          />
        </div>
        <div className="results-subheading">
          <h3>Skill execution</h3>
          <p>
            An invocation is one complete request to unscrew, extract, or flip.
            Initial success measures completion on the first invocation;
            recovery calls are additional requests for the same target. The
            table separates these calls from corrections performed inside a skill.
          </p>
        </div>
        <Table
          title="Per-skill performance"
          headers={[
            "Device",
            "Skill",
            "Invocations",
            "Initial success",
            "Initial success %",
            "Recovery calls",
            "Duration (s)",
          ]}
          rows={tables.perskill}
          className="skill-table"
          note="Initial success is S₀/N₀. A complete initial invocation may include internal alignment or contact corrections. Counts span ten trials per device; duration is mean ± sample SD."
        />
        <div className="results-subheading">
          <h3>Perception performance</h3>
          <p>
            Precision measures how often predictions are correct; recall
            measures how many labelled objects are found. Average precision
            (AP) summarises detection quality, with AP@0.5:0.95 requiring tighter
            box overlap. The classifier is evaluated by correct state labels.
          </p>
        </div>
        <div className="perception-metrics">
          <Table
            title="RF-DETR-Large"
            description="Global camera: component and fastener detection across the device."
            headers={[
              "Class",
              "Precision %",
              "Recall %",
              "AP@0.5 %",
              "AP@0.5:0.95 %",
            ]}
            rows={tables.vision_det}
          />
          <div>
            <Table
              title="RF-DETR-Small"
              description="Tool camera: local detection for screwdriver and fastener alignment."
              headers={[
                "Class",
                "Precision %",
                "Recall %",
                "AP@0.5 %",
                "AP@0.5:0.95 %",
              ]}
              rows={tables.vision_local}
            />
            <Table
              title="YOLOv11-Nano"
              description="Verification: classifies aligned contact, misaligned contact, or a removed component."
              headers={["Class", "Samples", "Correct", "Accuracy %", "Errors"]}
              rows={tables.vision_cls.map((row) => [
                row[0].replaceAll("_", " "),
                ...row.slice(1),
              ])}
            />
          </div>
        </div>
        <p className="results-split-note">
          Perception scores use a 70/20/10 development split made after
          augmentation. Related image variants occur across partitions, so
          these scores do not measure independent unseen-image generalisation.
        </p>
      </div>
    </section>
  );
}
