import { siteConfig } from "../content/research-data";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-bottom">
        <span>
          {siteConfig.shortTitle} · Adaptive dual-arm robotic disassembly
        </span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
