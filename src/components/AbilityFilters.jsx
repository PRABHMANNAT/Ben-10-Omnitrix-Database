import { FiCheck, FiX } from 'react-icons/fi';
import { ABILITY_FILTERS } from '../lib/abilities';
import '../styles/abilities.css';

export default function AbilityFilters({ selected, onToggle, onClear, label, primaryCount = 8 }) {
  const extraCount = selected.filter(id => ABILITY_FILTERS.slice(primaryCount).some(filter => filter.id === id)).length;
  const renderFilter = filter => <button key={filter.id} type="button" className={`ability-chip ${selected.includes(filter.id) ? 'is-selected' : ''}`} aria-pressed={selected.includes(filter.id)} title={filter.description} onClick={() => onToggle(filter.id)}><span className="ability-chip-check" aria-hidden="true">{selected.includes(filter.id) && <FiCheck />}</span>{filter.label}</button>;

  return <fieldset className="ability-filters" aria-label={label}>
    <legend className="eyebrow">BY ABILITY{selected.length > 0 && <span>{selected.length} ACTIVE</span>}</legend>
    <div className="ability-chips">{ABILITY_FILTERS.slice(0, primaryCount).map(renderFilter)}</div>
    <details className="more-abilities"><summary>More abilities<span>{extraCount ? `${extraCount} selected` : `+${ABILITY_FILTERS.length - primaryCount}`}</span></summary><div className="ability-chips">{ABILITY_FILTERS.slice(primaryCount).map(renderFilter)}</div></details>
    <div className="ability-filter-footer"><p>{selected.length > 1 ? 'Matches all selected abilities' : 'Combine abilities to narrow results'}</p>{selected.length > 0 && <button type="button" aria-label="Clear ability filters" onClick={onClear}><FiX />Clear</button>}</div>
  </fieldset>;
}
