import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  Camera,
  Database,
  Grip,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import actionClips from "../../public/assets/actions/clips.json";
import experimentClips from "../../public/assets/architecture/clips.json";
import { sitePath } from "../lib/site-path";
import { ArchitectureClip } from "./ArchitectureClip";
import { DetectionOverlay } from "./DetectionOverlay";
import "./architecture.css";

const stages = [
  "scene",
  "state",
  "agent",
  "skills",
  "execution",
  "devices",
] as const;
const lanes = [
  { id: "global-1", name: "RF-DETR-Large", label: "Scene-level perception" },
  { id: "local-1", name: "RF-DETR-Small", label: "Local fastener perception" },
  { id: "state-2", name: "YOLOv11-Nano", label: "State verification" },
];
const skills = [
  { call: "unscrew", target: "holder_screw_03", name: "Unscrew" },
  { call: "pickup_object", target: "lid", name: "Pick-and-Extract" },
  { call: "flip_object", target: "observed_device", name: "Flip" },
];
const devices = [
  { id: "hdd", name: "HDD", steps: 11 },
  { id: "mini-pc", name: "Mini PC", steps: 9 },
  { id: "laptop", name: "Laptop", steps: 12 },
];
const execution = {
  ...experimentClips.find((clip) => clip.id === "execution")!,
  src: "/assets/architecture/execution-wide.mp4",
  poster: "/assets/architecture/execution-wide-poster.webp",
};
type Connection = { path: string; kind: "forward" | "feedback" };
type Box = { l: number; r: number; t: number; b: number; x: number; y: number };

function curvedArrow(start: number) {
  const point = (radius: number, angle: number) => {
    const radians = (angle * Math.PI) / 180;
    return `${(130 + radius * Math.cos(radians)).toFixed(2)} ${(130 + radius * Math.sin(radians)).toFixed(2)}`;
  };
  const shoulder = start + 15;
  return `M${point(101, start)} A101 101 0 0 1 ${point(101, shoulder)} L${point(109, shoulder)} L${point(96, start + 24)} L${point(83, shoulder)} L${point(91, shoulder)} A91 91 0 0 0 ${point(91, start)} Z`;
}

const reasoningArrows = Array.from({ length: 12 }, (_, index) => ({
  path: curvedArrow(-80 + index * 30),
  phase: Math.floor(index / 4),
  delay: `${index * 0.3 - 3.6}s`,
}));

function ReActLoop() {
  return (
    <div className="react-orbit">
      <svg viewBox="0 0 260 260" aria-hidden="true">
        <circle className="react-orbit-track" cx="130" cy="130" r="96" />
        {reasoningArrows.map((arrow, index) => (
          <path
            key={index}
            d={arrow.path}
            className={`react-arrow-segment react-arrow-phase-${arrow.phase}`}
            style={{ animationDelay: arrow.delay }}
          />
        ))}
      </svg>
      <span className="flow-phase phase-0">Observe</span>
      <span className="flow-phase phase-1">Think</span>
      <span className="flow-phase phase-2">Act</span>
      <div className="react-centre">
        <strong>ReAct</strong>
        <span>Language agent</span>
      </div>
    </div>
  );
}

