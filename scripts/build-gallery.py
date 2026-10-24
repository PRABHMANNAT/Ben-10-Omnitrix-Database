"""Encode curated sources without resizing. Requires Pillow; see docs/GALLERY_SOURCES.md."""
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
selection = json.loads((ROOT / 'scripts/gallery-selection.json').read_text(encoding='utf-8-sig'))


def encode(job):
    alien_id, index, item = job
    target = ROOT / f'public/gallery/{alien_id}/{index}.webp'
    target.parent.mkdir(parents=True, exist_ok=True)
    enhanced = item['enhance']
    source = ROOT / f'tmp/gallery/{"enhanced" if enhanced else "originals"}/{alien_id}-{index}.png'
    if source.exists():
        with Image.open(source) as image:
            image.convert('RGBA' if 'A' in image.getbands() or 'transparency' in image.info else 'RGB').save(target, 'WEBP', quality=94, method=4)
    elif not (enhanced and target.exists()):
        raise FileNotFoundError(f'Missing source: {source}. Download originals or retain the committed enhanced WebP.')
    with Image.open(target) as image:
        width, height = image.size
    credit = 'Cartoon Network / Man of Action. Source: Ben 10 Wiki.'
    if alien_id in ('70', '71'):
        credit = 'Thomas N. Perkins IV — non-canon concept art. Source: Ben 10 Wiki.'
    elif alien_id == '69' and index in (2, 4):
        credit = 'Derrick J. Wyatt — concept art. Source: Ben 10 Wiki.'
    elif 'Pedro Astudillo' in item['file']:
        credit = 'Pedro Astudillo — character artwork. Ben 10 / Cartoon Network. Source: Ben 10 Wiki.'
    credit = item.get('credit', credit)
    return alien_id, {
        'id': f'{alien_id}-{index}', 'src': f'/gallery/{alien_id}/{index}.webp',
        'caption': item['caption'], 'kind': item['kind'], 'series': item.get('era', ''),
        'width': width, 'height': height, 'sourceWidth': item['width'], 'sourceHeight': item['height'],
        'enhanced': enhanced, 'sourcePage': item.get('sourcePage') or 'https://ben10.fandom.com/wiki/' + item['source'].replace(' ', '_'),
        'sourceFile': item['sourceFile'], 'originalUrl': item['originalUrl'], 'credit': credit,
        'bytes': target.stat().st_size, 'sha256': sha256(target.read_bytes()).hexdigest(),
    }


if __name__ == '__main__':
    manifest = {key: {'name': entry['name'], 'conceptOnly': entry['conceptOnly'], 'images': []} for key, entry in selection.items()}
    jobs = [(key, index, item) for key, entry in selection.items() for index, item in enumerate(entry['images'], 1)]
    with ThreadPoolExecutor(max_workers=4) as pool:
        for key, image in pool.map(encode, jobs):
            manifest[key]['images'].append(image)
    (ROOT / 'src/data/galleries.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    total = sum(image['bytes'] for entry in manifest.values() for image in entry['images'])
    print(f'{len(jobs)} images / {len(manifest)} galleries / {total / 1024 / 1024:.1f} MiB')
