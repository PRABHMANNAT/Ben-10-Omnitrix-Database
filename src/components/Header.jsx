import { FiArrowUpRight, FiShuffle, FiStar } from 'react-icons/fi';

export function OmnitrixMark({ className = '' }) {
  return <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeWidth="1.5" /><path d="M10 9h20l-7 11 7 11H10l7-11-7-11Z" fill="currentColor" /></svg>;
}

export default function Header({ section, onSectionChange, compareMode, onCompare, onRandom, savedCount }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="wordmark" href="#archive" onClick={(event) => { event.preventDefault(); onSectionChange('archive'); }} aria-label="Omnipedia home"><OmnitrixMark /><span>omni<span className="wordmark-light">pedia</span><span className="wordmark-dot">.</span></span></a>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={section === 'archive' && !compareMode ? 'active' : ''} onClick={() => onSectionChange('archive')}>Encyclopedia</button>
          <button className={section === 'saved' && !compareMode ? 'active' : ''} onClick={() => onSectionChange('saved')}>Collections{savedCount > 0 && <span className="nav-count">{savedCount}</span>}</button>
          <button className={section === 'team' && !compareMode ? 'active' : ''} onClick={() => onSectionChange('team')}>My top 10</button>
          <button className={compareMode ? 'active' : ''} onClick={onCompare}>Compare</button>
        </nav>
        <div className="header-actions"><a className="button button-small github-star" href="https://github.com/PRABHMANNAT/Ben-10-Omnitrix-Database" target="_blank" rel="noreferrer" aria-label="Star Ben 10 Omnitrix Database on GitHub"><FiStar /><span>Star on GitHub</span><FiArrowUpRight /></a><button className="button button-small random-button" onClick={onRandom}><FiShuffle /><span>Surprise me</span><FiArrowUpRight /></button></div>
      </div>
    </header>
  );
}
