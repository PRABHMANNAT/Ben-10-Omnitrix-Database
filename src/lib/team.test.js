import test from 'node:test';
import assert from 'node:assert/strict';
import { addNamedTeam, assignPick, availableTeamName, CREATOR_TEAM_ID, deleteTeam, emptyTeam, getCreatorTeam, movePick, removePick, renameTeam, restoreTeam, restoreTeamLibrary, teamNameError, updateTeam } from './team.js';
import aliens from '../data/aliens.js';

const validIds = new Set(Array.from({ length: 72 }, (_, index) => index + 1));

test('restoring a saved team enforces ten main slots, two bonus slots, and valid unique IDs', () => {
  const restored = restoreTeam(JSON.stringify({ main: [1, 1, 999, '2', 3], bonus: [3, 4, 5], bonusEnabled: true }), validIds);
  assert.equal(restored.main.length, 10);
  assert.equal(restored.bonus.length, 2);
  assert.deepEqual(restored.main.slice(0, 5), [1, null, null, null, 3]);
  assert.deepEqual(restored.bonus, [null, 4]);
  assert.equal(restored.bonusEnabled, true);
});

test('malformed or absent stored data starts a fresh team', () => {
  for (const raw of [null, 'not json', 'null', '42']) assert.deepEqual(restoreTeam(raw, validIds), emptyTeam());
});

test('a complete ten plus two roster survives serialization without an extra pick or duplicate', () => {
  let team = emptyTeam();
  for (let index = 0; index < 10; index++) team = assignPick(team, 'main', index, index + 1);
  team = { ...team, bonusEnabled: true };
  team = assignPick(team, 'bonus', 0, 11);
  team = assignPick(team, 'bonus', 1, 12);
  assert.strictEqual(assignPick(team, 'main', 10, 13), team);
  assert.strictEqual(assignPick(team, 'bonus', 2, 13), team);
  assert.strictEqual(assignPick(team, 'bonus', 1, 1), team);
  assert.strictEqual(assignPick(team, 'main', 0, 11), team);
  assert.deepEqual(restoreTeam(JSON.stringify(team), validIds), team);
});

test('replacing or removing a pick preserves every other rank', () => {
  let team = assignPick(emptyTeam(), 'main', 0, 1);
  team = assignPick(team, 'main', 4, 5);
  const replacement = assignPick(team, 'main', 0, 2);
  assert.equal(team.main[0], 1);
  assert.equal(replacement.main[0], 2);
  assert.equal(replacement.main[4], 5);
  assert.deepEqual(removePick(replacement, 'main', 0).main, [null, null, null, null, 5, null, null, null, null, null]);
});

test('reordering swaps adjacent ranks and respects the first and last slots', () => {
  let team = assignPick(emptyTeam(), 'main', 0, 1);
  team = assignPick(team, 'main', 1, 2);
  assert.deepEqual(movePick(team, 1, -1).main.slice(0, 2), [2, 1]);
  assert.deepEqual(movePick(team, 0, 1).main.slice(0, 2), [2, 1]);
  assert.strictEqual(movePick(team, 0, -1), team);
  assert.strictEqual(movePick(team, 9, 1), team);
});

test('hidden bonus choices persist, but a form moved into the main ten cannot be duplicated', () => {
  let team = { ...emptyTeam(), bonusEnabled: true };
  team = assignPick(team, 'bonus', 0, 11);
  team = { ...team, bonusEnabled: false };
  assert.equal(restoreTeam(JSON.stringify(team), validIds).bonus[0], 11);
  assert.strictEqual(assignPick(team, 'bonus', 1, 12), team);
  team = assignPick(team, 'main', 0, 11);
  assert.equal(team.main[0], 11);
  assert.equal(team.bonus[0], null);
});

test('the library migrates the original team with its ranking and hidden bonus picks intact', () => {
  const previous = { main: [4, 1, 3], bonus: [19, 45], bonusEnabled: false };
  const library = restoreTeamLibrary(null, JSON.stringify(previous), validIds);
  assert.equal(library.teams.length, 1);
  assert.equal(library.activeTeamId, library.teams[0].id);
  assert.deepEqual(library.teams[0].main.slice(0, 3), [4, 1, 3]);
  assert.deepEqual(library.teams[0].bonus, [19, 45]);
  assert.equal(library.teams[0].bonusEnabled, false);
});

test('named teams and the selected team survive serialization independently', () => {
  let library = restoreTeamLibrary(null, null, validIds);
  const originalId = library.activeTeamId;
  library = updateTeam(library, originalId, team => assignPick(team, 'main', 0, 4));
  library = addNamedTeam(library, '  Rescue   squad  ', 'team-rescue');
  library = updateTeam(library, 'team-rescue', team => assignPick(team, 'main', 0, 24));
  assert.equal(library.teams[1].name, 'Rescue squad');
  assert.equal(library.teams[0].main[0], 4);
  assert.equal(library.teams[1].main[0], 24);
  assert.deepEqual(restoreTeamLibrary(JSON.stringify(library), null, validIds), library);
});

