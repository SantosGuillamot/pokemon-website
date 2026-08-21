# Build Plan Review

## Verdict: approved

## Summary

The revised build plan is complete, feasible, correctly ordered, and fully traceable to the spec and design, and it genuinely fixes both issues from rejection iteration 1. I re-ran both guardrail gates against the base commit `3c16a16` and independently reproduced the recorded red baseline to the exact per-file breakdown; both gate runners resolve and terminate (their non-zero exits are a legitimate pre-existing red baseline in files this feature never touches, not broken runners). Every one of the 13 spec requirements maps to at least one task; the 12 acceptance criteria are each covered by a task plus an E2E flow; the 12 E2E flows cover the material edge cases (ties, reduced motion, insufficient data, cross-navigation namespace isolation, no-regression); task ordering and dependencies are acyclic and correct (Task 1 store -> Task 2 page -> Task 3 build entry -> Task 4 route -> Tasks 5/6 discoverability -> Task 7 e2e); and I re-verified every load-bearing codebase claim the plan makes. The `## Guardrail scopes` section is the valid "None" rendering: no scoped gate was passed, both gates are FIXED/unscoped, and every scope cell is honestly "None" with no fabricated scope value. The clean-fork approach faithfully executes every key design decision, drops exactly the out-of-scope surfaces (numeric guess-speed game, dead moves-priority stub), and adds no test scaffolding or documentation — correct for this testless repo.

## Verification log

### Guardrail-gate validation (both FIXED / unscoped)

- **lint — `npm run lint` (`biome check`):** runner resolved and terminated, exit code 1, "Found 12 errors. Found 4 warnings." A running runner reporting a pre-existing red baseline is NOT a rejection. VALIDATES.
- **typecheck — `npx tsc --noEmit`:** runner resolved and terminated, exit code 2, exactly 1 error: `src/utils.ts(58,19): error TS18046: 'config.pokemon.types' is of type 'unknown'.` VALIDATES.
- **Guardrail-scopes bind:** no scoped gate was passed to this planner; the plan states so and renders both FIXED gates with a "None" scope body. Valid rendering; no fabricated or missing scoped-gate rows.

### Prior-iteration issues re-checked against revision `662be48`

- **Iteration-1 Issue 1 (per-task acceptance said gates "pass" though both are red) — FIXED.** Every task's final Acceptance bullet (Tasks 1-6) now reads "Introduces **no new** lint or typecheck errors/warnings relative to the recorded baseline ... and modifies no file outside this task's **Files to change**"; Task 7 states the whole-worktree bar as "exactly the same pre-existing 12 errors + 4 warnings (lint) and 1 error in `src/utils.ts` (tsc), and nothing introduced by this feature's diff." This is now observable and achievable, and consistent with `## Verification approach`.
- **Iteration-1 Issue 2 (red baseline not recorded; no guard against fixing pre-existing errors) — FIXED.** A new "Baseline gate state (recorded at base commit `3c16a16`)" section enumerates the pre-existing findings per file and marks them out of scope; a new "Scope directive (mandatory for every task)" forbids a writer from editing any file outside its task's Files-to-change to green a gate, names the specific pre-existing files not to touch, and calls out the one realistic new-finding trap (biome import-sort/format on new/edited files) with the correct path-scoped `npx biome check --write <file>` mitigation and an explicit prohibition on the unscoped `npm run lint:fix`.

### Baseline accuracy (independently reproduced)

The plan's recorded baseline matches reality exactly: `src/styles/input.css` (2x parse @35, 1x `lint/correctness/noUnknownFunction` @124, 1x format, plus 4x `lint/complexity/noImportantStyles` warnings @1025-1028); `scripts/download-images.ts`, `scripts/scrape-champions-pokemon.ts`, `src/client/lib/team-builder-storage.ts`, `src/client/stores/pages/team-building.ts`, `src/client/stores/quiz-utils.ts` (1x format each); `src/pages/speeds.ts` (1x `assist/source/organizeImports` + 1x format); `src/pages/types.ts` (1x `assist/source/organizeImports`) = 12 errors + 4 warnings. tsc: the single `src/utils.ts:58` error. The `speeds.ts` imports are genuinely unsorted, confirming the plan's warning not to copy that ordering into the new files.

### Load-bearing codebase claims verified

- `spAttack: smallint("sp_attack")` exists on `src/db/schema/pokemons.ts`; `speed` and `spAttack` both present.
- `lucide-static` exports `Zap` (confirmed via `require`).
- `quiz-utils` exports `QuizPokemon`, `randomizeSingle`, `syncPokemonContext`, `isWaiting`, `isIncorrect`, and re-exports `isCurrentSection`/`selectSection` from `section-utils` — every named import the plan keeps for Task 1 resolves; `randomizeSingle` (dropped) is guess-speed-only.
- `defaultQuizContext()` returns `{ streak: 0, quizState: "waiting", finalStreak: 0 }`, matching the design and Task 2's usage.
- `scripts/build.ts` has an `entryPoints` array with `src/client/stores/pages/speeds.ts` and siblings (Task 3 target).
- `src/routes/index.ts` registers pages via `{ path, title, render, scripts }` entries (Task 4 pattern).
- `src/components/Nav.ts` `GAME_LINKS` has exactly 4 entries (TYPES, SPEEDS, ROLES, WILL IT KO?), array-driven into both desktop and mobile menus (Task 5).
- `src/pages/home.ts` `GAMES` array uses an `icon` field and imports icons from `lucide-static` (Task 6).
- Model files `src/pages/speeds.ts` and `src/client/stores/pages/speeds.ts` match the plan's fork description; the guess-speed and moves-priority members the plan drops are exactly the ones present only for those out-of-scope features.
- Reused `QuizSection`/`QuizStatus` bind `state.isCurrentSection` and `state.isIncorrect` (+ `context.streak`/`context.finalStreak`); the choice card needs `state.isWaiting`, `state.displayedSpAttack`, `state.isGuessedCorrect`, `state.isGuessedIncorrect`, `actions.guessSpAttack`. Task 1 retains every getter these require and drops only `isCorrect`/`displayedGuessSpeed`, which are unreferenced by the head-to-head. Requirement 9 (streak visibility) is satisfied by the reused `QuizStatus`.
- Risk R-3 (distinct namespace) is guarded in both Task 1 ("no reference to the string `pokemon/speeds`") and Task 2 ("no `data-wp-interactive=\"pokemon/speeds\"`"), and re-verified in Task 7 Flow 12 across client-side navigation.

## Issues

None.
