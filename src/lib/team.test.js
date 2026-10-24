import test from 'node:test';
import assert from 'node:assert/strict';
import { assignPick, emptyTeam, movePick, removePick, restoreTeam } from './team.js';

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
