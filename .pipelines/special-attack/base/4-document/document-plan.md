# Document Plan: Special Attack Comparison Page

## Overview

The build shipped a new `/special-attack` page that mirrors the existing "Who's Faster?" Speeds page for the Special Attack stat: a hero, a "Learn Special Attack" selector of two section cards, a head-to-head "guess which Pokemon has the higher Special Attack" streak game (ties accepted, streak visible, one wrong answer ends the run), and a sortable/searchable table of all Pokemon by Special Attack. It is discoverable from the global "Games" navigation (label `SPECIAL ATTACK`, 5th entry in `GAME_LINKS`) and a homepage game card (title "Special Attack", `Zap` icon). New source files are `src/pages/special-attack.ts` and `src/client/stores/pages/special-attack.ts`; existing files touched additively are `src/routes/index.ts`, `scripts/build.ts`, `src/components/Nav.ts`, and `src/pages/home.ts`. No new data model, schema, API, or CSS shipped — the page reads the already-loaded `spAttack` field.

I swept the repository end-to-end for prose that describes the site's pages/games or the navigation, so anything that references the behavior this build changed would be caught. Two documentation surfaces are now out of sync with the shipped reality and each gets a task:

- **`CONTENT.md`** (product content spec) — enumerates the site's feature pages as numbered sections (Homepage, Who's Faster, KO or Not, Learn Types, Roles, Damage Calculator, Team Building) and lists the homepage feature cards. It has no Special Attack section and its homepage-card enumeration omits the shipped Special Attack card. → Task 1.
- **`DESIGN_PLAN.md`** — the "Navigation Header" section (§8) enumerates the GAMES dropdown items twice (lines ~260 and ~266) as `TYPES, SPEEDS, ROLES, WILL IT KO?`, omitting the shipped `SPECIAL ATTACK` (`/special-attack`) entry. → Task 2.

Surfaces swept that need **no** change (recorded so the sweep is auditable):

- **`PLAN.md`** — the "Phase 3 — Pages" table tracks build phases, not a per-page catalog, and already marks the shipped Types and Speed mini-games as "Deferred" (pre-existing drift unrelated to this feature). Special Attack is not a distinct phase item; adding a row to an already-inaccurate phase tracker would not reflect a coherent update. Out of scope — pre-existing drift, not this feature's concern.
- **`docs/deployment.md`** — empty stub (only a `# Deployment` heading); unrelated to page content or navigation.
- **`.rp.md`** — pipeline conventions; its "Special Attack page" mention is an illustrative naming-convention example, not a page catalog.
- **`data/champions/*.md`** (`diff-moves.md`, `diff-pokemon.md`, `missing-images.md`) — data-generation notes about the Pokemon dataset; no page/navigation prose.
- **No root `README`** exists, and `docs/` contains only the empty deployment stub — nothing to update there. Grep for `README`/`CHANGELOG` returned nothing to touch.
- **Source files matched by grep** (`src/pages/speeds.ts`, `roles.ts`, `design-system.ts`, `src/client/stores/pages/speeds.ts`) matched only on their own `speed`/`special` content; they carry no stale prose about the new page. The new files' JSDoc/inline comments were authored by the build phase — code comments are the build's domain and are not documentation-plan tasks (this plan produces documentation only, not code changes).

## Guardrail scopes

No guardrail gates are assigned to document agents in this project, so there are no scopes to fill.

| Gate | Scope |
| ---- | ----- |
| None | None |

## Tasks

### Task 1: Add the Special Attack page to CONTENT.md

- **Goal:** Bring the product content spec in sync with the shipped `/special-attack` page by adding a dedicated section describing it, and by including its homepage card in the homepage feature-card enumeration.
- **Audience:** Product/content owner and contributors who use `CONTENT.md` as the catalog of what each page offers users.
- **Files to change:** `CONTENT.md`.
- **Sections / scope:**
  - Add a new numbered "Special Attack" section describing the shipped page, placed among the game sections (its model is the existing "Who's Faster" section, §2) and keeping the document's section numbering coherent. Match the altitude and voice of the existing game sections (concise, user-facing "what this page offers"). Ground the content in the shipped page (`src/pages/special-attack.ts`): the head-to-head game shows two Pokemon side by side and the user guesses which has the higher **Special Attack**; equal Special Attack (a tie) accepts either choice; it is streak-based (one wrong answer ends the run) with the current streak visible; and the page also offers a sortable/searchable table of all Pokemon by Special Attack. Do **not** carry over the exact-value "guess the number" mode (it was intentionally not built) and do not invent modes the page does not have.
  - Update the Homepage section's feature-card enumeration (the parenthetical list under "One card per feature page") so it includes the shipped **Special Attack** card. Scope this edit to adding Special Attack; do not rewrite the other entries.
- **Depends on:** none.
- **Traces to:** Spec Requirement 2 (discoverability — homepage card), Requirements 5–10 (head-to-head game + table), and the shipped `src/pages/special-attack.ts` + the `GAMES` card in `src/pages/home.ts`.
- **Acceptance:**
  - A reader of `CONTENT.md` can find a Special Attack page entry and learn that it is a head-to-head "which Pokemon has the higher Special Attack" streak game where ties accept either answer and the streak is shown, plus a browsable/searchable table of all Pokemon by Special Attack.
  - The new section reflects only shipped behavior: no exact-value "guess the number" mode is described.
  - The Homepage section's feature-card list includes the Special Attack card alongside the existing entries.
  - Document section numbering (or the chosen placement) remains internally consistent after the insertion.

### Task 2: Add SPECIAL ATTACK to the navigation enumeration in DESIGN_PLAN.md

- **Goal:** Update the Navigation Header design section so its GAMES-dropdown item list matches the shipped nav, which now includes the Special Attack entry.
- **Audience:** Designers and contributors who use `DESIGN_PLAN.md` §8 as the reference for what the navigation contains.
- **Files to change:** `DESIGN_PLAN.md`.
- **Sections / scope:** In the "8. Navigation Header" section, update both places that enumerate the GAMES dropdown items (the desktop "Center-right" bullet, ~line 260, and the "Nav items" bullet, ~line 266) to include `SPECIAL ATTACK` (`/special-attack`) alongside the existing `TYPES`, `SPEEDS`, `ROLES`, and `WILL IT KO?` entries. Match each bullet's existing format (the "Nav items" bullet pairs each label with its path; the "Center-right" bullet lists labels only). Ground the label and path in the shipped `GAME_LINKS` array in `src/components/Nav.ts` (`{ label: "SPECIAL ATTACK", href: "/special-attack" }`, appended as the 5th item). Do not alter the tool links, the dropdown's design description, or any other part of §8.
- **Depends on:** none.
- **Traces to:** Spec Requirement 2 (discoverability — Games navigation entry) and the shipped `GAME_LINKS` change in `src/components/Nav.ts`.
- **Acceptance:**
  - Both GAMES-dropdown enumerations in §8 list SPECIAL ATTACK, so the section matches the shipped five-item nav.
  - The "Nav items" bullet pairs the SPECIAL ATTACK label with its `/special-attack` path, consistent with how the other games are listed.
  - No other content in §8 (tool links, dropdown mechanics, styling) is changed.
