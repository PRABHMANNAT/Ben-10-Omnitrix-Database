import { LayoutGroup, motion as Motion, useReducedMotion } from 'framer-motion';
import { FiArrowUpRight, FiShuffle, FiStar } from 'react-icons/fi';

export function OmnitrixMark({ className = '' }) {
  return <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeWidth="1.5" /><path d="M10 9h20l-7 11 7 11H10l7-11-7-11Z" fill="currentColor" /></svg>;
}

export default function Header({ section, onSectionChange, compareMode, onCompare, onRandom, savedCount }) {
  const reduceMotion = useReducedMotion();
  const items = [
    { key: 'archive', label: 'Encyclopedia', active: section === 'archive' && !compareMode },
    { key: 'saved', label: 'Collections', active: section === 'saved' && !compareMode },
    { key: 'team', label: 'My top 10', active: section === 'team' && !compareMode },
    { key: 'compare', label: 'Compare', active: compareMode },
  ];
  return <header className="site-header">
    <div className="header-inner">
      <a className="wordmark" href="#archive" onClick={event => { event.preventDefault(); onSectionChange('archive'); }} aria-label="Omnipedia home"><OmnitrixMark /><span>omni<span className="wordmark-light">pedia</span><span className="wordmark-dot">.</span></span></a>
      <LayoutGroup id="main-navigation"><nav className="main-nav" aria-label="Main navigation">
        {items.map(item => <button key={item.key} className={item.active ? 'active' : ''} aria-current={item.active && item.key !== 'compare' ? 'page' : undefined} aria-pressed={item.key === 'compare' ? compareMode : undefined} onClick={() => item.key === 'compare' ? onCompare() : onSectionChange(item.key)}>
          {item.active && <Motion.span className="nav-active-pill" layoutId="active-navigation" initial={false} transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }} aria-hidden="true" />}
          <span className="nav-label">{item.label}{item.key === 'saved' && savedCount > 0 && <span className="nav-count">{savedCount}</span>}</span>
        </button>)}
      </nav></LayoutGroup>
      <div className="header-actions"><a className="button button-small github-star" href="https://github.com/PRABHMANNAT/Ben-10-Omnitrix-Database" target="_blank" rel="noreferrer" aria-label="Star Ben 10 Omnitrix Database on GitHub"><FiStar /><span>Star on GitHub</span><FiArrowUpRight /></a><button className="button button-small random-button" onClick={onRandom}><FiShuffle /><span>Surprise me</span><FiArrowUpRight /></button></div>
    </div>
  </header>;
}
