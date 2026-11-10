import { Fragment, useEffect, useState } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import type { PromptSection } from "../content/research-data";
import interfaces from "../content/paper-interfaces.json";
import { readableJson } from "../content/world-state";
import { CopyButton, SectionHeader } from "./Primitives";
import { sitePath } from "../lib/site-path";

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
          intro="The system instruction and skill descriptions are fixed context. The reasoning stage reads the current state; the action stage formats the selected decision as a validated skill request. The text and JSON examples below come from V11."
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
