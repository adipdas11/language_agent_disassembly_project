import { ExternalLink } from 'lucide-react'
import { limitations, siteConfig } from '../content/research-data'
import { SectionHeader } from './Primitives'

export function VideoSection() {
  return (
    <section className="section section-tint-blue" id="video" aria-labelledby="video-title">
      <div className="section-shell">
        <SectionHeader id="video-title" eyebrow="The experiment" title="Watch the complete disassembly" intro="The recording shows the complete physical experiment across HDD, Mini PC, and Laptop tasks. Watch how the arms remove fasteners, extract components, and reorient the device between observations." />
        <div className="video-shell">
          <iframe src="https://www.youtube-nocookie.com/embed/lEE3qmOJsXo" title="Adaptive dual-arm robotic disassembly experiment video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
          <a href="https://youtu.be/lEE3qmOJsXo" target="_blank" rel="noreferrer">Open directly on YouTube <ExternalLink aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  )
}

export function LimitationsSection() {
  return (
    <section className="section section-tint-blue limitations" id="limitations" aria-labelledby="limitations-title">
      <div className="section-shell">
        <SectionHeader id="limitations-title" eyebrow="Scope & limitations" title="Understanding the evaluation" intro="The results describe an integrated system tested on the device instances used in this study. The points below explain the limits of that evaluation and what broader testing would need to establish." />
        <ol>{limitations.map((limitation, index) => <li key={limitation}><span>{String(index + 1).padStart(2, '0')}</span><p>{limitation}</p></li>)}</ol>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-bottom"><span>{siteConfig.shortTitle}</span><a href="#top">Back to top ↑</a></div>
    </footer>
  )
}
