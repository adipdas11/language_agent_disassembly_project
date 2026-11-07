import { useEffect, useState } from "react";
import { ArrowDown, Menu, Play, X } from "lucide-react";
import { siteConfig } from "../content/research-data";
import { ComingSoon } from "./Primitives";
import { sitePath } from "../lib/site-path";

const navItems = [
  ["abstract", "Overview"],
  ["architecture", "System"],
  ["datasets", "Perception"],
  ["actions", "Actions"],
  ["results", "Results"],
  ["prompts", "Resources"],
];

export function applyAuthorMetadata(showAuthors: boolean) {
  document
    .querySelectorAll("meta[data-site-author]")
    .forEach((node) => node.remove());
  if (!showAuthors) return;
  siteConfig.authors.forEach((author) => {
    const meta = document.createElement("meta");
    meta.name = "author";
    meta.content = author.name;
    meta.dataset.siteAuthor = "true";
    document.head.appendChild(meta);
  });
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("abstract");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -65%", threshold: [0.01, 0.25] },
    );
    navItems.forEach(([id]) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="UNMAKE home">
        <span className="brand-symbol" aria-hidden="true">
          ↗
        </span>
        <span>
          UNMAKE<span className="brand-period">.</span>
        </span>
      </a>
      <button
        className="menu-toggle"
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="primary-navigation"
        aria-label="Toggle navigation"
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      <nav
        id="primary-navigation"
        className={open ? "nav-open" : ""}
        aria-label="Research sections"
      >
        {navItems.map(([id, label]) => (
          <a
            key={id}
            className={active === id ? "active" : ""}
            aria-current={active === id ? "location" : undefined}
            href={`#${id}`}
            onClick={() => setOpen(false)}
          >
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function AuthorCards() {
  if (!siteConfig.showAuthors) return null;
  return (
    <div className="author-block">
      <div className="authors" aria-label="Authors">
        {siteConfig.authors.map((author) => {
          const email = `${author.email.local}@${author.email.domain}`;
          const href = `mailto:${email}`;
          return (
            <article className="author" key={author.name}>
              <strong>{author.name}</strong>
              <a href={href} aria-label={`Email ${author.name}`}>
                {email}
              </a>
            </article>
          );
        })}
      </div>
      <p className="shared-affiliation">
        School of Engineering and Physical Sciences
        <br />
        Heriot-Watt University, Edinburgh, UK
      </p>
    </div>
  );
}

export function Hero() {
  return (
    <section
      className="hero hero-title-page"
      id="top"
      aria-labelledby="hero-title"
    >
      <div className="hero-title-content">
        <div className="hero-overline">
          <span /> Observe. Reason. Disassemble.
        </div>
        <h1 id="hero-title" aria-label={siteConfig.title}>
          <span className="project-wordmark">
            UN<span>MAKE</span>
            <i>.</i>
          </span>
          <span className="project-subtitle">
            Language-Agent-Guided Adaptive
            <br className="desktop-break" /> Dual-Arm Robotic Disassembly
          </span>
        </h1>
        <p className="hero-summary">
          Two arms. Three skills. A plan that evolves with the device.
        </p>
        <AuthorCards />
        <div
          className="hero-actions hero-title-actions"
          aria-label="Project resources and page shortcuts"
        >
          <ComingSoon label="Paper" />
          <ComingSoon label="Code" />
          <a className="button button-primary" href="#video">
            <Play aria-hidden="true" /> Watch experiment
          </a>
        </div>
      </div>
      <div className="identity-strip" aria-label="Research institutions">
        <div className="identity-logo">
          <img
            src={sitePath("/assets/heriot-watt-university.png")}
            alt="Heriot-Watt University"
          />
        </div>
        <div className="identity-logo">
          <img
            src={sitePath("/assets/national-robotarium.png")}
            alt="The National Robotarium"
          />
        </div>
        <div className="identity-logo">
          <img src={sitePath("/assets/arm2-lab.svg")} alt="ARM squared Lab" />
        </div>
      </div>
      <a
        href="#abstract"
        className="hero-scroll"
        aria-label="Scroll to the overview"
      >
        <ArrowDown />
      </a>
    </section>
  );
}
