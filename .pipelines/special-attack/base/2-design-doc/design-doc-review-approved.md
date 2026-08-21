# Design Doc Review

## Verdict: approved

## Reviewed revision

`d16f7704e1f686af1018db1b98761b10bc70eaaf` (run branch `feature/special-attack`). Worktree clean before and during review; all checks are read-only, so none touched worktree state.

## Verification log

One line per check — what, how, result.

1. **Speeds page structure (the fork's model).** Read `src/pages/speeds.ts`. Confirms: `<2` early return renders bare `<main><p>Not enough Pokemon loaded.</p></main>` (l.62-64); wrapper `data-wp-interactive="pokemon/speeds"` + `data-wp-context='{"currentSection": null}'` (l.93-94); always-visible "Learn Speeds" selector `Section` with three `SectionCard`s (l.96-117); head-to-head `QuizSection` (l.119-138); the guess-speed `QuizSection` (l.140-189, dropped by design); the table `Section` with `data-wp-bind--hidden="!state.isCurrentSection"` (l.191-212); dead moves-priority stub (l.214-222, dropped); page-local `SpeedRevealOverlay` (l.14-33) and `SpeedPokemonCard` (l.35-53). Matches the design's page description. Result: confirmed.

2. **Store stat coupling is thin and localized.** Read `src/client/stores/pages/speeds.ts`. The head-to-head path reads the stat at exactly three points: `getDisplayedSpeed` l.63 (`pokemon.speed`), `storeAnswer` l.238 (tie test), l.241 (correctness). `revealAnswer` (l.66-123) and `randomize`/`resetQuizState`/`toQuizPokemon` (l.34-51) are stat-agnostic; the reduced-motion branch (l.74-94) sets `animationProgress=1`; the rAF cubic-ease count-up is l.96-122. All guess-speed members are separable (`displayedGuessSpeed`, `isCorrect`, `updateSpeedGuess`, `submitGuessSpeed`, `restartGuessSpeed`, `updateGuessSpeedContext`, `storeGuessSpeedAnswer`). Store registered `store("pokemon/speeds", ...)` l.125. Result: confirmed — coupling and separability are as the design's Decisions 1 and 2 claim.

3. **`revealAnswer`/`getDisplayedSpeed` are NOT in shared `quiz-utils`.** Read `src/client/stores/quiz-utils.ts`. Exports only `QuizPokemon`, `randomizeSingle`, `syncPokemonContext`, `isWaiting`, `isIncorrect`, and re-exports `isCurrentSection`/`selectSection`. The reveal helpers live only in `speeds.ts`. Result: confirmed — copying them into the new store touches no shared module (Decision 2 rationale holds).

4. **`quiz-utils` is loaded by the Types page store too.** `grep -n quiz-utils src/client/stores/pages/types.ts` → import at l.17. Result: confirmed — extraction into `quiz-utils` would add a `/types` re-verification obligation, as Decision 2 states.

5. **Section-visibility mechanism.** Read `src/client/stores/section-utils.ts`: `isCurrentSection` = `currentSection === sectionId`; `selectSection` sets `currentSection = sectionId`. Read `src/components/QuizSection.ts`: it emits `data-wp-bind--hidden="!state.isCurrentSection"` (l.34) and renders `QuizStatus` (l.41). Result: confirmed — Requirement 4 realized by reuse.

6. **`QuizStatus` shows streak + game-over/restart.** Read `src/components/QuizStatus.ts`: renders `Streak: <context.streak>` when not incorrect (l.5-7) and `GAME OVER / Final streak: <context.finalStreak> / Try again` bound to the passed `restartAction` when incorrect (l.8-16). Result: confirmed — Requirements 9 and 7 realized by reuse; the new store must expose `state.isIncorrect`, which the design lists.

7. **`spAttack` exists in the schema as a peer of `speed`.** Read `src/db/schema/pokemons.ts`: `spAttack: smallint("sp_attack").notNull()` (l.24), `speed` (l.26). Result: confirmed — Requirement 11 satisfied with no schema/API/query change.

8. **DataTable already handles a `spAttack` column.** `grep -rn spAttack src/pages src/components`: `src/pages/design-system.ts:543` and `src/components/MetaPokemonsSection.ts:48` both use `{ key: "spAttack", label: "SpA", sortable: true }`. Result: confirmed — proves DataTable is stat-generic and that "SpA" is the multi-stat convention (design reserves it and uses full "Special Attack" for the single-stat table, mirroring Speeds' "Speed").

9. **DataTable is fully config-driven.** Read `src/components/DataTable.ts`: props `columns/rows/caption/maxHeight/searchPlaceholder/sortColumn/sortDirection/searchMode` all exist; `searchMode:"scroll"` documented as "keep all rows visible, scroll to and highlight matches" (l.30-35); image cell renders sprite via `render:"image"` + `altKey` (l.52-65). Result: confirmed — Requirement 10 realized by the design's DataTable config.

10. **Routing loop and pages array.** Read `src/routes/index.ts`: `pages` array (l.25-52) with `/speeds` entry shape `{ path, title, render, scripts }` (l.33-38); shared loop (l.54-61) runs `resetServerState()` / `await loadTypes()` / `await loadPokemons()` then `Layout({ title, scripts, children: await render() })`. Result: confirmed — the additive `/special-attack` entry lands the page server-rendered with data (Requirement 1).

11. **Build entry points are explicit, not auto-discovered.** Read `scripts/build.ts`: hardcoded `entryPoints` array (l.5-16) includes `src/client/stores/pages/speeds.ts`. Result: confirmed — adding the new store to this array is mandatory or its `scripts` path 404s, as the design states.

12. **Nav and homepage are array-driven and additive-safe.** Read `src/components/Nav.ts`: `GAME_LINKS` (l.6-11) mapped in both desktop dropdown (l.102-116) and mobile group (l.176-190). Read `src/pages/home.ts`: `GAMES` (l.14-43) mapped into `flex flex-wrap justify-center` (l.90-94); existing game icons `Grid2x2/Timer/Shield/Swords`, so `Zap` is unused. Result: confirmed — the 5th nav link and homepage card are purely additive (Requirement 2, no regression per Requirement 13).

13. **`.speed-*` classes are referenced only by the Speeds page.** `grep -rn "speed-overlay|speed-correct|speed-incorrect|speed-pokemon-btn" src` → only `src/styles/input.css` (definitions l.515-567) and `src/pages/speeds.ts` (usages). Result: confirmed — reusing them on the new page cannot affect any other page (Decision 3), and the residual R-2 is genuinely cosmetic.

14. **`pokemon` store exposes `getPokemon`/`getRandomPokemons`.** Read `src/client/stores/pokemons.ts`: `getPokemon(dexNumber, formName)` (l.61-68) and `getRandomPokemons(count)` returning `count` distinct indices (l.69-77). Result: confirmed — the client store data flow the design describes is supported; subsequent pairs are distinct.

15. **`defaultQuizContext()` output.** Read `src/utils/quiz.ts`: no-arg call returns `{ streak: 0, quizState: "waiting", finalStreak: 0 }` (l.14-19). Result: confirmed — matches the design's stated quiz-context seed exactly.

16. **`pickTwo` returns two distinct elements, requires length ≥ 2.** Read `src/utils/array.ts` (l.15-22). Result: confirmed — Requirement 5's "two distinct" is satisfied by reuse, with the `<2` early return guaranteeing the precondition (Requirement 12 links to this).

17. **Reduced-motion path yields final values immediately.** From check 2 + 14: the reduced-motion branch sets `animationProgress=1`, so `getDisplayedSpAttack(data, 1) = Math.round(1 * spAttack)` = the actual value, and both card overlays (hidden only while `isWaiting`) display it once revealing. Result: confirmed — Requirement 6.

18. **Namespace-independence (Decision 1 / R-3).** Not re-read from package source; relied on the record's cited `@wordpress/interactivity/build-module/store.mjs` evidence, corroborated by the observable fact that `pokemon/data-table` and `pokemon/speeds` already coexist as distinct singletons in this codebase (checks 1, 9). The consequence (reusing `pokemon/speeds` merges state under client-side navigation) is correctly carried forward as build-phase risk R-3 with a concrete mitigation. Result: consistent; accepted on cited evidence.

## Summary

This is a clean-fork design: a new page component and a new client store under a distinct Interactivity namespace `pokemon/special-attack`, reusing already-generic shared components (Hero, SectionCard, QuizSection, QuizStatus, DataTable, PokemonCard), the shared `pokemon`/`pokemon/data-table`/`quiz-utils`/`section-utils` stores, and the `pickTwo`/`defaultQuizContext` utilities as-is, swapping the stat from `.speed` to the already-present `.spAttack`. I re-executed every cheap check behind the design's load-bearing claims against the worktree at d16f770; all held. All 13 spec requirements are covered and each decision traces to specific requirements. The design stays within scope (guess-speed, moves-priority, dex column, filtering/pagination/row-click, and backend work all correctly excluded), holds architecture-level altitude, and the design doc is faithful to its research record. Requirement 13 (no regressions) is satisfied by construction: the only edits to existing files are mandatory wiring (route entry, build entry point) and additive discoverability entries (one nav link, one homepage card), all of which I confirmed are array-driven or loop-driven and cannot alter existing pages' observable behavior. The two accepted residuals (duplicated `revealAnswer`; `.speed-*` class names on the new page) are correctly justified as stable, behavior-preserving, and user-invisible, and the namespace-distinctness risk is properly flagged to the build phase (R-3) with a concrete mitigation. No load-bearing claim carries an unresolved hedge. I found no issue rising to a finding.

## Issues

None.
