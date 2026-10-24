import { FiArrowUp, FiArrowUpRight, FiGithub, FiStar } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-about">
        <span className="footer-brand">omnipedia.</span>
        <p>An independent archive for the Ben 10 universe.<br />Characters belong to Cartoon Network / Man of Action.</p>
      </div>
      <div className="creator-credit">
        <span className="eyebrow">CREATED BY</span>
        <span className="creator-name">Prabhmannat Singh</span>
        <p>Full-Stack Developer · AIML Engineer</p>
        <a href="https://github.com/PRABHMANNAT" target="_blank" rel="noreferrer" aria-label="View Prabhmannat Singh's GitHub profile"><FiGithub />@PRABHMANNAT<FiArrowUpRight /></a>
      </div>
      <div className="footer-links">
        <a className="footer-star" href="https://github.com/PRABHMANNAT/Ben-10-Omnitrix-Database" target="_blank" rel="noreferrer"><FiStar />Star on GitHub<FiArrowUpRight /></a>
        <button onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>Back to top <FiArrowUp /></button>
        <span>BLACK EDITION · VOL. 01</span>
      </div>
    </footer>
  );
}
