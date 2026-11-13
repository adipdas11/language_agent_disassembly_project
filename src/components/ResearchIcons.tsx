import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>
export type ArtworkKind = 'perception' | 'state' | 'context' | 'agent' | 'skills' | 'execution'

// Purpose-specific vector symbols stay readable at small diagram sizes.
const tones: Record<ArtworkKind, string> = {
  perception: '#2454dc', state: '#087c78', context: '#7350b7',
  agent: '#7040b9', skills: '#567822', execution: '#086da2',
}
const glyphs: Record<ArtworkKind, ReactNode> = {
  perception: <><rect x="3" y="8" width="26" height="17" rx="4" fill="currentColor" fillOpacity=".1" /><rect x="3" y="8" width="26" height="17" rx="4" /><circle cx="12" cy="16.5" r="4.5" /><circle cx="23" cy="16.5" r="2" fill="currentColor" /><path d="M11 5h10M12 28h8" /></>,
  state: <><path d="m4 10 12-6 12 6-12 6z" fill="currentColor" fillOpacity=".13" /><path d="m4 10 12-6 12 6-12 6zM4 16l12 6 12-6M4 22l12 6 12-6" /></>,
  context: <><rect x="8" y="4" width="20" height="23" rx="3" fill="currentColor" fillOpacity=".1" /><rect x="4" y="8" width="20" height="21" rx="3" fill="white" /><rect x="4" y="8" width="20" height="21" rx="3" /><path d="M10 3h15a4 4 0 0 1 4 4v15M9 14h10M9 19h10M9 24h6" /></>,
  agent: <><rect x="8" y="8" width="16" height="16" rx="4" fill="currentColor" fillOpacity=".1" /><rect x="8" y="8" width="16" height="16" rx="4" /><path d="M12 3v5m8-5v5M12 24v5m8-5v5M3 12h5m-5 8h5m16-8h5m-5 8h5" /><circle cx="16" cy="16" r="3.5" fill="currentColor" stroke="none" /></>,
  skills: <><path d="m5 5 5-2 5 5-2 5-5 2-5-5z" fill="currentColor" fillOpacity=".12" /><path d="m5 5 5-2 5 5-2 5-5 2-5-5zM13 13l13 13M21 5v7l5 5m3-9-8-3m5 12 3-3M5 21l6 6" /><path d="m3 23 4-4 6 6-4 4z" fill="currentColor" fillOpacity=".15" /></>,
  execution: <><path d="M3 27h26M6 27V15l6-7 4 3-6 7v9M26 27V15l-6-7-4 3 6 7v9" fill="currentColor" fillOpacity=".08" /><path d="M3 27h26M6 25V15l6-7 4 3-6 7v7M26 25V15l-6-7-4 3 6 7v7M16 11v6m-2 0h4" /><circle cx="7" cy="15" r="2" fill="white" /><circle cx="25" cy="15" r="2" fill="white" /><rect x="13" y="23" width="6" height="4" rx="1" fill="currentColor" /></>,
}

export function ResearchArtwork({ kind, className = '', style, ...props }: IconProps & { kind: ArtworkKind }) {
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props} style={{ color: tones[kind], ...style }} className={`research-artwork artwork-${kind} ${className}`}>
    {glyphs[kind]}
  </svg>
}

function artwork(kind: ArtworkKind) {
  return function Artwork(props: IconProps) { return <ResearchArtwork kind={kind} {...props} /> }
}

export const Camera = artwork('perception')
export const ScanLine = Camera
export const Database = artwork('state')
export const FileJson2 = Database
export const Layers = artwork('context')
export const ClipboardList = Layers
export const BrainCircuit = artwork('agent')
export const Sparkles = BrainCircuit
export const Wrench = artwork('skills')
export const Grip = artwork('execution')

