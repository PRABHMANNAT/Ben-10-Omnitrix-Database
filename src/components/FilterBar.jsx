import { createElement, useRef } from 'react';
import { FiX, FiSliders, FiGrid, FiBookmark, FiLayers, FiArrowUpRight, FiUsers } from 'react-icons/fi';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import useDialog from '../hooks/useDialog';
import AbilityFilters from './AbilityFilters';
import { OmnitrixMark } from './Header';

const series = [['Original Series', 'Original series', '2005'], ['Alien Force', 'Alien Force', '2008'], ['Ultimate Alien', 'Ultimate Alien', '2010'], ['Omniverse', 'Omniverse', '2012']];

export default function SidebarFilters({ aliens, section, onSectionChange, onCollectionChange, selectedTier, setSelectedTier, selectedSeries, toggleSeries, selectedAbilities, toggleAbility, clearAbilities, selectedClassification, setSelectedClassification, selectedRarity, setSelectedRarity, selectedDifficulty, setSelectedDifficulty, statRanges, updateStatRange, toggles, activeFiltersCount, onReset, isMobileOpen, onClose, savedCount }) {
  const ref = useRef(null);
  useDialog(ref, onClose, isMobileOpen);
  const collection = toggles.onlyOriginal10 ? 'original' : toggles.onlyUltimates ? 'ultimate' : 'all';
  const classifications = [...new Set(aliens.map(alien => alien.classification))].sort();
  return <>
    {isMobileOpen && <div className="sidebar-backdrop" onClick={onClose} />}
    <aside ref={ref} className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`} aria-label="Archive filters" role={isMobileOpen ? 'dialog' : undefined} aria-modal={isMobileOpen ? true : undefined}>
      <div className="sidebar-scroll">
      <div className="sidebar-heading"><span className="eyebrow">EXPLORE THE ARCHIVE</span><button className="icon-button mobile-close" onClick={onClose} aria-label="Close filters"><FiX /></button></div>
      <div className="collection-links">
        {[['all', 'All transformations', FiGrid, aliens.length], ['original', 'The original ten', FiBookmark, 10], ['ultimate', 'Ultimate forms', FiLayers, aliens.filter(alien => alien.name.startsWith('Ultimate')).length]].map(([key, label, Icon, count]) => <button key={key} className={section === 'archive' && collection === key ? 'active' : ''} onClick={() => { onCollectionChange(key); }}>{createElement(Icon)}<span>{label}</span><span className="collection-count">{String(count).padStart(2, '0')}</span></button>)}
        <button className={section === 'saved' ? 'active' : ''} onClick={() => onSectionChange('saved')}><FiBookmark /><span>My collection</span><span className="collection-count">{String(savedCount).padStart(2, '0')}</span></button>
        <button className={section === 'team' ? 'active' : ''} onClick={() => onSectionChange('team')}><FiUsers /><span>Build my top 10</span><span className="collection-count">+2</span></button>
      </div>
      {section !== 'team' && <>
      <div className="filter-section sidebar-abilities"><AbilityFilters label="Filter archive by ability" selected={selectedAbilities} onToggle={toggleAbility} onClear={clearAbilities} /></div>
      <div className="filter-section"><h2 className="eyebrow">BY SERIES</h2>{series.map(([id, label, year]) => <label className="check-row" key={id}><input type="checkbox" checked={selectedSeries.includes(id)} onChange={() => toggleSeries(id)} /><span>{label}</span><small>{year}</small></label>)}</div>
      <div className="filter-section"><div className="filter-title"><h2 className="eyebrow">REFINE RESULTS</h2><FiSliders /></div>
        <Select label="Power tier" value={selectedTier} onChange={setSelectedTier} options={['ALL', 'GOD', 'S', 'A', 'B', 'C', 'D', 'F']} />
        <Select label="Classification" value={selectedClassification} onChange={setSelectedClassification} options={['ALL', ...classifications]} />
        <details className="advanced-filters"><summary>More filters<span>+</span></summary><div>
          <Select label="Rarity" value={selectedRarity} onChange={setSelectedRarity} options={['ALL', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']} />
          <Select label="Difficulty" value={selectedDifficulty} onChange={setSelectedDifficulty} options={['ALL', 'Easy', 'Medium', 'Hard', 'Extreme']} />
          {Object.entries(statRanges).map(([stat, value]) => <div className="range-filter" key={stat}><div><span>{stat}</span><span>{value[0]}–{value[1]}</span></div><Slider range min={0} max={100} value={value} onChange={values => updateStatRange(stat, values)} ariaLabelForHandle={[`Minimum ${stat}`, `Maximum ${stat}`]} /></div>)}
        </div></details>
        {activeFiltersCount > 0 && <button className="reset-filters" onClick={onReset}><FiX />Reset filters<span>{activeFiltersCount}</span></button>}
      </div>
      </>}
      <div className="sidebar-note"><OmnitrixMark className="sidebar-omnitrix" /><p>Built by<br /><strong>Prabhmannat Singh.</strong></p><span>THE BEN 10 FIELD GUIDE</span><a href="https://github.com/PRABHMANNAT/Ben-10-Omnitrix-Database" target="_blank" rel="noreferrer" aria-label="View project on GitHub"><FiArrowUpRight /></a></div>
      </div>
      <button className="button button-primary mobile-apply" onClick={onClose}>Show results</button>
    </aside>
  </>;
}

function Select({ label, value, onChange, options }) {
  return <label className="filter-select"><span>{label}</span><select aria-label={label} value={value} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option} value={option}>{option === 'ALL' ? `All ${label === 'Classification' ? 'classes' : label === 'Power tier' ? 'tiers' : label === 'Rarity' ? 'rarities' : 'levels'}` : option === 'GOD' ? 'God tier' : option}</option>)}</select></label>;
}