test('copying a creator lineup creates independent slots and cannot edit the preset', () => {
  const creator = getCreatorTeam(validIds);
  let library = restoreTeamLibrary(null, null, validIds);
  assert.strictEqual(updateTeam(library, CREATOR_TEAM_ID, () => emptyTeam()), library);
  library = addNamedTeam(library, 'My all-rounders', 'team-copy', creator);
  const copied = library.teams[1];
  assert.deepEqual(copied.main, creator.main);
  assert.notStrictEqual(copied.main, creator.main);
  library = updateTeam(library, 'team-copy', team => removePick(team, 'main', 0));
  assert.equal(library.teams[1].main[0], null);
  assert.equal(creator.main[0], 29);
  assert.strictEqual(deleteTeam(library, CREATOR_TEAM_ID), library);
});

test('renaming preserves picks and rejects empty, duplicate, reserved, and oversized names', () => {
  let library = restoreTeamLibrary(null, null, validIds);
  library = addNamedTeam(library, 'Rescue', 'team-rescue');
  library = updateTeam(library, 'team-rescue', team => assignPick(team, 'main', 0, 4));
  for (const name of ['', '  ', 'My first team', "Creator's favorites", 'x'.repeat(49)]) assert.strictEqual(renameTeam(library, 'team-rescue', name), library);
  const renamed = renameTeam(library, 'team-rescue', '  My favorites  ');
  assert.equal(renamed.teams[1].name, 'My favorites');
  assert.equal(renamed.teams[1].main[0], 4);
  assert.equal(teamNameError('my FAVORITES', renamed.teams).length > 0, true);
  assert.equal(teamNameError('My favorites', renamed.teams, 'team-rescue'), '');
  assert.equal(availableTeamName('My favorites', renamed.teams), 'My favorites (2)');
});

test('deleting the active team selects a remaining team and keeps at least one personal team', () => {
  let library = restoreTeamLibrary(null, null, validIds);
  const originalId = library.activeTeamId;
  library = addNamedTeam(library, 'Second team', 'team-second');
  assert.equal(library.activeTeamId, 'team-second');
  library = deleteTeam(library, 'team-second');
  assert.equal(library.activeTeamId, originalId);
  assert.strictEqual(deleteTeam(library, originalId), library);
  library = { ...library, activeTeamId: CREATOR_TEAM_ID };
  library = addNamedTeam(library, 'Spare team', 'team-spare');
  library = { ...library, activeTeamId: CREATOR_TEAM_ID };
  assert.equal(deleteTeam(library, 'team-spare').activeTeamId, CREATOR_TEAM_ID);
});

test('damaged library entries recover with unique IDs, names, and valid picks', () => {
  const saved = { version: 2, activeTeamId: 'missing', teams: [null, { id: 'duplicate', name: 'Rescue', main: [4, 4, 999] }, { id: 'duplicate', name: ' rescue ' }, { id: CREATOR_TEAM_ID, name: "Creator's favorites" }, { id: 'team-recovered-3', name: '' }] };
  const library = restoreTeamLibrary(JSON.stringify(saved), null, validIds);
  assert.equal(library.teams.length, 4);
  assert.equal(new Set(library.teams.map(team => team.id)).size, 4);
  assert.equal(new Set(library.teams.map(team => team.name.toLowerCase())).size, 4);
  assert.equal(library.teams.some(team => team.id === CREATOR_TEAM_ID), false);
  assert.equal(library.activeTeamId, library.teams[0].id);
  assert.deepEqual(library.teams[0].main.slice(0, 3), [4, null, null]);
  for (const raw of ['not json', 'null', '{"version":2,"teams":[]}', '{"version":2,"teams":{}}']) assert.equal(restoreTeamLibrary(raw, null, validIds).teams.length, 1);
});

test('the creator preset contains ten plus two unique aliens present in the real archive', () => {
  const creator = getCreatorTeam(new Set(aliens.map(alien => alien.id)));
  assert.equal(creator.main.length, 10);
  assert.equal(creator.bonus.length, 2);
  assert.equal(creator.bonusEnabled, true);
  assert.equal(new Set([...creator.main, ...creator.bonus]).size, 12);
  assert.equal([...creator.main, ...creator.bonus].every(Number.isInteger), true);
  const library = { ...restoreTeamLibrary(null, null, validIds), activeTeamId: CREATOR_TEAM_ID };
  assert.equal(restoreTeamLibrary(JSON.stringify(library), null, validIds).activeTeamId, CREATOR_TEAM_ID);
});
