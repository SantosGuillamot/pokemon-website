# Build Plan Review

## Verdict: rejected

## Summary

The plan is, on the whole, strong: the clean-fork approach is faithful to the design, every one of the 13 spec requirements maps to at least one task, the 12 E2E flows cover all acceptance criteria and edge cases, task ordering and dependencies are correct (no cycles; Task 1 store -> Task 2 page -> Task 3 build entry -> Task 4 route -> Tasks 5/6 discoverability -> Task 7 e2e), and I independently verified every load-bearing codebase claim it makes (`spAttack` on the schema and inferred `Pokemon` type; the `QuizSection`/`QuizStatus`/`DataTable`/`Hero`/`SectionCard` signatures; `pickTwo`/`defaultQuizContext`; the `quiz-utils` exports; the `pokemon` store's `getPokemon`/`getRandomPokemons`; `GAME_LINKS`, `GAMES`, `scripts/build.ts` entry points, the `routes/index.ts` page loop; and that `lucide-static` exports `Zap`). The `## Guardrail scopes` section is correct: both gates are FIXED/unscoped, no scoped gate was passed, and the plan renders both as `None` with no fabricated rows — a valid rendering. The plan also correctly refrains from inventing a nonexistent test command and adds no test scaffolding, which is the right call for this testless repo.

It is rejected for one root problem in the load-bearing verification mechanism: the plan treats `npm run lint` and `npx tsc --noEmit` as pass/fail gates that the feature work will make "pass," but **both gates are already red on the base commit** (I ran them: lint exits 1 with 12 errors + 4 warnings; tsc exits 2 with an error in `src/utils.ts`, a file this feature never touches). Because there is no test runner, these two gates plus manual runtime observation are the *only* verification the plan has, so getting their framing exactly right is critical. As written, the per-task acceptance is literally unsatisfiable and internally inconsistent with the plan's own Verification approach, and the plan never records the red baseline — which both blocks objective verification and creates a concrete Requirement-13 regression hazard (a writer "making the gate pass" would edit unrelated existing files). The two issues below share this root cause and are cheap to fix.

## Issues

### Issue 1: Per-task acceptance says the gates "pass," but both gates are red on the base — the criterion is unsatisfiable and contradicts the plan's own Verification approach

**What's wrong:** Every task's final Acceptance bullet reads "`npm run lint` and `npx tsc --noEmit` pass" (Tasks 1-6), and Task 7 reads "`npm run lint` and `npx tsc --noEmit` pass on the full worktree." I executed both filled gate commands against the current base (commit `3c16a16`) in the worktree:

- `npm run lint` (`biome check`) -> exit code **1**: "Found 12 errors. Found 4 warnings." (formatter diffs, unsorted imports, and Tailwind-syntax parse errors in `src/styles/input.css`).
- `npx tsc --noEmit` -> exit code **2**: `src/utils.ts(58,19): error TS18046: 'config.pokemon.types' is of type 'unknown'.`

So neither gate "passes" today, and the feature work (which does not touch `src/utils.ts` or `input.css`) will not make them pass. A per-task acceptance criterion must be observable and *achievable*; "the gate passes" is neither, given a red baseline. Worse, it contradicts the plan's own `## Verification approach`, which correctly frames the bar twice as "passes with **no new errors**" / "**no new type errors**." A build-writer reading the task acceptance literally, and the build-reviewer later checking it, are handed a criterion that can never be met.

**Where in plan:** `## Tasks` — the final Acceptance bullet of Tasks 1, 2, 3, 4, 5, 6, and 7; inconsistent with `## Verification approach` items 1 and 2.

**Suggestion:** Make the acceptance wording uniform with the Verification approach: state every gate criterion as "introduces **no new** lint/typecheck errors relative to the recorded baseline" rather than "passes." (See Issue 2 for recording that baseline.)

**Why it matters:** These two gates are the only automated verification in the plan (no test runner exists). If the pass/fail bar is stated in a way that is literally false against the codebase, neither the build-writer nor the build-reviewer can objectively decide whether a task is done, which defeats the purpose of per-task acceptance.

### Issue 2: The plan never records that the baseline is red, so "no new errors" is not computable — and there is no guardrail against "fixing" pre-existing unrelated errors (Requirement 13 hazard)

**What's wrong:** The Overview's investigation log documents the empty search for a test runner ("no `test`/`vitest`/`jest`/... in `package.json`," which I confirmed), but it never records that `npm run lint` and `npx tsc --noEmit` are *currently failing*. Consequently, even the correct "no new errors" bar is not actionable: a writer/reviewer cannot compute "new" errors without a recorded baseline of the pre-existing ones (12 biome findings incl. the `input.css` Tailwind parse errors and unsorted-import errors; 1 tsc error at `src/utils.ts:58`). Nothing in the plan tells the writer that these failures are pre-existing and out of scope. The natural — and wrong — reaction to "the typecheck must pass" is to fix `src/utils.ts` or the `input.css`/formatting errors, none of which belong to this feature. That directly threatens Requirement 13 / Out-of-Scope 5 ("observable behavior of existing pages unchanged"; existing surfaces must not be touched beyond the one nav link and one homepage card).

**Where in plan:** `## Overview` (investigation log) and `## Verification approach` — the baseline gate state is undocumented; no instruction bounds the writer away from pre-existing failures.

**Suggestion:** Record the current baseline explicitly (e.g., "as of the base commit, `npm run lint` reports 12 errors / 4 warnings and `npx tsc --noEmit` reports 1 error in `src/utils.ts`; these are pre-existing and out of scope") and add an explicit directive that writers must not modify files outside their task's `Files to change` to make a gate green — the bar is strictly "no *new* findings introduced by the task's own changes." Optionally note the one realistic new-error trap the diff can introduce: biome's import-sort rule when adding `Zap` to the `lucide-static` import in `home.ts` and `SpecialAttackPage` imports in `routes/index.ts` (insert in sorted order, or run `npm run lint:fix`).

**Why it matters:** Without a recorded baseline, "no new errors" is not verifiable and the sole automated check is effectively unusable; and without an explicit scope guard, the most direct path a writer might take to satisfy the mis-stated "gate passes" acceptance is to edit unrelated shipped files — a Requirement-13 regression the design went out of its way to avoid.
