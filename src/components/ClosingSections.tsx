import { ArrowUpRight, ExternalLink } from "lucide-react";
import { sitePath } from "../lib/site-path";
import { SectionHeader } from "./Primitives";

export function VideoSection() {
  return (
    <section
      className="experiment-section"
      id="video"
      aria-labelledby="video-title"
    >
      <div className="section-shell">
        <div className="film-heading">
          <h2 id="video-title">From observation to physical action.</h2>
          <span>
            <i /> The robot, in action
          </span>
        </div>
        <div className="experiment-film">
          <video
            controls
            muted
            playsInline
            preload="metadata"
            poster={sitePath("/assets/experiment-poster.webp")}
            aria-label="UNMAKE physical disassembly experiment"
          >
            <source src={sitePath("/assets/experiment.mp4")} type="video/mp4" />
            <p>
              Your browser does not support this video.{" "}
              <a href="https://youtu.be/lEE3qmOJsXo?t=21">
                Watch the experiment on YouTube.
              </a>
            </p>
          </video>
        </div>
        <div className="film-caption">
          <p>
            HDD · Mini PC · Laptop{" "}
            <span>— original demonstration playback speed</span>
          </p>
          <a
            href="https://youtu.be/lEE3qmOJsXo?t=21"
            target="_blank"
            rel="noreferrer"
          >
            Original recording <ExternalLink aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

export function LimitationsSection() {
  return (
    <section
      className="section scope-section"
      id="limitations"
      aria-labelledby="limitations-title"
    >
      <div className="section-shell scope-layout">
        <SectionHeader
          id="limitations-title"
          eyebrow="07 / Scope & next steps"
          title={
            <>
              What comes <em>next.</em>
            </>
          }
          intro="This framework studies task-level decisions on a physical dual-arm cell. Broader validation needs more device units, independent perception splits, and verified trial records."
        />
        <div className="scope-points">
          <article>
            <span>01</span>
            <h3>More devices</h3>
            <p>
              The original study uses one unit per class. Training images
              include these three units; an additional HDD is discussed
              separately.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Stronger comparisons</h3>
            <p>
              A state-aware non-LLM baseline, component ablations, and measured
              recovery traces would clarify which parts of the system drive
              improvements.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>A wider skill library</h3>
            <p>
              Cable disconnection, clip release, and adhesive removal would
              extend operation beyond the three programmed skills.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <a className="footer-wordmark" href="#top">
        UNMAKE<span>.</span>
      </a>
      <p>Language-Agent-Guided Adaptive Dual-Arm Robotic Disassembly</p>
      <a href="#top">
        Back to top <ArrowUpRight aria-hidden="true" />
      </a>
    </footer>
  );
}