/** Compact custom hardware symbols remain crisp where a rendered illustration is too small. */
export function Activity(props: IconProps) {
  return <svg viewBox="0 0 32 32" aria-hidden="true" {...props} className={`research-symbol ${props.className ?? ''}`}>
    <path d="M5 13v10c0 4 22 4 22 0V13" fill="#23446a" />
    <ellipse cx="16" cy="13" rx="11" ry="5" fill="#0fb7be" />
    <ellipse cx="16" cy="12" rx="6" ry="2.5" fill="#d9faff" />
    <path d="M5 19c5 3 17 3 22 0" fill="none" stroke="#82e4de" strokeWidth="1.5" />
    <path d="M16 2v7m-3-4 3-3 3 3" fill="none" stroke="#245bd8" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="23" r="1.3" fill="#c8ed5c" /><circle cx="23" cy="23" r="1.3" fill="#c8ed5c" />
  </svg>
}
export function Crosshair(props: IconProps) {
  return <svg viewBox="0 0 32 32" aria-hidden="true" {...props} className={`research-symbol ${props.className ?? ''}`}>
    <path d="M11 2h10v10l-3 4h-4l-3-4z" fill="#23446a" /><path d="M14 12h4v8h-4z" fill="#0fb7be" />
    <ellipse cx="16" cy="24" rx="8" ry="4.5" fill="#78cfde" stroke="#146b7e" strokeWidth="1.5" /><path d="m12 24 8-1m-4-2 1 5" stroke="#173e57" strokeWidth="2" />
    <path d="M3 13v-5h5m16 0h5v5M3 24v5h5m16 0h5v-5" fill="none" stroke="#245bd8" strokeWidth="2" strokeLinecap="round" />
  </svg>
}
export function ShieldCheck(props: IconProps) {
  return <svg viewBox="0 0 32 32" aria-hidden="true" {...props} className={`research-symbol ${props.className ?? ''}`}>
    <rect x="3" y="4" width="23" height="23" rx="5" fill="#d8f4e9" stroke="#08786a" strokeWidth="1.6" />
    <path d="m8 15 5 5 10-11" fill="none" stroke="#08786a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="21" y="21" width="8" height="8" rx="2" fill="#b7e340" stroke="#51791c" strokeWidth="1.2" /><path d="M23 25h4m-2-2v4" stroke="#51791c" strokeWidth="1.1" />
  </svg>
}
export const CheckCircle2 = ShieldCheck
export function Code2(props: IconProps) {
  return <svg viewBox="0 0 32 32" aria-hidden="true" {...props} className={`research-symbol ${props.className ?? ''}`}>
    <rect x="6" y="3" width="20" height="24" rx="4" fill="#e8e2ff" stroke="#6542aa" strokeWidth="1.5" />
    <path d="M11 10h10m-10 5h5m-5 5h10" stroke="#7752c7" strokeWidth="2" strokeLinecap="round" /><path d="M10 27v3m6-3v3m6-3v3" stroke="#13b9be" strokeWidth="2.4" />
    <path d="m20 14 7 4-7 4" fill="#2b65e5" stroke="#2b65e5" strokeLinejoin="round" />
  </svg>
}
export const Braces = Code2
export function RefreshCw(props: IconProps) {
  return <svg viewBox="0 0 32 32" aria-hidden="true" {...props} className={`research-symbol ${props.className ?? ''}`}>
    <rect x="2" y="9" width="8" height="16" rx="2" fill="#d9e8ff" stroke="#245bd8" strokeWidth="1.5" /><circle cx="6" cy="15" r="2" fill="#245bd8" />
    <path d="m12 13 8-4 8 4v11l-8 4-8-4z" fill="#d4f7ef" stroke="#0f7c76" strokeWidth="1.5" /><path d="m12 13 8 4 8-4m-8 4v11" fill="none" stroke="#0f7c76" strokeWidth="1.5" />
    <path d="M7 4h17m-3-3 4 3-4 3" fill="none" stroke="#7950c2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}

/** Familiar action controls are drawn here, without a third-party icon library. */
function control(path: string, fill = false) {
  return function Control(props: IconProps) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={path} fill={fill ? 'currentColor' : 'none'} /></svg> }
}
export const ArrowRight = control('M4 12h15m-5-5 5 5-5 5')
export const ArrowLeft = control('M20 12H5m5-5-5 5 5 5')
export const ArrowDown = control('M12 4v15m-5-5 5 5 5-5')
export const ChevronLeft = control('m14 6-6 6 6 6')
export const ChevronRight = control('m10 6 6 6-6 6')
export const ChevronDown = control('m6 9 6 6 6-6')
export const Play = control('m9 5 10 7-10 7z', true)
export const Pause = control('M8 5h2v14H8zM15 5h2v14h-2z', true)
export const RotateCcw = control('M5 8a8 8 0 1 1-1 8M4 4v5h5')
export const Check = control('m5 12 5 5L20 7')
export const Clipboard = control('M8 5H5v16h14V5h-3M9 3h6v4H9zM9 12h6m-6 4h6')
export const X = control('m6 6 12 12M18 6 6 18')
export const Menu = control('M4 6h16M4 12h16M4 18h16')
export const ExternalLink = control('M14 4h6v6m0-6L10 14m-1-9H4v15h15v-5')
export const AlertCircle = control('M12 3 2 21h20L12 3zm0 6v5m0 3v.1')
