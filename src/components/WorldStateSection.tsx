import { Braces, History, Layers3 } from 'lucide-react'
import { devices, makeWorldState } from '../content/research-data'
import { CopyButton, SectionHeader } from './Primitives'

function JsonTree({ value, name }: { value: unknown; name?: string }) {
  if (value === null || typeof value !== 'object' || (Array.isArray(value) && value.every((item) => typeof item !== 'object'))) return <div className="tree-leaf"><span>{name}</span><code>{JSON.stringify(value)}</code></div>
  const entries = Object.entries(value as Record<string, unknown>)
  return <div className="tree-branch"><div className="tree-name">{name ?? 'state'} <small>{Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`}</small></div><div className="tree-children">{entries.map(([key, child]) => <JsonTree key={key} name={key} value={child} />)}</div></div>
}

export function WorldStateSection() {
  return <section className="section" id="state" aria-labelledby="state-title"><div className="section-shell">
    <SectionHeader id="state-title" eyebrow="04 / Structured state" title="A shared memory of the device" intro="Sₜ = {Oₜ, Fₜ, Eₜ}. The three device examples below use the same schema, with every field expanded." />
    <div className="schema-callouts static-schema">
      <div><Layers3 aria-hidden="true" /><strong>Oₜ · Objects</strong><span>Components, type, pose, confidence, and status.</span></div>
      <div><Braces aria-hidden="true" /><strong>Fₜ · Fasteners</strong><span>Fastener identity, type, and removal state.</span></div>
      <div><History aria-hidden="true" /><strong>Eₜ · Execution</strong><span>Verified outcomes, timestamps, and action history.</span></div>
    </div>
    <div className="parallel-states">{devices.map((device) => {
      const state = makeWorldState(device.id).paper
      return <article className="state-example" key={device.id} aria-label={`${device.label} formatted state`}><div className="panel-toolbar"><h3>{device.label}</h3><CopyButton value={JSON.stringify(state, null, 2)} label={`Copy ${device.label} state`} /></div><div className="state-display"><JsonTree value={state} /></div></article>
    })}</div>
  </div></section>
}
