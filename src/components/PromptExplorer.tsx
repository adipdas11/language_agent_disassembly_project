import { Fragment, useEffect, useState } from "react";
import { AlertCircle, ChevronDown } from "./ResearchIcons";
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
          intro="The prompt layer combines fixed task instructions with the latest world state. Reasoning selects a skill and target; action formatting prepares the request for execution. Open a reference below to inspect the templates and response fields."
        />
        <a className="prompt-animation-link" href="#state">Follow the animated planning sequence ↑</a>
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
              <details
                className={`prompt-template ${response ? "prompt-with-response" : ""}`}
                key={section.title}
              >
                <summary><span><strong>{section.title}</strong>{descriptions[section.title] && <span>{descriptions[section.title]}</span>}</span><ChevronDown aria-hidden="true" /></summary>
                <div className="prompt-layout">
                  <div className="prompt-body">
                    <CopyButton value={section.body} label={`Copy ${section.title}`} />
                    <div className="prompt-prose">
                      <PromptText text={section.body} />
                    </div>
                  </div>
                  {response && (
                    <div className="prompt-response">
                      <div>
                        <h4>
                          {section.title === "Action formatting"
                            ? "Skill request example"
                            : "Decision response example"}
                        </h4>
                        <CopyButton
                          value={JSON.stringify(response, null, 2)}
                          label={`Copy ${section.title === "Action formatting" ? "skill request" : "decision response"}`}
                        />
                      </div>
                      <pre>
                        <code>{readableJson(response)}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
