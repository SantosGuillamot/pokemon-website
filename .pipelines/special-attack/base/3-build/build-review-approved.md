# Build Review

## Verdict: approved

## Batch scope

Expected new work:
- Task 1: Create the Special Attack client store (distinct namespace)
- Task 2: Create the Special Attack SSR page component
- Task 3: Register the store bundle as an esbuild entry point
- Task 4: Register the `/special-attack` route
- Task 5: Add the "SPECIAL ATTACK" navigation entry
- Task 6: Add the homepage "Special Attack" game card
- Task 7: End-to-end validation of all flows and regressions

Diff reviewed: `dcf6997` (parent of the commit that added `build-plan.md`) → `9d4bda8` (HEAD) — the phase's whole work.

## Summary

The batch implements the `/special-attack` page as a faithful clean fork of the shipped `/speeds` page, exactly as the design and plan prescribe. The diff touches only the six planned surfaces: two new files (`src/client/stores/pages/special-attack.ts`, `src/pages/special-attack.ts`) and four purely-additive edits (`scripts/build.ts`, `src/routes/index.ts`, `src/components/Nav.ts`, `src/pages/home.ts`). No shared component, store, utility, or existing page source is modified. Every load-bearing claim was independently verified: the store and page use the distinct namespace `pokemon/special-attack` with zero `pokemon/speeds` references; the stat read is `spAttack` throughout (never `speed`); the guess-speed and moves-priority members are omitted; the insufficient-data early return is present; the discoverability edits are additive; and existing pages are observably unchanged. Runtime behavior was exercised end-to-end (SSR via curl, interactivity via Playwright/Chromium against the built app on a seeded Postgres). R-3 namespace isolation holds across client-side navigation (no state merge; destination streak always starts at 0). The e2e report's attribution of the first-guess-after-client-nav quirk to pre-existing shared code was independently confirmed to be symmetric across `/speeds` and `/special-attack` as destinations, so it is not introduced by this feature and is out of scope (Requirement 13). Both guardrail gates are RED but identically to the recorded baseline — reproduced on the diff base `dcf6997` — with zero findings in any feature file; the diff introduces no new findings.

## Checks

| Check | Command | Result |
| ----- | ------- | ------ |
| lint | `npm run lint` | pass (no new findings) — HEAD exits 1 with 12 errors + 4 warnings across 74 files (72 baseline + 2 new); identical counts reproduced on diff base `dcf6997` (72 files); all 8 finding-files are outside the feature diff; the 2 new feature files produce zero findings. Pre-existing RED baseline is out of scope (Requirement 13). |
| typecheck | `npx tsc --noEmit` | pass (no new findings) — HEAD exits 2 with exactly 1 error `src/utils.ts(58,19) TS18046`; identical error reproduced on diff base `dcf6997`; `src/utils.ts` is not in the feature diff; zero errors in any feature file. |

## Behavior verification

Built assets (`npm run build:js` emitted `public/js/stores/pages/special-attack.js`; `npm run build:css` clean) and ran the app on port 3200 against the seeded Postgres (`docker-postgres-1`, 274 Pokemon), leaving the pre-existing dev server on port 3000 untouched (confirmed still HTTP 200).

SSR (curl):
- Flow 1: `GET /special-attack` → 200; `<title>Special Attack</title>`, hero `<h1>Special Attack</h1>`, "Learn Special Attack" selector, `data-wp-interactive="pokemon/special-attack"`, `/js/stores/pages/special-attack.js` script, `#wp-interactivity-data` blob with 274 Pokemon, section ids `whos-higher-special-attack` + `special-attack-table`; **zero** `pokemon/speeds` references.
- Flow 2: homepage exposes 3 `/special-attack` links (desktop nav, mobile nav, game card) and 2 "SPECIAL ATTACK" nav entries; the four existing game links unchanged.
- Flow 9 config: data-table SSR context carries `sortColumn: spAttack`, `sortDirection: desc`, `searchMode: scroll`, 274 rows.
- R-3 / Flow 12: `/speeds` still uses `pokemon/speeds`, retains both games (`guessSpeed` ×2 head-to-head + `submitGuessSpeed` numeric), zero `pokemon/special-attack` leakage; `/`, `/types`, `/roles`, `/will-it-ko`, `/team-building`, `/damage-calculator` all 200.

Interactive (Playwright/Chromium, zero genuine JS console errors):
- Flow 3: on load the head-to-head and table are hidden; clicking "Higher Special Attack" reveals only the quiz; clicking "Special Attack Table" reveals only the table — exactly one section at a time.
- Flow 4: two distinct cards side by side with "VS"; streak displayed as 0.
- Flow 5: clicking the higher-`spAttack` card (e.g. 135 vs 110) revealed values, marked correct, streak → 1, advanced to a fresh pair.
- Flow 6: clicking the lower card revealed values, marked incorrect, showed GAME OVER; "Try again" reset streak to 0 in the waiting state. Across direct-load trials, clicked-higher ⇔ correct held consistently (evaluation works on direct load).
- Flow 8: with `prefers-reduced-motion: reduce`, values (e.g. 95, 125) were shown ~immediately (read at 120 ms, well under the ~1 s count-up).
- Flow 10: clicking "Name" re-sorted (Alakazam Mega → Abomasnow); default `spAttack`-desc top row was Alakazam Mega (175, dataset max, Flow 9); searching "Pikachu" kept all 275 table rows present (scroll mode, no filtering).
- Flow 11: verified by inspection of the early-return guard (`if (pokemons.length < 2) return html\`<main><p>Not enough Pokemon loaded.</p></main>\``); corroborated by the e2e report invoking the shipped page function with 0 and 1 Pokemon.
- R-3 (client-side SPA navigation, `spaKept`/no reload confirmed): navigating `/speeds`↔`/special-attack` kept streaks independent — destination streak started at 0 in 12/12 trials, and no page ever exposed both namespaces simultaneously (no state merge).

Independent attribution of the first-guess-after-client-nav quirk: over 6 trials per destination, the first head-to-head guess after arriving via client-side navigation from another quiz page was mis-evaluated (game-over regardless of choice) on **both** `/special-attack` (6/6) and `/speeds` (6/6) as destination — symmetric. Since the feature modifies none of the shared quiz mechanism (`QuizSection`, `quiz-utils`, router) and copies the store logic verbatim, and the untouched `/speeds` exhibits the identical quirk, this is confirmed pre-existing shared behavior, not introduced by this feature, and out of scope (Requirement 13 / Out-of-Scope 5).
