# Contributing to Omnipedia

Thanks for helping improve the archive. Small, focused pull requests are easiest to review. For a larger feature, open an issue first so its scope can be discussed.

## Get started

Fork and clone the repository, use Node.js 22.12 or newer, then run:

```bash
npm ci
npm run dev
```

Create a branch for your change. Keep dependency changes separate unless the fix requires them.
This is a React JavaScript project: use `.jsx` for components and `.js` for hooks and shared logic. `jsconfig.json` supplies editor configuration, and the checked-in lockfile keeps dependency versions consistent.

## Where changes belong

| Change | Start here |
| :--- | :--- |
| React entry point and app composition | `src/main.jsx`, `src/App.jsx` |
| Project scripts and JavaScript tooling | `package.json`, `jsconfig.json`, `eslint.config.js`, `vite.config.js` |
| Alien details, abilities, or statistics | `src/data/aliens.js` |
| Gallery selection, credits, and processing | `scripts/gallery-selection.json`, `docs/GALLERY_SOURCES.md` |
| Gallery viewer and manifest | `src/components/AlienGallery.jsx`, `src/data/galleries.json` |
| Artwork mapping | `src/data/artwork.json` |
| Artwork source references | `public/aliens/sources.json` |
| Team rules and storage recovery | `src/lib/team.js` |
| Team interface and library controls | `src/components/TeamBuilder.jsx`, `src/components/TeamLibrary.jsx`, `src/styles/team.css` |
| Creator's favorites preset and pick explanations | `src/data/creatorTeam.js` |
| Shared ability matching and plain-language search | `src/lib/abilities.js` |
| Ability filter controls and styling | `src/components/AbilityFilters.jsx`, `src/styles/abilities.css` |
| Shared layout and appearance | `src/styles/globals.css` |
| Dialog focus and keyboard behavior | `src/hooks/useDialog.js` |

For lore corrections, include the episode, scene, or source that supports the change. For artwork, include its original source and attribution information. Numerical ratings should be treated as fan comparisons.

## Check your change

```bash
npm run check
```

This runs project-wide lint, the Node test suite, and a production build. Use `npm test` or `npm run test:watch` for focused development; `.test.js` files are discovered automatically. Browser source uses React rules, while tests and scripts use the Node environment. Generated `dist/` output and working files in `tmp/` are excluded from lint and Git.

For interface work, verify the affected flow in the browser, including a narrow viewport and keyboard navigation. Include before/after screenshots in the pull request.

Team changes should preserve the ten main slots, two optional bonus slots, duplicate prevention within each team, reordering, and recovery from invalid saved data. Named teams must keep independent picks, and migration must preserve the original saved lineup. Copies of the creator preset must be editable without changing the preset itself. Add a focused regression test when changing these rules.

Ability matching is shared between the archive and team picker. Match active powers from ability records, rather than weaknesses or immunity alone. Multiple selected abilities must all match. Test representative matches and false positives when changing a category or search alias.

Gallery changes must retain source links, accurate dimensions, enhancement labels, and non-canon concept notices. Keep three or four images per alien and run the gallery integrity checks after rebuilding assets. See [gallery provenance](docs/GALLERY_SOURCES.md) for the optional refresh workflow.

## Visual direction

Keep charcoal surfaces, subtle sage accents, readable contrast, restrained animation, and responsive layouts consistent with the Black Edition. Respect reduced-motion preferences and keep controls accessible by keyboard.

## Pull request checklist

- Explain the concrete problem and resulting behavior.
- Keep the change focused and exclude generated builds, local settings, and credentials.
- List the checks you ran and any relevant limitations.
- Include sources for lore or artwork changes and screenshots for visual changes.

Contributions do not change the ownership of Ben 10 characters or third-party artwork. The repository currently has no declared code license.
