import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import aliens from '../data/aliens.js';
import { firstActionIndex, wrapImageIndex } from './gallery.js';

const selection = JSON.parse(readFileSync(new URL('../../scripts/gallery-selection.json', import.meta.url)));
const manifest = JSON.parse(readFileSync(new URL('../data/galleries.json', import.meta.url)));

test('every alien has verified local images matching its curated sources', () => {
  assert.equal(Object.keys(manifest).length, aliens.length);
  let total = 0;
  let enhanced = 0;
  for (const alien of aliens) {
    const gallery = manifest[alien.id];
    assert.equal(gallery.name, alien.name);
    assert.ok(gallery.images.length >= 3 && gallery.images.length <= 8, alien.name);
    assert.equal(gallery.images.length, selection[alien.id].images.length);
    const hashes = new Set();
    for (const image of gallery.images) {
      assert.match(image.src, new RegExp(`^/gallery/${alien.id}/[1-8]\\.webp$`));
      const bytes = readFileSync(new URL(`../../public${image.src}`, import.meta.url));
      assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
      assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
      assert.equal(bytes.length, image.bytes);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), image.sha256);
      assert.ok(!hashes.has(image.sha256), `${alien.name}: duplicate picture`);
      hashes.add(image.sha256);
      assert.ok(image.caption && image.credit);
      assert.equal(new URL(image.sourceFile).protocol, 'https:');
      assert.equal(new URL(image.originalUrl).protocol, 'https:');
      assert.equal(new URL(image.sourcePage).protocol, 'https:');
      assert.ok(Math.max(image.width, image.height) >= 700, image.id);
      assert.ok(image.width > 0 && image.height > 0, image.id);
      const source = selection[alien.id].images[Number(image.id.split('-')[1]) - 1];
      assert.equal(image.originalUrl, source.originalUrl, image.id);
      if (image.kind === 'fanart') assert.match(image.credit, /non-canon fan interpretation/i);
      if (!image.enhanced) {
        assert.equal(image.width, image.sourceWidth, image.id);
        assert.equal(image.height, image.sourceHeight, image.id);
      } else {
        enhanced++;
        assert.ok(image.width > image.sourceWidth && image.height > image.sourceHeight);
      }
      total++;
    }
  }
  assert.equal(total, Object.values(selection).reduce((sum, entry) => sum + entry.images.length, 0));
  assert.equal(enhanced, 8);
});

test('unseen alien designs are clearly identified as non-canon concepts', () => {
  for (const id of [70, 71]) {
    assert.equal(manifest[id].conceptOnly, true);
    for (const image of manifest[id].images) {
      assert.ok(['concept', 'fanart'].includes(image.kind));
      assert.match(image.credit, /non-canon/);
      if (image.kind === 'concept') assert.match(image.credit, /Thomas N\. Perkins IV/);
    }
  }
});

test('gallery navigation wraps both directions and handles an empty collection', () => {
  assert.equal(wrapImageIndex(-1, 4), 3);
  assert.equal(wrapImageIndex(4, 4), 0);
  assert.equal(wrapImageIndex(-9, 4), 3);
  assert.equal(wrapImageIndex(3, 0), 0);
  assert.equal(wrapImageIndex(-1, 8), 7);
  assert.equal(wrapImageIndex(8, 8), 0);
});

test('galleries open on action when available and fall back to artwork', () => {
  assert.equal(firstActionIndex([{ kind: 'design' }, { kind: 'power' }]), 1);
  assert.equal(firstActionIndex([{ kind: 'concept' }]), 0);
  assert.equal(firstActionIndex([]), 0);
});


test('expanded archive has 566 images with the special five-image Alien X set', () => {
  assert.equal(Object.values(manifest).reduce((sum, entry) => sum + entry.images.length, 0), 566);
  for (const alien of aliens) {
    const count = manifest[alien.id].images.length;
    assert.ok(alien.id === 29 ? count === 5 : count === 7 || count === 8, alien.name);
  }
  assert.deepEqual(selection[29].images.slice(2).map(image => image.file), ['Alien X AP1.png', 'Alien X AP2.png', 'Alien X AP3.png']);
});
