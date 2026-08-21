# Spec: Special Attack Comparison Page

## Overview

The site has one per-stat comparison game today: the "Who's Faster?" page (at `/speeds`), where visitors learn and test their knowledge of Pokémon Speed. There is no equivalent for the Special Attack stat, so users have no dedicated place to find out which Pokémon has the higher Special Attack.

This feature adds a new page that mirrors the "Who's Faster?" experience for Special Attack instead of Speed: a hero, a selector of section cards, a head-to-head "guess which has the higher Special Attack" streak quiz, and a sortable, searchable table of all Pokémon by Special Attack. It relies entirely on data that already exists (each Pokémon's `spAttack` value is already loaded server-side alongside Speed), so no new data model, API, or schema is required. The exact-value "guess the number" quiz that also lives on the Speeds page is intentionally not carried over (see Out of Scope). Naming, labels, and copy below are proposed defaults consistent with the codebase's conventions; exact wording is adjustable by the owner.

## Requirements

1. **Dedicated page.** A new page for comparing Pokémon by Special Attack is reachable at its own URL (proposed path `/special-attack`) and renders with Pokémon data available on first load (data supplied server-side, as on the model page).
2. **Discoverability.** The page is linked from the same places the model page is: an entry in the site's global "Games" navigation (proposed label "SPECIAL ATTACK") and a game card on the homepage, each navigating to the page.
3. **Hero.** The page opens with a hero that introduces the Special Attack comparison — a title identifying it as a Special Attack comparison plus a short descriptive line.
4. **Section selector.** The page shows a "Learn Special Attack" selector of section cards; on load only the hero and the selector are visible, and choosing a card reveals exactly one corresponding section at a time.
5. **Head-to-head quiz.** Two distinct, randomly chosen Pokémon are shown side by side, and the user selects the one they believe has the higher Special Attack.
6. **Answer reveal.** On selection, each shown Pokémon's Special Attack value is revealed with an animated count-up to its actual value; when the user prefers reduced motion, the final value is shown immediately without animation.
7. **Streak mechanics.** A correct selection increases the current streak and advances to a fresh random pair; an incorrect selection ends the run, shows a game-over state with the final streak, and offers a way to restart.
8. **Ties.** When the two Pokémon have equal Special Attack, selecting either is accepted as correct.
9. **Streak visibility.** The current streak is visible while the head-to-head quiz is being played.
10. **Data table.** A sortable, searchable table lists all loaded Pokémon with (at minimum) sprite, name, and Special Attack value; it is sorted by Special Attack descending by default; the user can sort by name or by Special Attack; searching scrolls to and highlights matching rows rather than filtering the rest out.
11. **Existing data only.** Every Special Attack value shown (quiz and table) is the Pokémon's existing `spAttack` value from the server data already loaded for pages; no new data source, query, or schema is introduced.
12. **Insufficient-data edge case.** If fewer than two Pokémon are available, the page shows a graceful "not enough Pokémon" message in place of the quiz rather than erroring.
13. **No regressions elsewhere.** The observable behavior of all existing pages (the "Who's Faster?"/Speeds page, other games, the homepage, and navigation) is unchanged apart from the added navigation entry and homepage card for the new page.

## Out of Scope

1. **The exact-value "guess the Special Attack number" quiz.** The model Speeds page includes a second game where the user types the exact stat value; it is not carried over. The intent's goal is specifically to compare which Pokémon has the higher Special Attack, and its directions list only the hero, section cards, head-to-head quiz, and table. This is a reversible scope decision the owner can revisit.
2. **The unreachable "moves-priority" placeholder** that exists in the Speeds page source (no control ever displays it) — not reproduced.
3. **A dex-number column in the table.** The table mirrors the shipped Speeds table (sprite, name, stat), which has no dex-number column.
4. **Data-table type filtering, pagination, and row-click navigation** — excluded, matching the model table's own scope.
5. **Changing the observable behavior of existing pages/components.** Whether shared components are reused as-is or generalized is a design-phase decision; only the new page's own navigation entry and homepage card touch existing surfaces.
6. **Any new data model, schema, API, or data-loading work** — Special Attack (`spAttack`) already exists in the server data the page consumes.

## Acceptance Criteria

- Given the site, when the user opens the new page's URL, then the page renders with a hero, a section selector, and Pokémon data present without a client-side data fetch being required for first paint.
- Given the site navigation and homepage, when the user views the "Games" navigation and the homepage games section, then a "Special Attack" game entry/card is present and links to the new page.
- Given the page on load, when nothing has been selected, then only the hero and the section-selector cards are visible; when the user clicks a section card, then that section becomes visible and the others remain hidden.
- Given the head-to-head quiz, when it is shown, then two distinct Pokémon appear side by side and the current streak is displayed.
- Given the head-to-head quiz in its waiting state, when the user selects the Pokémon with the higher Special Attack, then both Pokémon's Special Attack values are revealed, the selection is marked correct, the streak increases by one, and a new random pair is presented.
- Given the head-to-head quiz, when the user selects the Pokémon with the lower Special Attack, then the values are revealed, the selection is marked incorrect, the run ends showing the final streak, and a restart control is offered.
- Given two Pokémon with equal Special Attack in the head-to-head quiz, when the user selects either one, then the selection is accepted as correct.
- Given a user who prefers reduced motion, when values are revealed, then the final Special Attack values are shown immediately without the count-up animation.
- Given the data-table section, when it is shown, then it lists all loaded Pokémon with sprite, name, and Special Attack, sorted by Special Attack from highest to lowest by default.
- Given the data table, when the user clicks the name or Special Attack column header, then the rows sort by that column (toggling ascending/descending); when the user searches for a Pokémon name, then matching rows are scrolled to and highlighted while other rows remain present.
- Given a data set with fewer than two Pokémon available, when the user opens the page, then a "not enough Pokémon" message is shown instead of the quiz and no error occurs.
- Given the existing "Who's Faster?"/Speeds page and other existing pages, when the feature ships, then their observable behavior is unchanged.
