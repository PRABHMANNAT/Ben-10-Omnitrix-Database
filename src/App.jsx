import { createElement, useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { AnimatePresence, MotionConfig, motion as Motion } from 'framer-motion';
import { FiArrowUpRight, FiArrowRight, FiGrid, FiList, FiLayers, FiSliders, FiX, FiBookmark, FiSearch, FiCheck, FiColumns } from 'react-icons/fi';
import aliens from './data/aliens';
import useFilters from './hooks/useFilters';
import useDialog from './hooks/useDialog';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import SidebarFilters from './components/FilterBar';
import AlienCard from './components/AlienCard';
import CardHoverEffectDemo from './components/card-hover-effect-demo';
import AlienArtwork from './components/AlienArtwork';
import AlienModal from './components/AlienModal';
import TierSection from './components/TierSection';
import StatsOverview from './components/StatsOverview';
import Footer from './components/Footer';
const TeamBuilder = lazy(() => import('./components/TeamBuilder'));

const featured = aliens.find(alien => alien.name === 'Alien X');
const slug = alien => alien.name.toLowerCase().replace(/\s+/g, '-');
const ease = [0.2, 0.7, 0.2, 1];
const sortOptions = [['rank', 'Featured order'], ['name-az', 'Name: A–Z'], ['name-za', 'Name: Z–A'], ['overall', 'Highest overall'], ['power', 'Highest power'], ['speed', 'Highest speed'], ['strength', 'Highest strength'], ['intelligence', 'Highest intelligence'], ['durability', 'Highest durability'], ['series', 'Series order']];

export default function App() {
  const filters = useFilters(aliens);
  const [selectedAlien, setSelectedAlien] = useState(() => aliens.find(alien => slug(alien) === window.location.hash.slice(1)) || null);
  const [section, setSection] = useState('archive');
  const [compareMode, setCompareMode] = useState(false);
  const [compareAliens, setCompareAliens] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [savedIds, setSavedIds] = useState(() => {
    try { const value = JSON.parse(localStorage.getItem('omnipedia-collection') || '[]'); return Array.isArray(value) ? value.filter(id => aliens.some(alien => alien.id === id)) : []; } catch { return []; }
  });
  const [storageError, setStorageError] = useState('');
  const archiveRef = useRef(null);

  useEffect(() => {
    const onHashChange = () => setSelectedAlien(aliens.find(alien => slug(alien) === window.location.hash.slice(1)) || null);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  useEffect(() => {
    try { localStorage.setItem('omnipedia-collection', JSON.stringify(savedIds)); } catch { /* Saving still works for this session. */ }
  }, [savedIds]);

  const openProfile = useCallback(alien => { setSelectedAlien(alien); history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${slug(alien)}`); }, []);
  const closeProfile = useCallback(() => { setSelectedAlien(null); history.replaceState(null, '', `${window.location.pathname}${window.location.search}`); }, []);
  const closeFilters = useCallback(() => setIsMobileFiltersOpen(false), []);
  const closeComparison = useCallback(() => setCompareOpen(false), []);
  const resetFilters = () => filters.clearAllFilters();
  const scrollToArchive = () => requestAnimationFrame(() => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    if (archiveRef.current) archiveRef.current.scrollIntoView({ behavior, block: 'start' });
    else window.scrollTo({ top: 0, behavior });
  });
  const changeSection = value => { setSection(value); setCompareMode(false); setIsMobileFiltersOpen(false); filters.clearAllFilters(); scrollToArchive(); };
  const changeCollection = key => { setSection('archive'); filters.clearAllFilters(); if (key === 'original') filters.updateToggle('onlyOriginal10'); if (key === 'ultimate') filters.updateToggle('onlyUltimates'); scrollToArchive(); };
  const toggleSaved = useCallback(id => {
    setSavedIds(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]);
    try { localStorage.setItem('omnipedia-storage-test', '1'); localStorage.removeItem('omnipedia-storage-test'); } catch { setStorageError('Your collection is saved for this visit. Browser storage is unavailable.'); }
  }, []);
  const handleCompare = useCallback(alien => setCompareAliens(previous => previous.some(entry => entry.id === alien.id) ? previous.filter(entry => entry.id !== alien.id) : previous.length < 3 ? [...previous, alien] : previous), []);
  const toggleCompareMode = () => { if (section === 'team') setSection('archive'); setCompareMode(value => !value); setCompareAliens([]); setCompareOpen(false); if (!compareMode) scrollToArchive(); };

  const displayedAliens = useMemo(() => section === 'saved' ? filters.filteredAliens.filter(alien => savedIds.includes(alien.id)) : filters.filteredAliens, [section, filters.filteredAliens, savedIds]);
  const navigateAlien = useCallback(direction => {
    const list = displayedAliens.some(alien => alien.id === selectedAlien?.id) ? displayedAliens : aliens;
    const index = list.findIndex(alien => alien.id === selectedAlien?.id);
    if (list.length) openProfile(list[(index + direction + list.length) % list.length]);
  }, [displayedAliens, selectedAlien, openProfile]);
  const previousAlien = useCallback(() => navigateAlien(-1), [navigateAlien]);
  const nextAlien = useCallback(() => navigateAlien(1), [navigateAlien]);
  const cardProps = { onClick: openProfile, isCompareMode: compareMode, onCompare: handleCompare, onSave: toggleSaved, selectionFull: compareAliens.length >= 3 };
  const collectionTitle = section === 'saved' ? 'Your collection' : filters.toggles.onlyOriginal10 ? 'The original ten' : filters.toggles.onlyUltimates ? 'Ultimate forms' : 'The archive';

  return <MotionConfig reducedMotion="user"><a className="skip-link" href={section === 'team' ? '#team-title' : '#archive'}>{section === 'team' ? 'Skip to team builder' : 'Skip to archive'}</a><div className="app-shell">
    <Header section={section} onSectionChange={changeSection} compareMode={compareMode} onCompare={toggleCompareMode} onRandom={() => openProfile(aliens[Math.floor(Math.random() * aliens.length)])} savedCount={savedIds.length} />
    <div className="page-layout">
      <SidebarFilters {...filters} aliens={aliens} section={section} onSectionChange={changeSection} onCollectionChange={changeCollection} onReset={resetFilters} isMobileOpen={isMobileFiltersOpen} onClose={closeFilters} savedCount={savedIds.length} />
      <main className={`main-content ${compareMode ? 'with-compare-tray' : ''}`}>
        {section === 'team' ? <Suspense fallback={<div className="team-loading" role="status">Loading your team…</div>}><TeamBuilder aliens={aliens} /></Suspense> : <>
        <section className="hero" aria-labelledby="hero-title"><Motion.div className="hero-copy" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}><div className="hero-eyebrow"><span className="small-square" /><span>THE BEN 10 ENCYCLOPEDIA</span><span className="hero-volume">VOL. 01</span></div><h1 id="hero-title">Every form.<br /><span>One universe.</span></h1><p>Explore 72 transformations across four animated series.<br />From the original ten to the Omniverse.</p><button className="text-link" onClick={scrollToArchive}>Explore the archive <FiArrowDownRight /></button><StatsOverview total={aliens.length} /></Motion.div>
          <Motion.div className="featured-specimen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease }}><span className="specimen-label">FEATURED TRANSFORMATION</span><span className="specimen-number">FILE / {String(featured.id).padStart(3, '0')}</span><div className="orbit orbit-one" aria-hidden="true" /><div className="orbit orbit-two" aria-hidden="true" /><span className="feature-letter" aria-hidden="true">X</span><div className="specimen-art"><AlienArtwork alien={featured} eager /></div><span className="specimen-coordinate">CELESTIALSAPIEN<br />FORGE OF CREATION</span><div className="featured-bottom"><div><span className="eyebrow">THE REALITY SHAPER</span><h2>Alien X<span>God tier</span></h2></div><button className="feature-open" onClick={() => openProfile(featured)} aria-label="Explore Alien X"><FiArrowUpRight /></button></div></Motion.div>
        </section>
        <section className="archive-section" id="archive" ref={archiveRef} aria-labelledby="archive-title"><div className="archive-heading"><div><div className="eyebrow section-index">01 / {section === 'saved' ? 'PERSONAL ARCHIVE' : 'THE TRANSFORMATIONS'}</div><h2 id="archive-title">{collectionTitle}<span>{String(displayedAliens.length).padStart(2, '0')}</span></h2><p>{section === 'saved' ? 'The forms you keep coming back to. Saved on this browser.' : 'Species, abilities, and the stories behind each form.'}</p></div><button className={`button compare-toggle ${compareMode ? 'active' : ''}`} onClick={toggleCompareMode}><FiColumns />{compareMode ? 'Exit comparison' : 'Compare aliens'}<FiArrowUpRight /></button></div>
          <div className="archive-toolbar"><button className="icon-button mobile-filter-button" aria-label="Open filters" onClick={() => setIsMobileFiltersOpen(true)}><FiSliders />{filters.activeFiltersCount > 0 && <span>{filters.activeFiltersCount}</span>}</button><SearchBar value={filters.searchQuery} onChange={filters.setSearchQuery} /><label className="sort-control"><span>Sort by</span><select aria-label="Sort transformations" value={filters.sortBy} onChange={event => filters.setSortBy(event.target.value)}>{sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><div className="view-switcher" role="group" aria-label="Archive view">{[['grid', FiGrid, 'Grid view'], ['list', FiList, 'List view'], ['tier', FiLayers, 'Tier view']].map(([value, Icon, label]) => <button key={value} className={filters.viewMode === value ? 'active' : ''} aria-label={label} aria-pressed={filters.viewMode === value} onClick={() => filters.setViewMode(value)}>{createElement(Icon)}</button>)}</div></div>
          <div className="results-line"><span role="status" aria-live="polite">{displayedAliens.length} {displayedAliens.length === 1 ? 'transformation' : 'transformations'}{filters.activeFiltersCount > 0 ? ' matching your filters' : ' to discover'}</span>{compareMode ? <span className="selection-hint">Select up to three forms to compare</span> : <span className="results-hint">PROFILES / ABILITIES / STATISTICS</span>}{filters.activeFiltersCount > 0 && <button onClick={resetFilters}>Clear filters <FiX /></button>}</div>
          {storageError && <p className="storage-message" role="status">{storageError}</p>}
          {displayedAliens.length > 0 ? filters.viewMode === 'tier' ? <TierSection aliens={displayedAliens} {...cardProps} selectedCompare={compareAliens} savedIds={savedIds} /> : filters.viewMode === 'list' ? <div className="list-view"><div className="list-header"><span>Transformation</span><span>Species</span><span>Tier</span><span>Overall</span><span /></div>{displayedAliens.map(alien => <ListRow key={alien.id} alien={alien} {...cardProps} isSaved={savedIds.includes(alien.id)} isSelected={compareAliens.some(entry => entry.id === alien.id)} />)}</div> : <CardHoverEffectDemo key={section} items={displayedAliens} renderItem={(alien, index) => <AlienCard alien={alien} index={index} {...cardProps} isSaved={savedIds.includes(alien.id)} isSelected={compareAliens.some(entry => entry.id === alien.id)} />} /> : <div className="empty-state">{section === 'saved' && !savedIds.length ? <FiBookmark /> : <FiSearch />}<h3>{section === 'saved' && !savedIds.length ? 'Make it your universe.' : 'No forms found.'}</h3><p>{section === 'saved' && !savedIds.length ? 'Save a transformation with the bookmark icon. Your collection starts with one.' : 'Try another name, ability, or a broader set of filters.'}</p><button className="button button-primary" onClick={() => section === 'saved' && !savedIds.length ? changeSection('archive') : resetFilters()}>{section === 'saved' && !savedIds.length ? 'Explore transformations' : 'Reset filters'}<FiArrowRight /></button></div>}
          {displayedAliens.length > 0 && <div className="archive-end"><span />YOU’VE REACHED THE END OF THIS COLLECTION<span /></div>}
        </section></>}
        <Footer />
      </main>
    </div>
    <AnimatePresence>{compareMode && <Motion.div className="compare-tray" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ duration: 0.25, ease }}><div className="tray-label"><FiColumns /><span>Compare forms<small>{compareAliens.length} of 3 selected</small></span></div><div className="tray-slots">{[0, 1, 2].map(index => compareAliens[index] ? <button className="tray-slot filled" key={index} onClick={() => handleCompare(compareAliens[index])} aria-label={`Remove ${compareAliens[index].name} from comparison`}><AlienArtwork alien={compareAliens[index]} /><span>{compareAliens[index].name}</span><FiX /></button> : <span className="tray-slot" key={index}><span>0{index + 1}</span><small>Select a form</small></span>)}</div><button className="button button-primary" disabled={compareAliens.length < 2} onClick={() => setCompareOpen(true)}>Compare <FiArrowRight /></button><button className="icon-button" aria-label="Exit comparison" onClick={toggleCompareMode}><FiX /></button></Motion.div>}</AnimatePresence>
    <AnimatePresence>{selectedAlien && <AlienModal alien={selectedAlien} onClose={closeProfile} onPrev={previousAlien} onNext={nextAlien} isSaved={savedIds.includes(selectedAlien.id)} onSave={toggleSaved} />}{compareOpen && <ComparePanel aliens={compareAliens} onClose={closeComparison} />}</AnimatePresence>
  </div></MotionConfig>;
}

function FiArrowDownRight() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 5l14 14M7 19h12V7" /></svg>; }

function ListRow({ alien, onClick, isCompareMode, onCompare, isSelected, isSaved, onSave, selectionFull }) {
  return <div className={`list-row ${isSelected ? 'is-selected' : ''}`}><button className="list-name" disabled={isCompareMode && selectionFull && !isSelected} onClick={() => isCompareMode ? onCompare(alien) : onClick(alien)}>{isCompareMode && <span className="list-check">{isSelected ? <FiCheck /> : '+'}</span>}<AlienArtwork alien={alien} /><span>{alien.name}<small>N° {String(alien.id).padStart(3, '0')}</small></span></button><span className="list-species">{alien.species}</span><span className="list-tier">{alien.tier}</span><span className="list-overall">{alien.stats.overall}<small>/ 100</small></span><button className={`icon-button ${isSaved ? 'saved' : ''}`} aria-label={`${isSaved ? 'Remove' : 'Save'} ${alien.name} ${isSaved ? 'from' : 'to'} collection`} onClick={() => onSave(alien.id)}><FiBookmark /></button></div>;
}

function ComparePanel({ aliens, onClose }) {
  const ref = useRef(null);
  useDialog(ref, onClose);
  return <Motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}><Motion.section ref={ref} role="dialog" aria-modal="true" aria-labelledby="compare-title" tabIndex={-1} className="compare-dialog" onClick={event => event.stopPropagation()} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} transition={{ duration: 0.25, ease }}><div className="dialog-topline"><span className="eyebrow">SIDE BY SIDE / FIELD NOTES</span><button className="icon-button" onClick={onClose} aria-label="Close comparison"><FiX /></button></div><div className="comparison-heading"><h2 id="compare-title">Strengths, side by side.</h2><p>Compare each form’s strengths. The highest values are underlined.</p></div><div className="comparison-table-wrap"><table className="comparison-table"><thead><tr><th scope="col">Transformation</th>{aliens.map(alien => <th scope="col" key={alien.id}><AlienArtwork alien={alien} eager /><span>{alien.name}</span><small>{alien.species}</small></th>)}</tr></thead><tbody>{Object.keys(aliens[0].stats).map(stat => { const max = Math.max(...aliens.map(alien => alien.stats[stat])); return <tr key={stat}><th scope="row">{stat}</th>{aliens.map(alien => <td key={alien.id}><span className={alien.stats[stat] === max ? 'best-stat' : ''}>{alien.stats[stat]}</span></td>)}</tr>; })}<tr><th scope="row">Power tier</th>{aliens.map(alien => <td key={alien.id}>{alien.tier}</td>)}</tr><tr><th scope="row">Homeworld</th>{aliens.map(alien => <td key={alien.id} className="comparison-text">{alien.homeworld}</td>)}</tr></tbody></table></div><div className="dialog-footer"><span className="eyebrow">EVERY FORM HAS ITS PURPOSE.</span><button className="button" onClick={onClose}>Keep exploring<FiArrowRight /></button></div></Motion.section></Motion.div>;
}
