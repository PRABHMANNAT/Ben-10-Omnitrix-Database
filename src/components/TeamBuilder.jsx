import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { FiPlus, FiX, FiArrowLeft, FiArrowRight, FiCheck, FiSearch, FiUsers } from 'react-icons/fi';
import AlienArtwork from './AlienArtwork';
import AbilityFilters from './AbilityFilters';
import { matchesAbilities, matchesAlienSearch } from '../lib/abilities';
import { CreatorTeamNotes, TeamLibrary, TeamLibraryDialog } from './TeamLibrary';
import useDialog from '../hooks/useDialog';
import { addNamedTeam, assignPick, availableTeamName, CREATOR_TEAM_ID, deleteTeam, getCreatorTeam, movePick, removePick, renameTeam, restoreTeamLibrary, teamNameError, TEAM_LIBRARY_STORAGE_KEY, TEAM_STORAGE_KEY, updateTeam } from '../lib/team';
import { creatorLineup } from '../data/creatorTeam';

const motionEase = [0.2, 0.7, 0.2, 1];

export default function TeamBuilder({ aliens }) {
  const roster = useMemo(() => new Map(aliens.map(alien => [alien.id, alien])), [aliens]);
  const creatorTeam = useMemo(() => getCreatorTeam(new Set(roster.keys())), [roster]);
  const [library, setLibrary] = useState(() => {
    try { return restoreTeamLibrary(localStorage.getItem(TEAM_LIBRARY_STORAGE_KEY), localStorage.getItem(TEAM_STORAGE_KEY), new Set(roster.keys())); }
    catch { return restoreTeamLibrary(null, null, new Set(roster.keys())); }
  });
  const [activeSlot, setActiveSlot] = useState(null);
  const [management, setManagement] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const slotButtons = useRef({});
  const editedSlot = useRef(null);
  const selectRef = useRef(null);
  const isCreator = library.activeTeamId === CREATOR_TEAM_ID;
  const team = isCreator ? creatorTeam : library.teams.find(entry => entry.id === library.activeTeamId);
  const roles = new Map([...creatorLineup.main, ...creatorLineup.bonus].map(pick => [pick.id, pick.role]));
  const setTeam = updater => setLibrary(previous => updateTeam(previous, previous.activeTeamId, updater));
  const mainCount = team.main.filter(Boolean).length;
  const bonusCount = team.bonus.filter(Boolean).length;
  const closePicker = useCallback(() => setActiveSlot(null), []);
  const closeManagement = useCallback(() => setManagement(null), []);
  const openPicker = (group, index) => {
    editedSlot.current = `${group}-${index}`;
    setActiveSlot({ group, index });
  };

  useEffect(() => {
    try {
      localStorage.setItem(TEAM_LIBRARY_STORAGE_KEY, JSON.stringify(library));
    } catch {
      // The UI must report failure to synchronize with external browser storage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStorageUnavailable(true);
    }
  }, [library]);

  const selectTeam = id => {
    if (id !== CREATOR_TEAM_ID && !library.teams.some(entry => entry.id === id)) return;
    setLibrary(previous => ({ ...previous, activeTeamId: id }));
    setActiveSlot(null);
    setAnnouncement(`${id === CREATOR_TEAM_ID ? creatorTeam.name : library.teams.find(entry => entry.id === id).name} selected.`);
  };
  const manageTeam = (mode, source = team) => setManagement({
    mode,
    team: source,
    initialName: mode === 'new' ? availableTeamName('My team', library.teams) : mode === 'copy' ? availableTeamName(`${source.name} copy`, library.teams) : source.name,
  });
  const saveManagement = name => {
    const { mode, team: source } = management;
    if (mode === 'delete') {
      setLibrary(previous => deleteTeam(previous, source.id));
      setAnnouncement(`${source.name} deleted. Your other teams are kept.`);
    } else if (mode === 'rename') {
      setLibrary(previous => renameTeam(previous, source.id, name));
      setAnnouncement(`Team renamed to ${name.trim()}.`);
    } else {
      const id = `team-${crypto.randomUUID()}`;
      setLibrary(previous => addNamedTeam(previous, name, id, mode === 'copy' ? source : undefined));
      setAnnouncement(`${name.trim()} ${mode === 'copy' ? 'copied' : 'created'}.`);
    }
    closeManagement();
  };

  const selectAlien = alien => {
    setTeam(previous => assignPick(previous, activeSlot.group, activeSlot.index, alien.id));
    setAnnouncement(`${alien.name} selected for ${activeSlot.group === 'bonus' ? 'bonus pick' : 'pick'} ${activeSlot.index + 1}.`);
    closePicker();
  };
  const removeAlien = (group, index) => {
    const alien = roster.get(team[group][index]);
    setTeam(previous => removePick(previous, group, index));
    setAnnouncement(`${alien.name} removed from ${group === 'bonus' ? 'bonus pick' : 'pick'} ${index + 1}.`);
  };
  const reorderAlien = (index, direction) => {
    setTeam(previous => movePick(previous, index, direction));
    setAnnouncement(`${roster.get(team.main[index]).name} moved to pick ${index + direction + 1}.`);
  };

  const renderSlot = (id, index, group) => {
    const alien = roster.get(id);
    const label = group === 'bonus' ? `B${index + 1}` : String(index + 1).padStart(2, '0');
    return <Motion.li key={`${group}-${index}`} className={`team-slot ${alien ? 'filled' : ''} ${group === 'bonus' ? 'bonus-slot' : ''}`} layout transition={{ duration: 0.25, ease: motionEase }}>
      {alien ? <>
        <div className="team-slot-art"><span className="team-slot-number">{label}</span>{!isCreator && <button className="team-remove icon-button" onClick={() => removeAlien(group, index)} aria-label={`Remove ${alien.name} from ${group === 'bonus' ? 'bonus pick' : 'pick'} ${index + 1}`}><FiX /></button>}<AlienArtwork key={alien.id} alien={alien} eager /></div>
        <div className="team-slot-copy"><span>{alien.species}</span><h3>{alien.name}</h3></div>
        {isCreator ? <div className="creator-slot-role">{roles.get(id)}</div> : <div className="team-slot-actions"><button ref={element => { slotButtons.current[`${group}-${index}`] = element; }} onClick={() => openPicker(group, index)} aria-label={`Replace ${alien.name} in ${group === 'bonus' ? 'bonus pick' : 'pick'} ${index + 1}`}>Replace</button>{group === 'main' && <div><button disabled={index === 0} onClick={() => reorderAlien(index, -1)} aria-label={`Move ${alien.name} up to pick ${index}`}><FiArrowLeft /></button><button disabled={index === 9} onClick={() => reorderAlien(index, 1)} aria-label={`Move ${alien.name} down to pick ${index + 2}`}><FiArrowRight /></button></div>}</div>}
      </> : <button ref={element => { slotButtons.current[`${group}-${index}`] = element; }} className="empty-team-slot" onClick={() => openPicker(group, index)} aria-label={`Choose alien for ${group === 'bonus' ? 'bonus pick' : 'pick'} ${index + 1}`}><span className="team-slot-number">{label}</span><span className="team-slot-plus"><FiPlus /></span><strong>Choose alien</strong><span>{group === 'bonus' ? 'A little extra firepower' : `Your ${index === 0 ? 'first' : 'next'} transformation`}</span></button>}
    </Motion.li>;
  };

  return <section className="team-builder" aria-labelledby="team-title">
    <Motion.div className="team-page-heading" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: motionEase }}>
      <div><div className="eyebrow section-index">02 / YOUR OWN OMNITRIX</div><h1 id="team-title" tabIndex={-1}>Build your top 10<span>.</span></h1><p>A team for every idea. Ten transformations, your choice, your order.<br />Create different lineups and keep them all in your library.</p></div>
    </Motion.div>
    <TeamLibrary library={library} creatorTeam={creatorTeam} activeTeam={team} roster={roster} selectRef={selectRef} onSelect={selectTeam} onNew={() => manageTeam('new')} onRename={() => manageTeam('rename')} onCopy={source => manageTeam('copy', source)} onDelete={() => manageTeam('delete')} />
    <div className="active-team-heading"><div><span className="eyebrow">{isCreator ? 'CURATED BY PRABHMANNAT SINGH' : 'YOUR CURRENT LINEUP'}</span><h2>{team.name}</h2><p>{isCreator ? 'Strong picks for different situations. Make a copy to customize this team.' : 'Your picks are saved separately from every other team.'}</p></div><label className={`bonus-toggle ${team.bonusEnabled ? 'active' : ''} ${isCreator ? 'is-readonly' : ''}`}><input type="checkbox" aria-label="Add 2 bonus picks" checked={team.bonusEnabled} disabled={isCreator} onChange={event => setTeam(previous => ({ ...previous, bonusEnabled: event.target.checked }))} /><span className="bonus-switch" aria-hidden="true" /><span>{isCreator ? 'Two bonus picks included' : 'Add 2 bonus picks'}<small>{isCreator ? 'Part of the creator lineup' : 'Optional extra transformations'}</small></span><span className="bonus-plus">+2</span></label></div>
    <div className="team-summary"><div className="team-progress-copy"><FiUsers /><span>Your starting ten</span><strong>{mainCount}<span> / 10</span></strong></div><div className="team-progress-track" role="progressbar" aria-label="Main team selected" aria-valuemin={0} aria-valuemax={10} aria-valuenow={mainCount}><Motion.span animate={{ width: `${mainCount * 10}%` }} transition={{ duration: 0.3 }} /></div><span className={`team-save-status ${storageUnavailable ? 'storage-unavailable' : ''}`} role="status">{storageUnavailable ? 'Changes kept for this visit · browser storage unavailable' : isCreator ? 'Creator preset · always available' : 'All your teams are saved on this browser'}{!storageUnavailable && <FiCheck />}</span></div>
    <ol className="team-grid" aria-label="Your top ten picks">{team.main.map((id, index) => renderSlot(id, index, 'main'))}</ol>
    <AnimatePresence initial={false}>{team.bonusEnabled && <Motion.section className="bonus-picks" aria-labelledby="bonus-heading" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: motionEase }}><div className="bonus-section-heading"><div><span className="eyebrow">A LITTLE MORE RANGE</span><h2 id="bonus-heading">The bonus two<span>{bonusCount} / 2</span></h2><p>Two extra forms, separate from your ranked top ten.</p></div><span className="bonus-section-mark">10 + 2</span></div><ol className="team-grid bonus-grid" aria-label="Your two bonus picks">{team.bonus.map((id, index) => renderSlot(id, index, 'bonus'))}</ol></Motion.section>}</AnimatePresence>
    {!team.bonusEnabled && bonusCount > 0 && <p className="team-hidden-bonus">Your bonus choices are kept. Turn on “Add 2 bonus picks” to show them.</p>}
    {isCreator && <CreatorTeamNotes roster={roster} />}
    <div className="team-guidance"><span>{mainCount === 10 ? <><FiCheck />{isCreator ? 'Twelve picks. A role for every form.' : 'Your starting ten is complete.'}</> : <><FiPlus />Select a slot to choose a transformation.</>}</span><p>{isCreator ? 'Make it yours to change the picks or their order.' : 'Use the arrows to change your ranking. Each alien can appear once per team.'}</p></div>
    <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
    <AnimatePresence onExitComplete={() => slotButtons.current[editedSlot.current]?.focus()}>{activeSlot && !isCreator && <TeamPicker key={`${team.id}-${activeSlot.group}-${activeSlot.index}`} aliens={aliens} team={team} activeSlot={activeSlot} onSelect={selectAlien} onClose={closePicker} />}</AnimatePresence>
    <AnimatePresence onExitComplete={() => selectRef.current?.focus()}>{management && <TeamLibraryDialog key={`${management.mode}-${management.team.id}`} {...management} validateName={name => teamNameError(name, library.teams, management.mode === 'rename' ? management.team.id : undefined)} onSave={saveManagement} onClose={closeManagement} />}</AnimatePresence>
  </section>;
}

