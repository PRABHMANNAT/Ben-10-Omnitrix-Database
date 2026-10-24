export const MAIN_TEAM_SIZE = 10;
export const BONUS_TEAM_SIZE = 2;
export const TEAM_STORAGE_KEY = 'omnipedia-team-v1';

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
