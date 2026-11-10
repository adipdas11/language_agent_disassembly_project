import { siteConfig } from "../content/research-data";
import { SectionHeader } from "./Primitives";

export function ConclusionSection() {
  return (
    <section className="section conclusion-section" id="conclusion" aria-labelledby="conclusion-title">
      <div className="section-shell">
        <SectionHeader
          id="conclusion-title"
          title="Conclusion"
          intro="Structured world states connect perception, task planning, and verified execution. Across the three original devices, the combined agentic system improves autonomous completion and reduces failure propagation, with longer cycle times than fixed scripted sequencing."
        />
        <p className="conclusion-next">
          The same perception stack and three programmed skills support these
          tasks without a supplied device-specific action sequence. Broader
          evaluation and additional skills—such as cable disconnection, clip
          release, and adhesive removal—are directions for future work.
        </p>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-bottom">
        <span>
          {siteConfig.shortTitle}
        </span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
