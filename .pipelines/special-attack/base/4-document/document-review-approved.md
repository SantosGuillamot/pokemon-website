# Document Review

## Verdict: approved

## Batch scope

Expected new work:
- Task 1: Add the Special Attack page to `CONTENT.md`
- Task 2: Add SPECIAL ATTACK to the navigation enumeration in `DESIGN_PLAN.md`

Diff reviewed: `93149ec` (parent of the commit that added `document-plan.md`) → `HEAD` (the phase's whole documentation work).

## Summary

Both documentation tasks are accurate against the shipped code, complete for the two surfaces the plan named, written at the right altitude for their audiences, and internally consistent. `CONTENT.md` gains a coherent `## 6. Special Attack` section (renumbering Damage Calculator → §7 and Team Building → §8) plus the Special Attack homepage card, describing only shipped behavior with no invented exact-value "guess the number" mode. `DESIGN_PLAN.md` §8 has both GAMES-dropdown enumerations updated to include `SPECIAL ATTACK` (`/special-attack`) as the fifth entry, matching the shipped `GAME_LINKS`. The document phase changed no source code — the diff touches only `CONTENT.md`, `DESIGN_PLAN.md`, and the run's own artifacts.

## Checks

This project assigns no guardrail gates to document agents, so there are no gate commands to run. The accuracy spot-check (below) is the review's verification evidence.

| Check | Command | Result |
| ----- | ------- | ------ |
| Guardrail gates | (none assigned to document agents) | n/a |

Additional judgment checks performed:

- **Per-task Acceptance coverage** — pass. Task 1: a reader finds a Special Attack entry describing the head-to-head higher-Special-Attack streak game with ties accepted, visible streak, and a browsable/searchable table; no exact-value mode; homepage card list includes Special Attack; numbering stays consistent. Task 2: both §8 enumerations list SPECIAL ATTACK, the "Nav items" bullet pairs it with `/special-attack`, and no other §8 content changed.
- **Accuracy against shipped code** — pass (see spot-check).
- **Audience fit** — pass. `CONTENT.md` §6 matches the product-catalog voice/altitude of §2 (Who's Faster); `DESIGN_PLAN.md` §8 edits stay in the design-reference altitude of the surrounding bullets.
- **Faithful rationale** — pass. Neither edit invents "why"; both are descriptive catalog/enumeration prose consistent with spec and design.
- **Drift sweep** — pass. The build's public surfaces (the page, the nav entry, the homepage card) are covered by Task 1 (page + homepage card) and Task 2 (nav entry). Route/esbuild/store wiring are internal build surfaces, not documentation surfaces. No named surface left stale.
- **Plan adherence / scope** — pass. Diff touches only the two planned files plus run artifacts; no code changed.
- **Convention compliance** — pass. Section formatting, heading style, and bullet formats match each host document's existing conventions.
- **Software-only output** — pass. Neither doc body nor the two writer commit messages reference a task, requirement, acceptance criterion, or artifact.

## Accuracy spot-check

**Task 1 (`CONTENT.md` §6 + homepage card) vs. shipped code:**

- Tie acceptance — `CONTENT.md` claims "if the two are tied, either choice is accepted." Verified in `src/client/stores/pages/special-attack.ts`: `correctAnswer` is set to `"tie"` when `pokemonA.spAttack === pokemonB.spAttack` (line 212-213), and `guessSpAttack` treats the guess correct when `context.correctAnswer === "tie" || context.correctAnswer === context.pokemonIndex` (lines 167-168).
- Streak-ends-on-wrong — verified: correct guess does `context.streak += 1` (store lines 76/102); incorrect records `finalStreak` and resets streak to 0 (lines 84-86/110-112).
- Head-to-head "two Pokemon side by side" + sortable/searchable table — verified in `src/pages/special-attack.ts`: two `SpAttackPokemonCard(...)` with a `VS` divider (lines 160-162), and a `DataTable` with a `sortable`/`searchable` `name` column and a `sortable` `spAttack` column, `sortColumn: "spAttack"`, `sortDirection: "desc"` (lines 172-196).
- Homepage card — `CONTENT.md`'s homepage enumeration adds "Special Attack." Verified in `src/pages/home.ts`: a card with `title: "Special Attack"`, `href: "/special-attack"`, `icon: Zap` (lines 45-49), positioned immediately before Damage Calculator — matching the placement chosen in the doc.
- No exact-value mode — the shipped page and store implement only the higher-Special-Attack head-to-head game and the table; no numeric "guess the number" game exists, and `CONTENT.md` §6 describes none.

**Task 2 (`DESIGN_PLAN.md` §8) vs. shipped code:**

- Verified `src/components/Nav.ts` `GAME_LINKS` is `[TYPES /types, SPEEDS /speeds, ROLES /roles, WILL IT KO? /will-it-ko, SPECIAL ATTACK /special-attack]` (lines 6-11) — SPECIAL ATTACK is the fifth/last entry with label `SPECIAL ATTACK` and href `/special-attack`. Both §8 enumerations (line 260 labels-only; line 266 label+path) now list SPECIAL ATTACK last, matching the shipped order and formats exactly.

**No-code-change check:** `git diff --stat 93149ec HEAD` shows only `CONTENT.md`, `DESIGN_PLAN.md`, and `.pipelines/.../4-document/*` artifacts changed. The two writer commits (`c8d8c79`, `37600ae`) each touch only their one doc file.
