# Visual archive: sources and image processing

The archive includes **560 images across all 72 alien records**, with seven or eight images for most records, five for Alien X, and four each for Sandbox and Snakepit. Selection combines character designs, alternate series appearances, episode frames, power demonstrations, gameplay, and credited concepts where available. It does not claim that every alien has appeared in several series or has several canonical designs.

## Credits and provenance

Sources include the public **Ben 10 Wiki** file archive and individually credited artist portfolios and artwork repost pages. Ben 10 characters, episode frames, and official artwork belong to their respective owners, including Cartoon Network and Man of Action. Wiki hosting does not grant a new license to this artwork. This is an independent fan project.

- [Curated source selection](../scripts/gallery-selection.json): original filename, URL, dimensions, source page, and caption for each picture.
- [Runtime manifest](../src/data/galleries.json): local paths, actual pixel sizes, original source sizes, enhancement flags, credits, byte sizes, and SHA-256 checksums.
- Each gallery links to the source file's page and opens its local full-resolution image on request.
- [Heatblast gallery](https://ben10.fandom.com/wiki/Heatblast_(Classic)/Gallery) is one example of the original reference galleries.

**Sandbox and Snakepit:** neither alien was shown on screen. Their galleries are explicitly marked **non-canon concepts by Thomas N. Perkins IV**, with a full illustration, a shared scale chart, and an isolated rendering. Each gallery keeps its first four images: those three concept presentations followed by one individually credited TheHawkDown fan interpretation. Later images have been removed. These are different presentations of a concept, not three separate canonical forms. See [Sandbox](https://ben10.fandom.com/wiki/Sandbox) and [Snakepit](https://ben10.fandom.com/wiki/Snakepit).

The isolated, AI-enhanced images (`70/3.webp` and `71/3.webp`) also serve as the main cover artwork throughout the app. Cards display a concept/enhancement badge; profile captions and image descriptions identify these as non-canon concepts. Original source links and dimensions remain available in their galleries and the cover source manifest. The cover cache utility preserves these curated selections when refreshed.

**Portaler:** game material and concept art are labeled separately. Derrick J. Wyatt is credited on his concept drawing and scale chart. The original game concept and Fuel Run gameplay are not presented as on-screen Omniverse appearances.

## Expanded galleries

Alien X retains its first two images and replaces the previous final two scenes with three full-body flight poses (five images total). Most other aliens retain their previous images and append four. Sandbox and Snakepit each retain only their first four images. Five smaller galleries have seven images, and the remaining 64 have eight. There are 560 images overall.

New selections were visually reviewed in contact sheets. Frames dominated by empty scenery, effects, feet, distant groups, or unrelated characters were replaced. The viewer uses `object-fit: contain` so wide scenes and tall illustrations remain uncropped. The image gallery appears directly below the profile statistics. Its four-column thumbnail grid shows eight images in two rows, including on mobile, and supports keyboard navigation.

The following additions are **non-canon fan interpretations**, not official alternate series forms. Artist marks remain in the images:

- **TheHawkDown:** [Portaler](https://www.thehawkdown.com/portaler), [Sandbox](https://www.thehawkdown.com/sandbox), [Snakepit](https://www.thehawkdown.com/snakepit), and [Jury Rigg](https://www.thehawkdown.com/jury-rigg), plus an earlier [Portaler design](https://www.deviantart.com/thehawkdown/art/Portaler-896405636).
- **Spyro2108:** [Portaler](https://www.deviantart.com/spyro2108/art/Ben-10-Alien-Portaler-849661335).
- **WhiteSnakeShinobi / A.S.K. AIR:** [Portaler red-helmet interpretation](https://askair.weebly.com/unseen-ben-10-aliens.html).

These links document provenance, not a blanket reuse license. For fan art, the source button links to the artist or the identified repost page. All files are served locally, so expiring source CDN tokens do not affect normal viewing. A future refresh may need a fresh public URL from the same credited page.

## Resolution and processing

A few fan illustrations and one Jury Rigg model are smaller than 1,000 pixels on their longest edge; they retain their native size and are not described as HD. No new AI enhancements were used in this expansion.

Original dimensions are preserved during WebP encoding (quality 94); images are not cropped or stretched. Episode frames include native 1280 × 720 and 1920 × 1080 sources, alongside portrait artwork and source images with other aspect ratios. The viewer displays actual dimensions, rather than describing every source as native Full HD. Promotional artwork scans remain scans; encoding cannot recover details absent from the source.

Eight smaller images received an **AI-assisted upscale with the imagegen skill**. They are visibly labeled **AI-enhanced** in the viewer, with original dimensions and a link to compare the original. Reconstruction may change small details. These files are committed so contributors do not need image-generation tools to run the app.

| Asset | Subject | Original → enhanced pixels |
| :--- | :--- | :--- |
| `38/2.webp` | Chamalien crawling in a corridor | 1024 × 576 → 1672 × 941 |
| `38/3.webp` | Chamalien camouflage scene | 1024 × 576 → 1672 × 941 |
| `47/3.webp` | Ultimate Big Chill ice flame breath | 1024 × 576 → 1672 × 941 |
| `47/4.webp` | Ultimate Big Chill flying over a roof | 1024 × 576 → 1672 × 941 |
| `51/3.webp` | Ultimate Wildmutt biting an arm | 1024 × 576 → 1672 × 941 |
| `69/3.webp` | Portaler Fuel Run gameplay | 961 × 500 → 1740 × 904 |
| `70/3.webp` | Isolated Sandbox concept | 534 × 468 → 1340 × 1174 |
| `71/3.webp` | Isolated Snakepit concept | 465 × 538 → 1166 × 1349 |

The enhancement prompt set used the subject from the table with this instruction:

> Enhance this exact existing image for a high-resolution fan encyclopedia gallery. Faithful restoration/upscale, not redesign or a new illustration. Preserve the composition, characters, proportions, poses, expressions, colors, outlines, clothing, emblems, background objects, effects, text, and source marks. Clean compression noise and pixel stairs while retaining the flat 2D style. Do not add objects, details, lighting, gradients, glow, text, framing, or watermarks. Preserve the full frame and aspect ratio. For cutouts, preserve transparency; for gameplay, preserve icons and numbers.

The Ultimate Big Chill pair additionally specified that the result would be labeled as an AI-enhanced source frame. All eight enhanced outputs were visually reviewed against their source.

## Refreshing the local assets

Normal development requires no download or Python dependency. To rebuild gallery assets, use Node.js 22.12+ and Python with Pillow installed:

```bash
node scripts/cache-gallery.mjs
python scripts/build-gallery.py
node --test src/lib/gallery.test.js
```

The download command retrieves public originals into ignored `tmp/gallery/originals/`. The encoder preserves the committed enhanced WebPs when the corresponding private working PNG is absent. It never silently labels an unenhanced original as enhanced. To replace an enhancement, supply a reviewed PNG at `tmp/gallery/enhanced/<alien-id>-<image-index>.png` before encoding, and update the provenance table if its dimensions change.

The manifest is bundled with the lazy-loaded Gallery component. Only the selected alien's gallery images are requested when its profile opens; the 82.0 MiB collection is not downloaded on the home screen. All gallery images are served locally and require no runtime image API.
