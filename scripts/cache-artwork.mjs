import fs from 'node:fs/promises';
import path from 'node:path';
import aliens from '../src/data/aliens.js';

const destination = path.resolve('public/aliens');
await fs.mkdir(destination, { recursive: true });
const manifest = {};
const failures = [];
const canonicalNames = { Ripjaws: 'Ripjaws (Classic)', Chromastone: 'Chromastone (Classic)', Spidermonkey: 'Spidermonkey (Classic)', Heatblast: 'Heatblast (Classic)', Wildmutt: 'Wildmutt', Diamondhead: 'Diamondhead (Classic)', 'Grey Matter': 'Grey Matter (Classic)', 'Four Arms': 'Four Arms (Classic)', Stinkfly: 'Stinkfly (Classic)', Upgrade: 'Upgrade (Classic)', Cannonbolt: 'Cannonbolt (Classic)', Wildvine: 'Wildvine (Classic)', Humungousaur: 'Humungousaur (Classic)', Rath: 'Rath (Classic)', 'AmpFibian': 'Ampfibian (Classic)', ChamAlien: 'Chamalien', 'Jury Rigg': 'Juryrigg', 'Water Hazard': 'Waterhazard', 'Snare-oh': 'Snare-Oh', XLR8: 'XLR8 (Classic)' };
const wikiImages = {};
const sources = {};
const unavailable = new Set();
const galleries = JSON.parse(await fs.readFile(new URL('../src/data/galleries.json', import.meta.url), 'utf8'));
for (let start = 0; start < aliens.length; start += 25) {
  const group = aliens.slice(start, start + 25);
  const titles = group.map(alien => canonicalNames[alien.name] || alien.name);
  const params = new URLSearchParams({ action: 'query', prop: 'pageimages', piprop: 'original|thumbnail', pithumbsize: '600', titles: titles.join('|'), redirects: '1', format: 'json' });
  const response = await fetch(`https://ben10.fandom.com/api.php?${params}`, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Wiki image lookup failed: ${response.status}`);
  const result = await response.json();
  const normalized = new Map((result.query.normalized || []).map(entry => [entry.from, entry.to]));
  const redirected = new Map((result.query.redirects || []).map(entry => [entry.from, entry.to]));
  for (const alien of group) {
    let title = canonicalNames[alien.name] || alien.name;
    title = normalized.get(title) || title;
    title = redirected.get(title) || title;
    const page = Object.values(result.query.pages).find(entry => entry.title === title);
    if (page?.original && !page.original.source.includes('NoImageAvailable')) {
      wikiImages[alien.id] = page.thumbnail?.source || page.original.source;
      sources[alien.id] = { name: alien.name, page: `https://ben10.fandom.com/wiki/${title.replaceAll(' ', '_')}`, image: page.original.source };
    }
    if (page?.original?.source.includes('NoImageAvailable')) unavailable.add(alien.id);
  }
}
const overrides = {
  NRG: 'a/a2/NRG_OV.png',
  'Ultimate Swampfire': 'a/ab/Ultimate_Swampfire.png',
  'Ultimate Echo Echo': 'e/ef/Ultimate_Echo_Echo_official.png',
  'Ultimate Humungousaur': '4/4c/Ultimate_Humungousaur_official.png',
  'Ultimate Big Chill': 'c/c5/Ultimate_big_chill.png',
  Feedback: '7/7b/Feedback_OV_Official.png',
  Gravattack: '6/6f/Gravattack_OV_Pose.png',
  Atomix: '7/71/Atomix_Official.png',
  Toepick: '8/87/Toepick_OV_Official.png',
};
let cursor = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (cursor < aliens.length) {
    const alien = aliens[cursor++];
    if (galleries[alien.id]?.conceptOnly) {
      const concept = galleries[alien.id].images.find(image => image.caption === 'Isolated concept design');
      if (!concept) throw new Error(`Missing curated concept artwork for ${alien.name}`);
      await fs.access(path.resolve(`public${concept.src}`));
      manifest[alien.id] = concept.src;
      sources[alien.id] = {
        name: alien.name, page: concept.sourcePage, image: concept.originalUrl,
        file: concept.sourceFile, local: concept.src, credit: concept.credit,
        canonical: false, enhanced: concept.enhanced, width: concept.width, height: concept.height,
        sourceWidth: concept.sourceWidth, sourceHeight: concept.sourceHeight,
      };
      continue;
    }
    if (unavailable.has(alien.id)) continue;
    const filename = `${alien.id}.png`;
    try {
      await fs.access(path.join(destination, filename));
      manifest[alien.id] = `/aliens/${filename}`;
      continue;
    } catch { /* Download missing artwork. */ }
    const source = new URL(alien.image).searchParams.get('url');
    const direct = source ? `https://${source}` : alien.image;
    const alternatives = [wikiImages[alien.id], direct, alien.image].filter(Boolean);
    if (overrides[alien.name] && !wikiImages[alien.id]) alternatives.unshift(`https://static.wikia.nocookie.net/ben10/images/${overrides[alien.name]}/revision/latest`);
    for (const url of alternatives) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) continue;
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.length < 1000) continue;
        await fs.writeFile(path.join(destination, filename), bytes);
        manifest[alien.id] = `/aliens/${filename}`;
        break;
      } catch { /* Try the next source. */ }
    }
    if (!manifest[alien.id]) failures.push(alien.name);
  }
}));
await fs.writeFile('src/data/artwork.json', `${JSON.stringify(manifest, null, 2)}\n`);
await fs.writeFile('public/aliens/sources.json', `${JSON.stringify(sources, null, 2)}\n`);
console.log(JSON.stringify({ cached: Object.keys(manifest).length, unavailable: [...unavailable].filter(id => !manifest[id]), missing: failures }));
