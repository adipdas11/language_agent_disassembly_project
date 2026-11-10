import { Fragment, useEffect, useState } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import type { PromptSection } from "../content/research-data";
import interfaces from "../content/paper-interfaces.json";
import { readableJson } from "../content/world-state";
import { CopyButton, SectionHeader } from "./Primitives";
import { sitePath } from "../lib/site-path";

const descriptions: Record<string, string> = {
  "System instruction": "Defines the task and keeps decisions grounded in the supplied observations and available skills.",
  "Available skills": "Describes what each skill can do and the conditions needed to use it.",
  "Reasoning and selection": "Turns the current world state into one proposed action, with a short justification and confidence value.",
  "Action formatting": "Converts the selected action into a structured skill request, including verification and failure handling.",
};

export function parsePromptFile(text: string): PromptSection[] {
  return text
    .split(/^## /gm)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [heading, maybeSource, ...body] = block.split("\n");
      const match = maybeSource?.match(/^\[source:\s*(.+)]$/);
      return {
        title: heading.trim(),
        source: match?.[1] ?? "Implementation prompt",
        body: (match ? body : [maybeSource, ...body]).join("\n").trim(),
      };
    })
    .filter((section) => section.title && section.body);
}
function PromptText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\{[^}\n]+\})/g).map((part, index) =>
        part.startsWith("{") ? (
          <mark className="placeholder" key={index}>
            {part}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}
export function PromptExplorer() {
  const [sections, setSections] = useState<PromptSection[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  useEffect(() => {
    let alive = true;
    fetch(sitePath("/content/system-prompts.txt"))
      .then((response) => {
        if (!response.ok) throw new Error("Prompt unavailable");
        return response.text();
      })
      .then((text) => {
        if (!alive) return;
        const parsed = parsePromptFile(text);
        if (!parsed.length) throw new Error("Empty prompts");
        setSections(parsed);
        setStatus("ready");
      })
      .catch(() => alive && setStatus("error"));
    return () => {
      alive = false;
    };
  }, []);
  return (
    <section
      className="section section-tint-blue"
      id="prompts"
      aria-labelledby="prompts-title"
    >
      <div className="section-shell">
        <SectionHeader
          id="prompts-title"
          title="Agent instructions"
          intro="These prompts define how the agent turns the world state into a skill request. Fixed instructions describe the task and skills; the reasoning and action stages use the latest observations to choose and format the next step. The full prompt text and example responses follow the paper."
        />
        <div className="prompt-flow">
          <span>World state</span>
          <ArrowRight />
          <span>Decision</span>
          <ArrowRight />
          <span>Skill request</span>
          <ArrowRight />
          <span>Verified feedback</span>
        </div>
        {status === "loading" && <p role="status">Loading prompt file…</p>}
        {status === "error" && (
          <div className="prompt-error" role="alert">
            <AlertCircle />
            Prompt file unavailable
          </div>
        )}
        <div className="prompt-list">
          {sections.map((section) => {
            const response =
              section.title === "Reasoning and selection"
                ? interfaces.reasoning_response
                : section.title === "Action formatting"
                  ? interfaces.action_response
                  : null;
            return (
              <article
                className={`prompt-template ${response ? "prompt-with-response" : ""}`}
                key={section.title}
              >
                <header>
                  <h3>{section.title}</h3>
                  <CopyButton
                    value={section.body}
                    label={`Copy ${section.title}`}
                  />
                </header>
                {descriptions[section.title] && (
                  <p className="prompt-description">{descriptions[section.title]}</p>
                )}
                <div className="prompt-layout">
                  <div className="prompt-body">
                    <div className="prompt-prose">
                      <PromptText text={section.body} />
                    </div>
                  </div>
                  {response && (
                    <div className="prompt-response">
                      <div>
                        <h4>
                          {section.title === "Action formatting"
                            ? "Skill request"
                            : "Decision response"}
                        </h4>
                        <CopyButton
                          value={JSON.stringify(response, null, 2)}
                          label={`Copy ${section.title === "Action formatting" ? "skill request" : "decision response"}`}
                        />
                      </div>
                      <pre>
                        <code>{readableJson(response)}</code>
                      </pre>
                      <p>Illustrative interface example.</p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
