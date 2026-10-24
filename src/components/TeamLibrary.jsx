import { useEffect, useId, useRef, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { FiArrowUpRight, FiCopy, FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import AlienArtwork from './AlienArtwork';
import useDialog from '../hooks/useDialog';
import { CREATOR_TEAM_ID, TEAM_NAME_LIMIT } from '../lib/team';
import { creatorLineup } from '../data/creatorTeam';

export function TeamLibrary({ library, creatorTeam, activeTeam, roster, selectRef, onSelect, onNew, onRename, onCopy, onDelete }) {
  const isCreator = activeTeam.id === CREATOR_TEAM_ID;
  return <div className="team-library">
    <aside className={`creator-team-card ${isCreator ? 'is-current' : ''}`} aria-label="Creator's featured team">
      <div className="creator-lineup-preview" aria-hidden="true">{[29, 53, 4].map(id => <div key={id}><AlienArtwork alien={roster.get(id)} eager /></div>)}<span>10 + 2</span></div>
      <div className="creator-lineup-copy">
        <span className="eyebrow">FROM THE CREATOR / {creatorLineup.author.toUpperCase()}</span>
        <h2>{creatorLineup.name}</h2>
        <p>Twelve forms. Ready for any situation.</p>
      </div>
      <button className="button button-small" onClick={() => isCreator ? onCopy(creatorTeam) : onSelect(CREATOR_TEAM_ID)}>{isCreator ? <><FiCopy />Make it yours</> : <>View lineup<FiArrowUpRight /></>}</button>
    </aside>
    <div className="team-library-toolbar">
      <label className="team-select-label"><span className="eyebrow">YOUR TEAM LIBRARY <span>{library.teams.length} SAVED</span></span>
        <select ref={selectRef} aria-label="Choose saved team" value={activeTeam.id} onChange={event => onSelect(event.target.value)}>
          <optgroup label="Your teams">{library.teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</optgroup>
          <optgroup label="From the creator"><option value={CREATOR_TEAM_ID}>{creatorTeam.name} · 10 + 2</option></optgroup>
        </select>
      </label>
      <div className="team-library-actions">
        <button className="icon-button" aria-label="Rename team" title={isCreator ? 'Make a copy to rename the creator lineup' : 'Rename team'} disabled={isCreator} onClick={onRename}><FiEdit2 /></button>
        <button className="icon-button" aria-label="Duplicate team" title="Duplicate team" onClick={() => onCopy(activeTeam)}><FiCopy /></button>
        <button className="icon-button" aria-label="Delete team" title={isCreator ? 'The creator lineup stays available' : library.teams.length === 1 ? 'Keep at least one personal team' : 'Delete team'} disabled={isCreator || library.teams.length === 1} onClick={onDelete}><FiTrash2 /></button>
        <button className="button button-primary new-team-button" onClick={onNew}><span className="new-team-icon" aria-hidden="true"><FiPlus /></span><span>New team</span><FiArrowUpRight className="new-team-arrow" aria-hidden="true" /></button>
      </div>
    </div>
  </div>;
}

export function TeamLibraryDialog({ mode, team, initialName, validateName, onSave, onClose }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const id = useId();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');
  const deleting = mode === 'delete';
  useDialog(dialogRef, onClose);
  useEffect(() => { if (!deleting) { inputRef.current?.focus(); inputRef.current?.select(); } }, [deleting]);
  const title = deleting ? 'Delete this team?' : mode === 'rename' ? 'A new name. Same team.' : mode === 'copy' ? 'Make this lineup yours.' : 'Start a new team.';
  const submit = event => {
    event.preventDefault();
    const message = deleting ? '' : validateName(name);
    setError(message);
    if (!message) onSave(name);
  };

  return <Motion.div className="modal-overlay team-library-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
    <Motion.section ref={dialogRef} className="team-name-dialog" role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} tabIndex={-1} onClick={event => event.stopPropagation()} initial={{ y: 15 }} animate={{ y: 0 }} exit={{ y: 10 }}>
      <div className="dialog-topline"><span className="eyebrow">YOUR TEAM LIBRARY</span><button className="icon-button" aria-label="Close team dialog" onClick={onClose}><FiX /></button></div>
      <form onSubmit={submit}>
        <div className="team-name-body">
          <h2 id={`${id}-title`}>{title}</h2>
          <p id={`${id}-description`}>{deleting ? <>“{team.name}” and its picks will be removed from this browser. Your other teams will stay.</> : mode === 'copy' ? 'Keep all ten picks and bonus choices, then change anything you like.' : mode === 'rename' ? 'Give this lineup a name that fits. All your picks will stay.' : 'A fresh ten slots, with two optional bonus picks. Name it for a mission, a mood, or your favorites.'}</p>
          {!deleting && <><label htmlFor={`${id}-name`}>Team name</label><input ref={inputRef} id={`${id}-name`} value={name} maxLength={TEAM_NAME_LIMIT} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : `${id}-hint`} onChange={event => { setName(event.target.value); setError(''); }} autoComplete="off" placeholder="e.g. Rescue squad" /><div className="team-name-hint"><span id={`${id}-hint`}>You can change this later.</span><span>{name.length} / {TEAM_NAME_LIMIT}</span></div><p id={`${id}-error`} className="team-name-error" role="status">{error}</p></>}
        </div>
        <div className="team-name-footer"><button className="button" type="button" onClick={onClose}>Cancel</button><button className={`button ${deleting ? 'button-delete' : 'button-primary'}`} type="submit">{deleting ? 'Delete team' : mode === 'rename' ? 'Save name' : mode === 'copy' ? 'Create copy' : 'Create team'}</button></div>
      </form>
    </Motion.section>
  </Motion.div>;
}

export function CreatorTeamNotes({ roster }) {
  return <details className="creator-team-notes">
    <summary>Why these twelve?<span>Roles & trade-offs</span></summary>
    <p>A fan-curated team built for coverage across different situations. Use the right form for the job; raw power does not solve every problem.</p>
    <div className="creator-notes-grid">{[...creatorLineup.main, ...creatorLineup.bonus].map(pick => <div key={pick.id}><span className="eyebrow">{pick.role}</span><h3>{roster.get(pick.id)?.name}</h3><p>{pick.note}</p></div>)}</div>
  </details>;
}
