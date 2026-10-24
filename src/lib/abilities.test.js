import test from 'node:test';
import assert from 'node:assert/strict';
import aliens from '../data/aliens.js';
import { ABILITY_FILTERS, hasAbility, matchesAbilities, matchesAlienSearch } from './abilities.js';

const idsFor = id => aliens.filter(alien => hasAbility(alien, id)).map(alien => alien.id);
const alien = name => aliens.find(record => record.name === name);

test('fire, ice, and water filters use active powers in the real archive', () => {
  assert.deepEqual(idsFor('fire'), [1, 18, 20, 44, 47]);
  assert.deepEqual(idsFor('ice'), [18, 24, 47]);
  assert.deepEqual(idsFor('water'), [41]);
  assert.equal(hasAbility(alien('Heatblast'), 'water'), false);
});

test('swimming includes underwater breathing and underwater flight', () => {
  assert.deepEqual(idsFor('swim'), [8, 17, 23, 24, 33, 58]);
  assert.equal(hasAbility(alien('Jetray'), 'swim'), true);
  assert.equal(hasAbility(alien('Stinkfly'), 'swim'), false);
});

test('flight includes listed levitation without treating every bird or jumper as a flyer', () => {
  for (const name of ['Heatblast', 'Brainstorm', 'Lodestar', 'Gravattack']) assert.equal(hasAbility(alien(name), 'flight'), true, name);
  for (const name of ['Kickin Hawk', 'Crashhopper', 'Four Arms']) assert.equal(hasAbility(alien(name), 'flight'), false, name);
});

test('time control excludes XLR8 perception and duplication excludes the evolved Echo Echo', () => {
  assert.deepEqual(idsFor('time'), [29, 42]);
  assert.deepEqual(idsFor('duplication'), [17, 21]);
  assert.equal(hasAbility(alien('XLR8'), 'time'), false);
  assert.equal(hasAbility(alien('Ultimate Echo Echo'), 'duplication'), false);
});

test('weaknesses, immunity, and names never grant an active elemental ability', () => {
  const record = { name: 'Firefly', abilities: ['Fire Immunity', 'Ice Resistance', 'Enhanced Agility'], weaknesses: ['Water blasts', 'Electric attacks'], tags: ['FIRE', 'ICE'], fullDesc: 'Cannot fly or swim.' };
  for (const id of ['fire', 'ice', 'water', 'electricity', 'flight', 'swim']) assert.equal(hasAbility(record, id), false, id);
});

test('combined abilities require all selected powers and an empty selection restores the roster', () => {
  assert.deepEqual(aliens.filter(record => matchesAbilities(record, ['flight', 'fire'])).map(record => record.id), [1, 47]);
  assert.equal(aliens.filter(record => matchesAbilities(record, ['fire', 'swim'])).length, 0);
  assert.equal(aliens.filter(record => matchesAbilities(record, [])).length, 72);
  assert.equal(matchesAbilities(alien('Heatblast'), ['unknown-ability']), false);
});

test('plain-language searches work consistently with ability filters', () => {
  for (const [query, ability] of [['can fly', 'flight'], ['  USE   FIRE ', 'fire'], ['swimming', 'swim'], ['shape-shifting', 'shapeshifting'], ['can teleport', 'teleportation']]) {
    assert.deepEqual(aliens.filter(record => matchesAlienSearch(record, query)).map(record => record.id), idsFor(ability), query);
  }
  assert.equal(matchesAlienSearch(alien('Heatblast'), 'water'), false);
});

test('normal species, homeworld, ability, and name search remain available', () => {
  assert.equal(matchesAlienSearch(alien('Diamondhead'), 'petrosapien'), true);
  assert.equal(matchesAlienSearch(alien('Alien X'), 'Forge of Creation'), true);
  assert.equal(matchesAlienSearch(alien('Heatblast'), 'supernova'), true);
  assert.equal(matchesAlienSearch(alien('XLR8'), 'xlr8'), true);
  assert.equal(matchesAlienSearch(alien('XLR8'), '  '), true);
});

test('every offered capability has a real result and unique filter ID', () => {
  assert.equal(new Set(ABILITY_FILTERS.map(filter => filter.id)).size, ABILITY_FILTERS.length);
  for (const filter of ABILITY_FILTERS) assert.ok(idsFor(filter.id).length > 0, filter.label);
});
