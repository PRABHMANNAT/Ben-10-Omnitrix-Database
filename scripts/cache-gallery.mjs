import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const selection = JSON.parse(await readFile(path.join(root, 'scripts/gallery-selection.json'), 'utf8'));
const directory = path.join(root, 'tmp/gallery/originals');
await mkdir(directory, { recursive: true });
const queue = Object.entries(selection).flatMap(([id, entry]) => entry.images.map((image, i) => ({ id: `${id}-${i + 1}`, url: image.originalUrl })));
let completed = 0;
async function download() {
  while (queue.length) {
    const item = queue.shift();
    const url = new URL(item.url);
    if (url.protocol !== 'https:' || url.hostname !== 'static.wikia.nocookie.net') throw new Error(`Unexpected media host: ${url.hostname}`);
    let failure;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
        if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`Image request failed: ${response.status}`);
        await writeFile(path.join(directory, `${item.id}.png`), Buffer.from(await response.arrayBuffer()));
        failure = null;
        break;
      } catch (error) { failure = error; }
    }
    if (failure) throw new Error(`${item.id}: ${failure.message}`);
    completed++;
  }
}
await Promise.all(Array.from({ length: 4 }, download));
console.log(`Cached ${completed} original sources. Run python scripts/build-gallery.py to encode.`);
