# Contributing to Omnipedia

Thanks for helping improve the archive. Small, focused pull requests are easiest to review. For a larger feature, open an issue first so its scope can be discussed.

## Get started

Fork and clone the repository, use Node.js 22.12 or newer, then run:

```bash
npm ci
npm run dev
```

Create a branch for your change. Keep dependency changes separate unless the fix requires them.

## Where changes belong

| Change | Start here |
| :--- | :--- |
| Alien details, abilities, or statistics | `src/data/aliens.js` |
| Artwork mapping | `src/data/artwork.json` |
| Artwork source references | `public/aliens/sources.json` |
| Team rules and storage recovery | `src/lib/team.js` |
| Team interface and library controls | `src/components/TeamBuilder.jsx`, `src/components/TeamLibrary.jsx`, `src/styles/team.css` |
| Creator's favorites preset and pick explanations | `src/data/creatorTeam.js` |
| Shared layout and appearance | `src/styles/globals.css` |
| Dialog focus and keyboard behavior | `src/hooks/useDialog.js` |

For lore corrections, include the episode, scene, or source that supports the change. For artwork, include its original source and attribution information. Numerical ratings should be treated as fan comparisons.

## Check your change

```bash
npm run build
node --test src/lib/team.test.js
npm run lint
```

Report any pre-existing check failures separately from failures introduced by your change. For interface work, verify the affected flow in the browser, including a narrow viewport and keyboard navigation. Include before/after screenshots in the pull request.

Team changes should preserve the ten main slots, two optional bonus slots, duplicate prevention within each team, reordering, and recovery from invalid saved data. Named teams must keep independent picks, and migration must preserve the original saved lineup. Copies of the creator preset must be editable without changing the preset itself. Add a focused regression test when changing these rules.

## Visual direction

Keep charcoal surfaces, subtle sage accents, readable contrast, restrained animation, and responsive layouts consistent with the Black Edition. Respect reduced-motion preferences and keep controls accessible by keyboard.

## Pull request checklist

- Explain the concrete problem and resulting behavior.
- Keep the change focused and exclude generated builds, local settings, and credentials.
- List the checks you ran and any relevant limitations.
- Include sources for lore or artwork changes and screenshots for visual changes.

Contributions do not change the ownership of Ben 10 characters or third-party artwork. The repository currently has no declared code license.
