import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import aliens from '../data/aliens.js';
import { firstActionIndex, wrapImageIndex } from './gallery.js';

const manifest = JSON.parse(readFileSync(new URL('../data/galleries.json', import.meta.url)));

test('every alien has three or four verified, local images with source credits', () => {
  assert.equal(Object.keys(manifest).length, aliens.length);
  let total = 0;
  let enhanced = 0;
  for (const alien of aliens) {
    const gallery = manifest[alien.id];
    assert.equal(gallery.name, alien.name);
    assert.ok(gallery.images.length >= 3 && gallery.images.length <= 4, alien.name);
    const hashes = new Set();
    for (const image of gallery.images) {
      assert.match(image.src, new RegExp(`^/gallery/${alien.id}/[1-4]\\.webp$`));
      const bytes = readFileSync(new URL(`../../public${image.src}`, import.meta.url));
      assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
      assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
      assert.equal(bytes.length, image.bytes);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), image.sha256);
      assert.ok(!hashes.has(image.sha256), `${alien.name}: duplicate picture`);
      hashes.add(image.sha256);
      assert.ok(image.caption && image.credit);
      assert.equal(new URL(image.sourceFile).hostname, 'ben10.fandom.com');
      assert.equal(new URL(image.originalUrl).hostname, 'static.wikia.nocookie.net');
      assert.ok(Math.max(image.width, image.height) >= 1000, image.id);
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
  assert.equal(total, 281);
  assert.equal(enhanced, 8);
});

test('unseen alien designs are clearly identified as non-canon concepts', () => {
  for (const id of [70, 71]) {
    assert.equal(manifest[id].conceptOnly, true);
    for (const image of manifest[id].images) {
      assert.equal(image.kind, 'concept');
      assert.match(image.credit, /Thomas N\. Perkins IV.*non-canon/);
    }
  }
});

test('gallery navigation wraps both directions and handles an empty collection', () => {
  assert.equal(wrapImageIndex(-1, 4), 3);
  assert.equal(wrapImageIndex(4, 4), 0);
  assert.equal(wrapImageIndex(-9, 4), 3);
  assert.equal(wrapImageIndex(3, 0), 0);
});

test('galleries open on action when available and fall back to artwork', () => {
  assert.equal(firstActionIndex([{ kind: 'design' }, { kind: 'power' }]), 1);
  assert.equal(firstActionIndex([{ kind: 'concept' }]), 0);
  assert.equal(firstActionIndex([]), 0);
});