function TeamPicker({ aliens, team, activeSlot, onSelect, onClose }) {
  const dialogRef = useRef(null);
  const [query, setQuery] = useState('');
  const [series, setSeries] = useState('ALL');
  const [selectedAbilities, setSelectedAbilities] = useState([]);
  const toggleAbility = id => setSelectedAbilities(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]);
  const resetFilters = () => { setQuery(''); setSeries('ALL'); setSelectedAbilities([]); };
  useDialog(dialogRef, onClose);
  const currentId = team[activeSlot.group][activeSlot.index];
  const positions = new Map();
  team.main.forEach((id, index) => { if (id) positions.set(id, `Pick ${String(index + 1).padStart(2, '0')}`); });
  if (team.bonusEnabled) team.bonus.forEach((id, index) => { if (id) positions.set(id, `Bonus ${index + 1}`); });
  const choices = useMemo(() => {
    return aliens.filter(alien => (series === 'ALL' || alien.series.includes(series)) && matchesAlienSearch(alien, query) && matchesAbilities(alien, selectedAbilities)).sort((first, second) => first.name.localeCompare(second.name));
  }, [aliens, query, series, selectedAbilities]);
  const targetLabel = `${activeSlot.group === 'bonus' ? 'bonus pick' : 'pick'} ${String(activeSlot.index + 1).padStart(2, '0')}`;

  return <Motion.div className="modal-overlay team-picker-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
    <Motion.section className="team-picker" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="team-picker-title" tabIndex={-1} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} transition={{ duration: 0.22, ease: motionEase }} onClick={event => event.stopPropagation()}>
      <div className="dialog-topline"><span className="eyebrow">YOUR TEAM / {targetLabel.toUpperCase()}</span><button className="icon-button" onClick={onClose} aria-label="Close alien picker"><FiX /></button></div>
      <div className="team-picker-heading"><h2 id="team-picker-title">Choose your transformation.</h2><p>Adding to {targetLabel}. Already selected forms are marked below.</p></div>
      <div className="team-picker-toolbar"><label className="team-picker-search"><FiSearch /><input aria-label="Search team candidates" placeholder="Search name, species, or ability…" value={query} onChange={event => setQuery(event.target.value)} />{query && <button aria-label="Clear candidate search" onClick={() => setQuery('')}><FiX /></button>}</label><select aria-label="Filter team candidates by series" value={series} onChange={event => setSeries(event.target.value)}><option value="ALL">All series</option>{['Original Series', 'Alien Force', 'Ultimate Alien', 'Omniverse'].map(name => <option key={name}>{name}</option>)}</select></div>
      <div className="team-picker-results"><span role="status" aria-live="polite">{choices.length} {choices.length === 1 ? 'transformation' : 'transformations'}</span>{query.trim() || series !== 'ALL' || selectedAbilities.length ? <button onClick={resetFilters} aria-label="Reset team candidate filters">Reset filters</button> : <span>No duplicate picks</span>}</div>
      <div className="team-picker-scroll"><AbilityFilters label="Filter team candidates by ability" selected={selectedAbilities} onToggle={toggleAbility} onClear={() => setSelectedAbilities([])} primaryCount={4} />{choices.length ? <div className="team-candidate-grid">{choices.map(alien => {
        const current = alien.id === currentId;
        const occupied = positions.has(alien.id) && !current;
        return <button key={alien.id} className={`team-candidate ${current ? 'current' : ''}`} disabled={occupied} onClick={() => onSelect(alien)} aria-label={`${occupied ? `${alien.name}, already selected as ${positions.get(alien.id)}` : `Choose ${alien.name} for ${targetLabel}`}`}><span className="team-candidate-stage"><AlienArtwork alien={alien} eager /><span className="candidate-tier">{alien.tier}</span>{(occupied || current) && <span className="candidate-picked"><FiCheck />{current ? 'Current pick' : positions.get(alien.id)}</span>}</span><strong>{alien.name}</strong><small>{alien.species}</small></button>;
      })}</div> : <div className="team-picker-empty"><FiSearch /><h3>No matching transformations.</h3><p>Try a different name, series, or ability.</p><button className="button" onClick={resetFilters}>Reset filters</button></div>}</div>
      <div className="team-picker-footer"><span>{activeSlot.group === 'bonus' ? 'BONUS FORM' : 'TOP TEN'} · {String(activeSlot.index + 1).padStart(2, '0')}</span><button className="button" onClick={onClose}>Cancel</button></div>
    </Motion.section>
  </Motion.div>;
}
