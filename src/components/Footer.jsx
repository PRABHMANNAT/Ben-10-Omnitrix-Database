import { FiArrowUp, FiArrowUpRight, FiGithub, FiStar } from 'react-icons/fi';
import { OmnitrixMark } from './Header';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-about">
          <div className="footer-brand"><OmnitrixMark /><span>omnipedia<span>.</span></span></div>
          <p>A field guide for every transformation.<br />Built for the Ben 10 community.</p>
        </div>
        <div className="creator-credit">
          <span className="eyebrow">BUILT BY</span>
          <span className="creator-name">Prabhmannat Singh</span>
          <p>Full-Stack Developer · AIML Engineer</p>
          <a href="https://github.com/PRABHMANNAT" target="_blank" rel="noreferrer" aria-label="View Prabhmannat Singh's GitHub profile"><FiGithub />@PRABHMANNAT<FiArrowUpRight /></a>
        </div>
        <div className="footer-support">
          <span className="eyebrow">KEEP THE ARCHIVE GROWING</span>
          <a className="footer-star" href="https://github.com/PRABHMANNAT/Ben-10-Omnitrix-Database" target="_blank" rel="noreferrer"><FiStar />Star on GitHub<FiArrowUpRight /></a>
          <span>Made for fans, by a fan.</span>
        </div>
      </div>
      <div className="footer-bottom">
        <p>Independent fan project. Ben 10 characters and artwork belong to Cartoon Network / Man of Action.</p>
        <div className="footer-utility"><span>BLACK EDITION · VOL. 01</span><button onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>Back to top <FiArrowUp /></button></div>
      </div>
    </footer>
  );
}
