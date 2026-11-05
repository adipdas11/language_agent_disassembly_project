import { Fragment, useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { PromptSection } from '../content/research-data'
import { CopyButton, SectionHeader } from './Primitives'
import { sitePath } from '../lib/site-path'

export function parsePromptFile(text: string): PromptSection[] {
  const blocks = text.split(/^## /gm).map((block) => block.trim()).filter(Boolean)
  return blocks.map((block) => {
    const [heading, maybeSource, ...body] = block.split('\n')
    const sourceMatch = maybeSource?.match(/^\[source:\s*(.+)]$/)
    const source = sourceMatch?.[1] ?? 'Implementation prompt'
    const bodyLines = sourceMatch ? body : [maybeSource, ...body]
    return { title: heading.trim(), source, body: bodyLines.join('\n').trim() }
  }).filter((section) => section.title && section.body)
}

function HighlightedCode({ text }: { text: string }) {
  const pattern = /({[^}\n]+})/g
  const parts = text.split(pattern)
  return <>{parts.map((part, index) => {
    const placeholder = pattern.test(part)
    pattern.lastIndex = 0
    return placeholder ? <mark className="placeholder" key={index}>{part}</mark> : <Fragment key={index}>{part}</Fragment>
  })}</>
}

export function PromptExplorer() {
  const [sections, setSections] = useState<PromptSection[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let alive = true
    fetch(sitePath('/content/system-prompts.txt'))
      .then((response) => {
        if (!response.ok) throw new Error('Prompt file unavailable')
        return response.text()
      })
      .then((text) => {
        if (!alive) return
        const parsed = parsePromptFile(text)
        if (!parsed.length) throw new Error('Prompt file empty')
        setSections(parsed)
        setStatus('ready')
      })
      .catch(() => alive && setStatus('error'))
    return () => { alive = false }
  }, [])

  return (
    <section className="section" id="prompts" aria-labelledby="prompts-title">
      <div className="section-shell">
        <SectionHeader id="prompts-title" eyebrow="06 / Research resources" title="Inside the agent’s instructions" intro="These templates define the agent’s mission, current-state context, reasoning, planning, and action output. Highlighted placeholders are filled with the latest observations, verified history, and available skills at runtime." />
        {status === 'loading' && <p role="status">Loading prompt file…</p>}
        {status === 'error' && <div className="prompt-error" role="alert"><AlertCircle aria-hidden="true" /><div><strong>Prompt file unavailable</strong><p>The prompt library could not load <code>/content/system-prompts.txt</code>. The rest of the research site remains available.</p></div></div>}
        <div className="prompt-list">
          {sections.map((section) => (
            <article className="prompt-template" key={section.title}>
              <header><h3>{section.title}</h3><CopyButton value={section.body} label={`Copy ${section.title}`} /></header>
              <div className="prompt-body">
                <pre className="wrap"><code><HighlightedCode text={section.body} /></code></pre>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