export function AnimatedArchitectureDiagram() {
  const [playing, setPlaying] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(0);
  const [manualSkill, setManualSkill] = useState(false);
  const [connections, setConnections] = useState({
    width: 1200,
    height: 700,
    lines: [] as Connection[],
  });
  const board = useRef<HTMLDivElement>(null);
  const running = playing && visible && pageVisible;
  const active = stages[step];
  const skill = skills[selected];
  const verified = step === 5;
  const stateText = `{
  "global_view": { "detections": ["lid", "screw"] },
  "local_view": { "alignment": "aligned" },
  "assembly_state": {
    "last_action": ${verified ? `"${skill.call}"` : "null"},
    "last_outcome": ${verified ? '"success"' : "null"}
  },
  "force_torque": { "force_n": [0.0, 0.0, -0.2] }
}`;

  useEffect(() => {
    const target = board.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.01 },
    );
    observer.observe(target);
    const onVisibility = () => setPageVisible(!document.hidden);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => {
      if (media.matches) setPlaying(false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    media.addEventListener("change", onMotion);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      media.removeEventListener("change", onMotion);
    };
  }, []);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(
      () => setStep((value) => (value + 1) % stages.length),
      3200,
    );
    return () => window.clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (!running || manualSkill) return;
    const timer = window.setInterval(
      () => setSelected((value) => (value + 1) % skills.length),
      stages.length * 3200,
    );
    return () => window.clearInterval(timer);
  }, [running, manualSkill]);
  useEffect(() => {
    const element = board.current;
    if (!element) return;
    const measure = () => {
      const parent = element.getBoundingClientRect();
      const boxes: Box[] = stages.map((id) => {
        const r = element
          .querySelector(`[data-flow-panel="${id}"]`)!
          .getBoundingClientRect();
        return {
          l: r.left - parent.left,
          r: r.right - parent.left,
          t: r.top - parent.top,
          b: r.bottom - parent.top,
          x: (r.left + r.right) / 2 - parent.left,
          y: (r.top + r.bottom) / 2 - parent.top,
        };
      });
      const lines: Connection[] = boxes.slice(0, -1).map((a, i) => {
        const b = boxes[i + 1];
        // Adjacent figure columns: the elbow stays in their shared gutter.
        if (b.l > a.r && b.t < a.b) {
          const startY = a.y;
          const endY = b.y;
          const gutter = (a.r + b.l) / 2;
          return {
            path: `M${a.r + 4},${startY} H${gutter} V${endY} H${b.l - 8}`,
            kind: "forward",
          };
        }
        if (Math.abs(a.x - b.x) < 2)
          return { path: `M${a.x},${a.b + 4} V${b.t - 23}`, kind: "forward" };
        const mid = a.b + (b.t - a.b) / 2;
        return {
          path: `M${a.x},${a.b + 4} C${a.x},${mid} ${b.x},${mid} ${b.x},${b.t - 23}`,
          kind: "forward",
        };
      });
      const a = boxes[4],
        state = boxes[1],
        scene = boxes[0],
        rail = parent.width - 7;
      const bottom = Math.max(...boxes.map((box) => box.b)) + 26;
      const feedback =
        // On stacked layouts, use the outer gutter instead of crossing the
        // device evaluation row below the full-width execution video.
        state.t > scene.b || a.t > scene.b
          ? `M${a.r + 4},${a.y} H${rail - 8} Q${rail},${a.y} ${rail},${a.y - 8} V${state.y + 8} Q${rail},${state.y} ${rail - 8},${state.y} H${state.r + 8}`
          : `M${a.x},${a.b + 4} V${bottom - 8} Q${a.x},${bottom} ${a.x + 8},${bottom} H${rail - 8} Q${rail},${bottom} ${rail},${bottom - 8} V18 Q${rail},10 ${rail - 8},10 H${state.x + 8} Q${state.x},10 ${state.x},18 V${state.t - 23}`;
      lines.push({ path: feedback, kind: "feedback" });
      setConnections({ width: parent.width, height: parent.height, lines });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    element
      .querySelectorAll("[data-flow-panel]")
      .forEach((node) => observer.observe(node));
    measure();
    return () => observer.disconnect();
  }, []);

  const heading = (
    id: (typeof stages)[number],
    _number: string,
    title: string,
    Icon: typeof Camera,
  ) => (
    <h3 className="flow-heading">
      <button
        onClick={() => {
          setStep(stages.indexOf(id));
          setPlaying(false);
        }}
        aria-pressed={active === id}
      >
        <Icon aria-hidden="true" />
        {title}
      </button>
    </h3>
  );
  return (
    <div
      className={`system-diagram compact-architecture ${running ? "is-playing" : ""}`}
    >
      <div className="architecture-controls">
        <p>
          Perception-grounded planning{" "}
          <span>· animated system architecture</span>
        </p>
        <button
          className="icon-button"
          onClick={() => setPlaying((value) => !value)}
          aria-label={`${playing ? "Pause" : "Play"} architecture animation`}
        >
          {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          {playing ? "Pause animation" : "Play animation"}
        </button>
      </div>
      <div className="visual-flow-board" ref={board}>
        <svg
          className="visual-flow-connectors"
          viewBox={`0 0 ${connections.width} ${connections.height}`}
          aria-hidden="true"
        >
          <defs>
            <marker
              id="flow-arrow"
              markerUnits="userSpaceOnUse"
              viewBox="0 0 12 12"
              markerWidth="12"
              markerHeight="12"
              refX="10"
              refY="6"
              orient="auto"
            >
              <path d="M1 1 L10 6 L1 11" />
            </marker>
            <marker
              id="feedback-arrow"
              markerUnits="userSpaceOnUse"
              viewBox="0 0 12 12"
              markerWidth="12"
              markerHeight="12"
              refX="10"
              refY="6"
              orient="auto"
            >
              <path d="M1 1 L10 6 L1 11" />
            </marker>
          </defs>
          {connections.lines.map((line, index) => (
            <g
              key={index}
              className={`${line.kind} ${index === step || (line.kind === "feedback" && verified) ? "current" : ""}`}
            >
              <path
                className="connector-base"
                d={line.path}
                markerEnd={`url(#${line.kind === "feedback" ? "feedback" : "flow"}-arrow)`}
              />
              <path className="connector-pulse" d={line.path} />
            </g>
          ))}
        </svg>

        <article
          className={`flow-panel perception-panel ${active === "scene" ? "active" : ""}`}
          data-flow-panel="scene"
        >
          {heading("scene", "01", "Perception", Camera)}
          <div
            className="flow-perception-views"
            role="group"
            aria-label="Parallel perception views"
          >
            {lanes.map((lane) => (
              <div className="vision-row" key={lane.id}>
                <div className="vision-model">
                  <strong>{lane.label}</strong>
                  <span>{lane.name}</span>
                </div>
                <div className="vision-pair">
                  <div className="vision-input">
                    <img
                      src={sitePath(`/assets/vision/${lane.id}-raw.webp`)}
                      alt={`${lane.name} raw camera sample`}
                      loading="lazy"
                    />
                    <span className="flow-scanline" />
                  </div>
                  <ArrowRight
                    className="vision-transfer-arrow"
                    aria-hidden="true"
                  />
                  <div className="vision-output">
                    <img
                      src={sitePath(`/assets/vision/${lane.id}-raw.webp`)}
                      alt={`${lane.label} model output`}
                      loading="lazy"
                    />
                    <DetectionOverlay sampleId={lane.id} visible />
                  </div>
                  <span
                    className="vision-packet"
                    aria-hidden="true"
                    style={{
                      backgroundImage: `url(${sitePath(`/assets/vision/${lane.id}-raw.webp`)})`,
                    }}
                  />
                </div>
                <div className="vision-key">
                  <span>Raw image</span>
                  <span>
                    {lane.id === "state-2" ? "Contact aligned" : "Detections"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article
          className={`flow-panel state-panel ${active === "state" ? "active" : ""}`}
          data-flow-panel="state"
        >
          {heading("state", "02", "World state", Database)}
          <div className="flow-json-window">
            <pre aria-label="Illustrative world-state JSON">
              <code>{stateText}</code>
            </pre>
          </div>
          <span className="state-equation">Sₜ = {"{Oₜ, Fₜ, Eₜ, Wₜ}"}</span>
        </article>

        <article
          className={`flow-panel agent-panel ${active === "agent" ? "active" : ""}`}
          data-flow-panel="agent"
        >
          {heading("agent", "03", "Language-agent reasoning", BrainCircuit)}
          <ReActLoop />
          <div className="agent-context">
            <span>LangGraph + GPT-5.1</span>
            <code>
              {skill.call}({skill.target})
            </code>
          </div>
        </article>

        <article
          id="actions"
          className={`flow-panel skills-panel ${active === "skills" ? "active" : ""}`}
          data-flow-panel="skills"
        >
          {heading("skills", "04", "Skill library", Wrench)}
          <div
            className="parallel-skills"
            role="group"
            aria-label="Architecture skill videos"
          >
            {actionClips.map((clip, index) => (
              <article
                className={`parallel-skill ${selected === index ? "selected" : ""}`}
                key={clip.id}
              >
                <ArchitectureClip
                  {...clip}
                  label={`${clip.label} skill video`}
                  playing={running && selected === index}
                />
                <button
                  className="skill-select"
                  aria-pressed={selected === index}
                  onClick={() => {
                    setSelected(index);
                    setManualSkill(true);
                    setStep(3);
                  }}
                >
                  {skills[index].name}
                </button>
              </article>
            ))}
          </div>
          <div className="flow-interface">
            <ShieldCheck aria-hidden="true" />
            <span>Validated skill interface</span>
            <code>
              {skill.call}({skill.target})
            </code>
          </div>
        </article>

        <article
          className={`flow-panel execution-panel ${active === "execution" ? "active" : ""}`}
          data-flow-panel="execution"
        >
          {heading("execution", "05", "Dual-arm execution", Grip)}
          <div className="execution-video">
            <ArchitectureClip
              {...execution}
              label="Dual-arm execution video"
              playing={running}
            />
          </div>
        </article>

        <article
          id="devices"
          className={`flow-panel devices-panel ${active === "devices" ? "active" : ""}`}
          data-flow-panel="devices"
        >
          {heading("devices", "06", "Cross-device evaluation", RefreshCw)}
          <div
            className="parallel-devices"
            role="group"
            aria-label="Architecture device videos"
          >
            {devices.map((device) => {
              const clip = experimentClips.find(
                (item) => item.id === device.id,
              )!;
              return (
                <article className="parallel-device" key={device.id}>
                  <ArchitectureClip
                    {...clip}
                    label={`${device.id === "hdd" ? "Hard disk drive" : device.name} evaluation video`}
                    playing={running}
                  />
                  <div>
                    <h4>{device.name}</h4>
                    <span>{device.steps} target steps</span>
                  </div>
                </article>
              );
            })}
          </div>
        </article>
        <div className="feedback-label">
          <RefreshCw aria-hidden="true" />
          Verified execution feedback → world state
        </div>
      </div>
      <p className="diagram-caption">
        One shared perception stack and three programmed skills. State and
        action previews are illustrative; the video windows show real robot
        executions.
      </p>
    </div>
  );
}
