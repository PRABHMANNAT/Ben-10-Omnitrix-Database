import { motion as Motion } from 'framer-motion';
import { FiArrowUpRight, FiBookmark, FiCheck, FiPlus } from 'react-icons/fi';
import AlienArtwork from './AlienArtwork';

export default function AlienCard({ alien, index = 0, onClick, isCompareMode, isSelected, onCompare, isSaved, onSave, selectionFull }) {
  const disabled = isCompareMode && selectionFull && !isSelected;
  return (
    <Motion.article className={`alien-card ${isSelected ? 'is-selected' : ''}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: Math.min(index * 0.025, 0.15), ease: [0.2, 0.7, 0.2, 1] }}>
      <div className="card-image-stage">
        <span className="entry-number">N° {String(alien.id).padStart(3, '0')}</span>
        <button className={`save-button ${isSaved ? 'is-saved' : ''}`} onClick={() => onSave(alien.id)} aria-label={`${isSaved ? 'Remove' : 'Save'} ${alien.name}${isSaved ? ' from' : ' to'} collection`} aria-pressed={isSaved}><FiBookmark /></button>
        <button className="artwork-button" disabled={disabled} onClick={() => isCompareMode ? onCompare(alien) : onClick(alien)} aria-label={isCompareMode ? `${isSelected ? 'Deselect' : 'Select'} ${alien.name} for comparison` : `View ${alien.name} profile`}><AlienArtwork key={alien.id} alien={alien} eager={index < 6} /><span className="stage-watermark" aria-hidden="true">{alien.name.replace('Ultimate ', '').slice(0, 2).toUpperCase()}</span></button>
        <span className={`tier-label ${alien.tier === 'GOD' ? 'tier-exceptional' : ''}`}>{alien.tier === 'GOD' ? 'GOD' : alien.tier} <span>TIER</span></span>
        {isCompareMode && <span className={`compare-indicator ${isSelected ? 'selected' : ''}`} aria-hidden="true">{isSelected ? <FiCheck /> : <FiPlus />}</span>}
      </div>
      <div className="card-information">
        <div className="card-title-row"><div><p className="card-species">{alien.species}</p><button className="card-title" onClick={() => onClick(alien)}>{alien.name}</button></div><button className="card-open" onClick={() => onClick(alien)} aria-label={`Read about ${alien.name}`}><FiArrowUpRight /></button></div>
        <p className="card-description">{alien.shortDesc}</p>
        <div className="card-stats">{[['power', 'PWR'], ['speed', 'SPD'], ['strength', 'STR']].map(([stat, label]) => <div key={stat}><span>{label}</span><strong>{alien.stats[stat]}</strong><div className="mini-track"><i style={{ width: `${alien.stats[stat]}%` }} /></div></div>)}</div>
        <div className="card-bottom"><span>{alien.classification}</span><span>{alien.firstSeries}</span></div>
      </div>
    </Motion.article>
  );
}
