import { ReactNode, useEffect, useRef, useState } from 'react'
import { Check, Clipboard, Expand, X } from 'lucide-react'
import { EvidenceSource } from '../content/research-data'
import { sitePath } from '../lib/site-path'

export function SourceBadge({ source }: { source: EvidenceSource }) {
  void source
  return null
}

export function SectionHeader({ id, eyebrow, title, intro, source }: { id?: string; eyebrow: string; title: ReactNode; intro: string; source?: EvidenceSource }) {
  return (
    <div className="section-header reveal">
      <div className="eyebrow-row"><span className="eyebrow">{eyebrow}</span>{source && <SourceBadge source={source} />}</div>
      <h2 id={id}>{title}</h2>
      <p>{intro}</p>
    </div>
  )
}

export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('is-visible')
        observer.disconnect()
      }
    }, { threshold: 0.12 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>
}

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }
  return (
    <button className="icon-button" type="button" onClick={copy} aria-label={copied ? 'Copied' : label}>
      {copied ? <Check aria-hidden="true" /> : <Clipboard aria-hidden="true" />}
      <span>{copied ? 'Copied' : label}</span>
    </button>
  )
}

export function Figure({ src, original, alt, caption, contain = false }: { src: string; original?: string; alt: string; caption: string; contain?: boolean }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('modal-open')
    }
  }, [open])
  return (
    <>
      <figure className="research-figure">
        <button type="button" className="figure-button" onClick={() => setOpen(true)} aria-label={`Open full-size figure: ${caption}`}>
          <img className={contain ? 'contain' : ''} src={sitePath(src)} alt={alt} loading="lazy" />
          <span className="expand-label"><Expand aria-hidden="true" /> Expand figure</span>
        </button>
        <figcaption>{caption}</figcaption>
      </figure>
      {open && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <div className="figure-modal" role="dialog" aria-modal="true" aria-label={caption} onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setOpen(false)} autoFocus aria-label="Close figure"><X aria-hidden="true" /></button>
            <img src={sitePath(original ?? src)} alt={alt} />
            <p>{caption}</p>
          </div>
        </div>
      )}
    </>
  )
}

export function ComingSoon({ label }: { label: string }) {
  return <button type="button" className="button button-muted" disabled aria-label={`${label} — coming soon`}>{label}<span>Coming soon</span></button>
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>
}
