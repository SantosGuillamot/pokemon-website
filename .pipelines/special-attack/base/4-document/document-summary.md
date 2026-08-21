# Document Phase Summary: Special Attack Comparison Page

## What

The Document phase brought two existing project documentation surfaces into sync with the shipped `/special-attack` page:

- **`CONTENT.md`** — added a new `## 6. Special Attack` section describing the page as a product/content catalog entry, renumbering the subsequent sections (Damage Calculator → §7, Team Building → §8). Also added the Special Attack card to the Homepage section's feature-card enumeration.
- **`DESIGN_PLAN.md`** — updated both GAMES-dropdown enumerations in §8 (Navigation Header): the desktop "Center-right" bullet (labels only) and the "Nav items" bullet (label + path) now list `SPECIAL ATTACK` (`/special-attack`) as the fifth entry.

No source code was changed in this phase.

## Why

The build shipped a new page, a global "Games" navigation entry, and a homepage game card, but left two prose surfaces describing the site's pages and navigation out of date. `CONTENT.md` (the product content catalog) had no Special Attack section and omitted the new homepage card; `DESIGN_PLAN.md` §8 enumerated the GAMES dropdown without the new entry. Updating them keeps the product and design references trustworthy for the owners and contributors who rely on them.

## How

Two document-writer tasks, one per surface, each grounded in the shipped code:

- The `CONTENT.md` section mirrors the altitude and voice of the existing §2 (Who's Faster) product entry: a one-line summary plus bullets for the head-to-head "higher Special Attack" streak game (ties accepted, one wrong answer ends the run, current streak shown) and the sortable/searchable table of all Pokemon by Special Attack. It deliberately excludes the exact-value "guess the number" mode, which the build intentionally did not carry over.
- The `DESIGN_PLAN.md` edits mirror the shipped `GAME_LINKS` array in `src/components/Nav.ts`, appending `SPECIAL ATTACK` (`/special-attack`) as the fifth item in each enumeration and preserving each bullet's existing format. No other §8 content (tool links, dropdown mechanics, styling) was touched.

## Key decisions

- **Placement of the new `CONTENT.md` section** — inserted as §6, at the end of the game sections and immediately before Damage Calculator, matching the shipped homepage card order (Special Attack precedes Damage Calculator in `src/pages/home.ts`).
- **Describe only shipped behavior** — no exact-value quiz mode was documented, consistent with the spec's Out-of-Scope decision and the shipped page/store.
- **Minimal, additive edits** — existing entries in both documents were left unchanged; only the Special Attack additions and the necessary `CONTENT.md` renumbering were made.

## Known limitations

- Pre-existing drift in other surfaces was intentionally left untouched as out of scope: `PLAN.md`'s "Phase 3 — Pages" tracker already marks shipped mini-games as "Deferred" and is a build-phase tracker rather than a per-page catalog; `docs/deployment.md` is an empty stub. These were recorded in the document plan's sweep and are not this feature's concern.
