import { creatorLineup } from '../data/creatorTeam.js';

export const MAIN_TEAM_SIZE = 10;
export const BONUS_TEAM_SIZE = 2;
export const TEAM_STORAGE_KEY = 'omnipedia-team-v1';
export const TEAM_LIBRARY_STORAGE_KEY = 'omnipedia-teams-v2';
export const TEAM_NAME_LIMIT = 48;
export const CREATOR_TEAM_ID = creatorLineup.id;

export function emptyTeam() {
  return {
    main: Array(MAIN_TEAM_SIZE).fill(null),
    bonus: Array(BONUS_TEAM_SIZE).fill(null),
    bonusEnabled: false,
  };
}

export function restoreTeam(raw, validIds) {
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== 'object') return emptyTeam();
    const seen = new Set();
    const slots = (values, size) => Array.from({ length: size }, (_, index) => {
      const id = Array.isArray(values) ? values[index] : null;
      if (!validIds.has(id) || seen.has(id)) return null;
      seen.add(id);
      return id;
    });
    return {
      main: slots(value.main, MAIN_TEAM_SIZE),
      bonus: slots(value.bonus, BONUS_TEAM_SIZE),
      bonusEnabled: value.bonusEnabled === true,
    };
  } catch {
    return emptyTeam();
  }
}

export function assignPick(team, group, index, id) {
  if (!['main', 'bonus'].includes(group) || !Number.isInteger(index) || index < 0 || index >= team[group].length || !Number.isInteger(id) || id < 1) return team;
  if (group === 'bonus' && !team.bonusEnabled) return team;
  const occupied = team.main.some((value, position) => value === id && !(group === 'main' && position === index)) || (team.bonusEnabled && team.bonus.some((value, position) => value === id && !(group === 'bonus' && position === index)));
  if (occupied) return team;
  const next = { ...team, [group]: team[group].map((value, position) => position === index ? id : value) };
  // A form moved into the main ten no longer occupies a hidden bonus slot.
  if (group === 'main' && !team.bonusEnabled) next.bonus = team.bonus.map(value => value === id ? null : value);
  return next;
}

export function removePick(team, group, index) {
  if (!['main', 'bonus'].includes(group) || !Number.isInteger(index) || index < 0 || index >= team[group].length) return team;
  return { ...team, [group]: team[group].map((value, position) => position === index ? null : value) };
}

export function movePick(team, index, direction) {
  if (!Number.isInteger(index) || ![-1, 1].includes(direction) || index < 0 || index >= MAIN_TEAM_SIZE) return team;
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= MAIN_TEAM_SIZE) return team;
  const main = [...team.main];
  [main[index], main[nextIndex]] = [main[nextIndex], main[index]];
  return { ...team, main };
}

const cleanName = name => typeof name === 'string' ? name.trim().replace(/\s+/g, ' ') : '';
const nameKey = name => cleanName(name).toLowerCase();

export function teamNameError(name, teams, ignoreId) {
  const cleaned = cleanName(name);
  if (!cleaned) return 'Give your team a name.';
  if (cleaned.length > TEAM_NAME_LIMIT) return `Keep the name to ${TEAM_NAME_LIMIT} characters or fewer.`;
  if (nameKey(cleaned) === nameKey(creatorLineup.name) || teams.some(team => team.id !== ignoreId && nameKey(team.name) === nameKey(cleaned))) return 'That name is already in your library. Try another.';
  return '';
}

export function availableTeamName(base, teams) {
  const cleaned = cleanName(base).slice(0, TEAM_NAME_LIMIT) || 'My team';
  let candidate = cleaned;
  let number = 2;
  while (teamNameError(candidate, teams)) {
    const suffix = ` (${number++})`;
    candidate = `${cleaned.slice(0, TEAM_NAME_LIMIT - suffix.length)}${suffix}`;
  }
  return candidate;
}

export function getCreatorTeam(validIds) {
  return {
    id: CREATOR_TEAM_ID,
    name: creatorLineup.name,
    ...restoreTeam(JSON.stringify({ main: creatorLineup.main.map(pick => pick.id), bonus: creatorLineup.bonus.map(pick => pick.id), bonusEnabled: true }), validIds),
  };
}

export function restoreTeamLibrary(raw, legacyRaw, validIds) {
  const fallback = () => ({
    version: 2,
    activeTeamId: 'team-first',
    teams: [{ id: 'team-first', name: 'My first team', ...restoreTeam(legacyRaw, validIds) }],
  });
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 2 || !Array.isArray(value.teams)) return fallback();
    const teams = [];
    const ids = new Set([CREATOR_TEAM_ID]);
    // Reserve later valid IDs before generating replacements for malformed IDs.
    const reserved = new Set(value.teams.map(team => team?.id));
    value.teams.forEach((saved, index) => {
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return;
      let id = saved.id;
      if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(id) || ids.has(id)) {
        id = `team-recovered-${index + 1}`;
        while (ids.has(id) || reserved.has(id)) id += '-r';
      }
      ids.add(id);
      teams.push({ id, name: availableTeamName(cleanName(saved.name), teams), ...restoreTeam(JSON.stringify(saved), validIds) });
    });
    if (!teams.length) return fallback();
    return {
      version: 2,
      activeTeamId: value.activeTeamId === CREATOR_TEAM_ID || teams.some(team => team.id === value.activeTeamId) ? value.activeTeamId : teams[0].id,
      teams,
    };
  } catch {
    return fallback();
  }
}

export function addNamedTeam(library, name, id, source = emptyTeam()) {
  if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(id) || id === CREATOR_TEAM_ID || library.teams.some(team => team.id === id) || teamNameError(name, library.teams)) return library;
  const team = { id, name: cleanName(name), main: [...source.main], bonus: [...source.bonus], bonusEnabled: source.bonusEnabled };
  return { ...library, activeTeamId: id, teams: [...library.teams, team] };
}

export function renameTeam(library, id, name) {
  if (!library.teams.some(team => team.id === id) || teamNameError(name, library.teams, id)) return library;
  return { ...library, teams: library.teams.map(team => team.id === id ? { ...team, name: cleanName(name) } : team) };
}

export function deleteTeam(library, id) {
  if (library.teams.length <= 1 || !library.teams.some(team => team.id === id)) return library;
  const teams = library.teams.filter(team => team.id !== id);
  return { ...library, activeTeamId: library.activeTeamId === id ? teams[0].id : library.activeTeamId, teams };
}

export function updateTeam(library, id, updater) {
  if (!library.teams.some(team => team.id === id)) return library;
  return { ...library, teams: library.teams.map(team => team.id === id ? { ...team, ...updater(team), id: team.id, name: team.name } : team) };
}
