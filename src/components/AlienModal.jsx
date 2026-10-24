import { useRef, useEffect, useState, lazy, Suspense } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight, FiBookmark, FiArrowUpRight } from 'react-icons/fi';
import AlienArtwork from './AlienArtwork';
import useDialog from '../hooks/useDialog';

const AlienGallery = lazy(() => import('./AlienGallery'));

export default function AlienModal({ alien, onClose, onPrev, onNext, isSaved, onSave }) {
  const ref = useRef(null);
  const [tab, setTab] = useState('Profile');
  const galleryRef = useRef(null);
  useEffect(() => {
    if (tab !== 'Gallery' || !galleryRef.current || !ref.current) return;
    const dialog = ref.current;
    const top = galleryRef.current.getBoundingClientRect().top - dialog.getBoundingClientRect().top + dialog.scrollTop;
    dialog.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [tab]);
  useDialog(ref, onClose);
  useEffect(() => {
    const navigate = event => {
      if (/INPUT|SELECT|TEXTAREA/.test(event.target.tagName) || event.target.closest('[role="tablist"], [data-alien-gallery]')) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); onPrev(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); onNext(); }
    };
    window.addEventListener('keydown', navigate);
    return () => window.removeEventListener('keydown', navigate);
  }, [onPrev, onNext]);
  const tabs = ['Profile', 'Abilities', 'Records', 'Gallery'];
  return <Motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
    <Motion.section ref={ref} role="dialog" aria-modal="true" aria-labelledby="profile-name" className="profile-dialog" tabIndex={-1} onClick={event => event.stopPropagation()} initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 18, opacity: 0 }} transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}>
      <div className="dialog-topline"><span className="eyebrow">THE TRANSFORMATION FILES <span> / {String(alien.id).padStart(3, '0')}</span></span><button className="icon-button" onClick={onClose} aria-label="Close profile"><FiX /></button></div>
      <div className={`profile-layout ${tab === 'Gallery' ? 'profile-layout-gallery' : ''}`}>
        <div className="profile-visual"><span className="profile-watermark" aria-hidden="true">{String(alien.id).padStart(2, '0')}</span><AnimatePresence mode="wait"><Motion.div key={alien.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}><AlienArtwork alien={alien} eager /></Motion.div></AnimatePresence><span className="profile-image-caption">{[70, 71].includes(alien.id) ? 'Non-canon concept · AI-enhanced' : alien.firstSeries} <span>{alien.rarity}</span></span></div>
        <div className="profile-content">
          <div className="profile-kicker"><span className="tier-label">{alien.tier} <span>TIER</span></span><span>{alien.classification}</span></div><p className="profile-species">{alien.species}</p><h2 id="profile-name">{alien.name}</h2><p className="profile-intro">{alien.shortDesc}</p>
          <div className="profile-tabs" role="tablist" aria-label="Profile sections">{tabs.map((name, index) => <button role="tab" id={`tab-${name}`} aria-controls={`panel-${name}`} aria-selected={tab === name} tabIndex={tab === name ? 0 : -1} className={tab === name ? 'active' : ''} key={name} onClick={() => setTab(name)} onKeyDown={event => { if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; setTab(tabs[next]); document.getElementById(`tab-${tabs[next]}`)?.focus(); } }}>{name}</button>)}</div>
          {tab !== 'Gallery' && <div className="profile-tab-content" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
            {tab === 'Profile' && <><p>{alien.fullDesc}</p><dl className="profile-facts">{[['Homeworld', alien.homeworld], ['Height', alien.height], ['Weight', alien.weight], ['First appearance', alien.firstAppearance], ['Unlocked in', alien.unlockedIn], ['Difficulty', alien.difficultyToUse]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className="signature-move"><span className="eyebrow">SIGNATURE MOVE</span><p>{alien.sigMove}</p></div></>}
            {tab === 'Abilities' && <><h3>Capabilities</h3><div className="ability-list">{alien.abilities.map((ability, index) => <div key={ability}><span>{String(index + 1).padStart(2, '0')}</span>{ability}<FiArrowUpRight /></div>)}</div><h3>Known weaknesses</h3><ul className="plain-list">{alien.weaknesses.map(weakness => <li key={weakness}>{weakness}</li>)}</ul></>}
            {tab === 'Records' && <><h3>Battle records</h3><div className="battle-records"><div><span className="eyebrow">NOTABLE VICTORIES</span><ul className="plain-list">{alien.notableVictories.map(value => <li key={value}>{value}</li>)}</ul></div><div><span className="eyebrow">NOTABLE DEFEATS</span><ul className="plain-list">{alien.notableDefeats.map(value => <li key={value}>{value}</li>)}</ul></div></div><h3>From the archive</h3><ol className="facts-list">{alien.funFacts.map(value => <li key={value}>{value}</li>)}</ol></>}
          </div>}
        </div>
      </div>
      <div className="profile-stats"><span className="eyebrow">STATISTICS</span>{Object.entries(alien.stats).map(([stat, value]) => <div className="profile-stat" key={stat}><div><span>{stat}</span><strong>{value}</strong></div><div className="stat-track"><Motion.i key={`${alien.id}-${stat}`} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.5, delay: 0.1 }} /></div></div>)}</div>
      <div ref={galleryRef} className="profile-gallery" role={tab === 'Gallery' ? 'tabpanel' : 'region'} id="panel-Gallery" aria-labelledby="tab-Gallery">
        <Suspense fallback={<p className="gallery-loading" role="status">Opening visual archive…</p>}><AlienGallery key={alien.id} alien={alien} /></Suspense>
      </div>
      <div className="dialog-footer"><button className="button" onClick={onPrev}><FiChevronLeft /><span>Previous</span></button><button className={`button save-profile ${isSaved ? 'saved' : ''}`} onClick={() => onSave(alien.id)} aria-pressed={isSaved}><FiBookmark />{isSaved ? 'Saved to collection' : 'Save to collection'}</button><button className="button" onClick={onNext}><span>Next</span><FiChevronRight /></button></div>
    </Motion.section>
  </Motion.div>;
}
