// Match positive ability records, never weaknesses or descriptive prose.
export const ABILITY_FILTERS = [
  { id: 'flight', label: 'Can fly', description: 'Flight or levitation.', aliases: ['fly', 'flying', 'can fly', 'flight', 'levitate', 'levitation'], pattern: /\bflight\b|\blevitation\b/ },
  { id: 'swim', label: 'Can swim', description: 'Swimming, underwater movement, or underwater breathing.', aliases: ['swim', 'swimming', 'can swim', 'aquatic', 'underwater', 'breathe underwater'], pattern: /swimming|underwater|deep sea pressure/ },
  { id: 'fire', label: 'Uses fire', description: 'Creates, projects, or manipulates fire or lava.', aliases: ['fire', 'use fire', 'uses fire', 'can use fire', 'fire powers', 'pyrokinesis'], pattern: /\bfire\b|pyrokinesis|lava projection|supernova blasts/ },
  { id: 'ice', label: 'Uses ice', description: 'Creates ice or freezing attacks.', aliases: ['ice', 'use ice', 'uses ice', 'can use ice', 'freezing', 'freeze', 'cryokinesis'], pattern: /\bice\b|\bfreeze\b|cryokinesis|enhanced cold powers/ },
  { id: 'electricity', label: 'Electricity', description: 'Electrical, lightning, or neuroshock powers.', aliases: ['electricity', 'electric', 'lightning', 'use electricity', 'uses electricity', 'electric powers'], pattern: /electric|electro|lightning|neuroshock|thunder clap/ },
  { id: 'strength', label: 'Super strength', description: 'Super, enhanced, or colossal strength.', aliases: ['super strength', 'strong', 'strength', 'enhanced strength'], pattern: /(?:super|enhanced|colossal) strength/ },
  { id: 'speed', label: 'Super speed', description: 'Super speed on land or in flight.', aliases: ['super speed', 'speed', 'fast', 'speedster', 'super fast'], pattern: /super speed/ },
  { id: 'regeneration', label: 'Regenerates', description: 'Regeneration or body reformation.', aliases: ['regeneration', 'regenerate', 'regenerates', 'can regenerate', 'healing', 'self healing'], pattern: /regeneration|body reformation/ },
  { id: 'water', label: 'Controls water', description: 'Hydrokinesis, water blasts, or moisture absorption.', aliases: ['water', 'water powers', 'controls water', 'use water', 'uses water', 'hydrokinesis'], pattern: /hydrokinesis|water blasts|moisture absorption/ },
  { id: 'plants', label: 'Controls plants', description: 'Plant or vine control and chlorokinesis.', aliases: ['plants', 'plant', 'controls plants', 'plant powers', 'chlorokinesis'], pattern: /chlorokinesis|plant control|vine control|vine stretching|merging with plants/ },
  { id: 'energy', label: 'Absorbs energy', description: 'Absorbs or drains energy or electricity.', aliases: ['energy absorption', 'absorbs energy', 'absorb energy', 'energy draining', 'drains energy'], pattern: /energy absorption|electric absorption|power draining|energy draining/ },
  { id: 'invisibility', label: 'Turns invisible', description: 'Invisibility, camouflage, or shadow blending.', aliases: ['invisible', 'invisibility', 'can turn invisible', 'turns invisible', 'camouflage'], pattern: /invisibility|camouflage|shadow blending/ },
  { id: 'phasing', label: 'Phases through matter', description: 'Intangibility: passing through solid matter.', aliases: ['phasing', 'phase', 'intangible', 'intangibility', 'phase through walls', 'go through walls'], pattern: /intangibility/ },
  { id: 'shapeshifting', label: 'Shape-shifting', description: 'Shape shifting is listed as an ability.', aliases: ['shape shifting', 'shapeshifting', 'shapeshifter', 'shape shift', 'changes shape'], pattern: /shape shifting|shapeshifting/ },
  { id: 'duplication', label: 'Can duplicate', description: 'Creates copies of itself.', aliases: ['duplication', 'duplicate', 'duplicates', 'can duplicate', 'cloning', 'clones'], pattern: /\bduplication\b/ },
  { id: 'technology', label: 'Uses technology', description: 'Merges with, controls, repairs, or rebuilds technology.', aliases: ['technology', 'tech', 'uses technology', 'controls technology', 'hacking', 'machines'], pattern: /technology|machine enhancement|machine dismantling|hacking|rapid repair|rebuilding/ },
  { id: 'mind', label: 'Mind powers', description: 'Telekinesis, possession, mind, dream, hypnosis, or fear powers.', aliases: ['mind powers', 'psychic', 'mind control', 'telekinesis', 'mind reading', 'dream powers'], pattern: /telekinesis|possession|mind control|mind reading|mind probing|dream manipulation|hypnosis|hallucination|fear aura|terror inducement/ },
  { id: 'time', label: 'Controls time', description: 'Manipulates time itself, rather than just perceiving it faster.', aliases: ['time', 'time powers', 'controls time', 'time control', 'time manipulation', 'time travel'], pattern: /^time (?:manipulation|rays|travel)$|age acceleration|age reversal|temporal paradox/ },
  { id: 'gravity', label: 'Controls gravity', description: 'Gravity fields, gravikinesis, or orbital control.', aliases: ['gravity', 'controls gravity', 'gravity powers', 'gravity control', 'gravikinesis'], pattern: /gravikinesis|gravity fields|gravity crush|orbital control|black hole creation/ },
  { id: 'teleportation', label: 'Can teleport', description: 'Teleportation, portals, or dimensional travel.', aliases: ['teleport', 'teleportation', 'can teleport', 'portals', 'portal', 'dimensional travel'], pattern: /teleportation|portal creation|dimensional travel/ },
  { id: 'sonic', label: 'Sonic attacks', description: 'Sonic attacks, sound barriers, or sound manipulation.', aliases: ['sonic', 'sound', 'sonic attacks', 'sound powers', 'sonic powers'], pattern: /sonic|sound barriers|sound manipulation/ },
];

const filtersById = new Map(ABILITY_FILTERS.map(filter => [filter.id, filter]));
const normalize = value => value.trim().toLowerCase().replace(/[-–—]/g, ' ').replace(/\s+/g, ' ');
const filtersByQuery = new Map(ABILITY_FILTERS.flatMap(filter => [...filter.aliases, filter.label].map(alias => [normalize(alias), filter])));

export function hasAbility(alien, id) {
  const filter = filtersById.get(id);
  return Boolean(filter && alien.abilities?.some(ability => !/\b(?:immunity|resistance)\b/i.test(ability) && filter.pattern.test(ability.toLowerCase())));
}

export function matchesAbilities(alien, selected) {
  return selected.every(id => hasAbility(alien, id));
}

export function matchesAlienSearch(alien, query) {
  const normalized = normalize(query);
  if (!normalized) return true;
  const ability = filtersByQuery.get(normalized);
  if (ability) return hasAbility(alien, ability.id);
  return [alien.name, alien.species, alien.homeworld, ...(alien.abilities || []), ...(alien.tags || [])]
    .some(value => typeof value === 'string' && normalize(value).includes(normalized));
}
