import AlienCard from './AlienCard';

const tiers = ['GOD', 'S', 'A', 'B', 'C', 'D', 'F'];
const descriptions = { GOD: 'Beyond the ordinary', S: 'Exceptional power', A: 'Elite transformations', B: 'Versatile specialists', C: 'Situational advantages', D: 'Limited combat capability', F: 'Unconventional forms' };

export default function TierSection({ aliens, ...cardProps }) {
  return <div className="tier-sections">{tiers.map(tier => {
    const entries = aliens.filter(alien => alien.tier === tier);
    if (!entries.length) return null;
    return <details className="tier-section" key={tier} open><summary><span className="tier-heading">{tier}<span>TIER</span></span><span>{descriptions[tier]}</span><span className="tier-count">{entries.length} entries</span></summary><div className="alien-grid">{entries.map((alien, index) => <AlienCard key={alien.id} alien={alien} index={index} {...cardProps} isSelected={cardProps.selectedCompare.some(entry => entry.id === alien.id)} isSaved={cardProps.savedIds.includes(alien.id)} />)}</div></details>;
  })}</div>;
}
