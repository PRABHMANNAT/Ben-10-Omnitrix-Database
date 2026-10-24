import { FiArrowUp, FiArrowUpRight } from 'react-icons/fi';

export default function Footer() {
  return <footer className="site-footer"><div><span className="footer-brand">omnipedia.</span><p>An independent archive for the Ben 10 universe.<br />Characters belong to Cartoon Network / Man of Action.</p></div><div className="footer-links"><a href="https://github.com/PRABHMANNAT/Ben-10-Omnitrix-Database" target="_blank" rel="noreferrer">The project <FiArrowUpRight /></a><button onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>Back to top <FiArrowUp /></button><span>BLACK EDITION · VOL. 01</span></div></footer>;
}
