# E2E Validation Report: Special Attack Comparison Page

**Result: PASS** — All 12 E2E flows behave as specified, and both guardrail gates
show no new findings beyond the recorded baseline.

## How this was run

There is no e2e harness or test runner in this repository, and the build plan
forbids adding one. This validation was therefore executed as a documented,
scripted runtime drive-through against the built, running application:

- **Build:** `npm run build:js` and `npm run build:css` both completed without
  error. `build:js` emitted the new client bundle `public/js/stores/pages/special-attack.js`.
- **Server:** run on port **3100** to avoid the pre-existing dev server on 3000
  (which was left untouched — confirmed still serving HTTP 200 throughout).
  Note: `npm run start` (`node src/server.ts`) fails with `ERR_UNKNOWN_FILE_EXTENSION`
  because that script lacks a TypeScript loader — this is a **pre-existing repo
  trait on trunk, unrelated to this feature**. The app was run with the same
  loader `npm run dev` uses (`node --import tsx/esm src/server.ts`), as the plan
  specifies (`npm run dev`). The seeded local Postgres (`docker-postgres-1`) was
  reachable via the repo `DATABASE_URL`; all pages loaded live data (274 Pokemon).
- **Drivers:** SSR/markup flows were asserted with `curl` + parsing of the
  rendered HTML and the `#wp-interactivity-data` blob. Interactive flows were
  driven headlessly with Playwright (Chromium). The insufficient-data flow was
  driven by invoking the shipped page function with seeded server data.

### Environment notes (do not affect any flow)

- **Pokemon artwork images 404** in this isolated worktree: `public/images` is a
  git-ignored asset directory that is empty here (the main checkout has 274
  files). The Interactivity `src` bindings resolve correctly (verified via the
  bound attribute values); only the binary image files are absent. This is an
  asset-availability artifact of the worktree and does not affect any SSR,
  interactivity, quiz, table, sort, search, or navigation behavior. These
  resource 404s were excluded from the JS-console-error check (which found zero
  genuine JS/interactivity errors).

## Per-flow results

| Flow | Result | Driven by |
| ---- | ------ | --------- |
| 1  Page loads server-rendered with data | PASS | curl / SSR |
| 2  Discoverability from nav and homepage | PASS | Playwright (client-side nav) |
| 3  Section selector reveals one section at a time | PASS | Playwright |
| 4  Head-to-head shows two distinct Pokemon and the streak | PASS | Playwright |
| 5  Correct selection increments streak and advances | PASS | Playwright |
| 6  Incorrect selection ends the run with restart | PASS | Playwright |
| 7  Tie accepts either selection | PASS | Playwright |
| 8  Reduced motion shows final values immediately | PASS | Playwright |
| 9  Table lists all Pokemon, sorted by Special Attack descending | PASS | Playwright |
| 10 Table sort toggles and search scrolls/highlights | PASS | Playwright |
| 11 Insufficient data renders only a graceful message | PASS | shipped page fn + seeded data |
| 12 No regressions on existing pages (R-3 namespace isolation) | PASS | Playwright (client-side nav) |

### Flow 1 — Page loads server-rendered with data — PASS
`GET /special-attack` returned HTTP 200. The initial HTML contains the hero
(`<h1>Special Attack</h1>`), the "Learn Special Attack" selector, the interactive
wrapper `data-wp-interactive="pokemon/special-attack"`, the full table row data
(274 rows embedded in the data-table `data-wp-context`), and the
`#wp-interactivity-data` blob carrying all 274 Pokemon (each with `spAttack`).
First paint needs no client-side data fetch. The page has **zero** references to
`pokemon/speeds`.

### Flow 2 — Discoverability from nav and homepage — PASS
The homepage exposes a "Special Attack" Games card and two "SPECIAL ATTACK" nav
entries (desktop dropdown + mobile menu), all linking to `/special-attack`; the
four existing game links (Types, Speeds, Roles, Will It KO?) are each still
present and unchanged. Activating the homepage card navigates to the page
(landing `h1` = "Special Attack"); activating the Games-nav "SPECIAL ATTACK"
entry navigates to the page (landing `h1` = "Special Attack").

### Flow 3 — Section selector reveals one section at a time — PASS
On load only the hero and the two selector cards are visible; the head-to-head
quiz section and the table section are both hidden. Clicking the head-to-head
card reveals only the quiz (table stays hidden); clicking the table card reveals
only the table (quiz becomes hidden). Exactly one section is visible at a time.

### Flow 4 — Head-to-head shows two distinct Pokemon and the streak — PASS
Revealing the head-to-head shows two distinct Pokemon cards side by side with a
"VS" between them, and the streak displayed as "Streak: 0".

### Flow 5 — Correct selection increments streak and advances — PASS
Selecting the higher-Special-Attack Pokemon animated a count-up that resolved to
that Pokemon's real `spAttack` value, marked the selection correct, incremented
the streak from 0 to 1, and presented a fresh random pair (buttons re-enabled in
the waiting state, with a different pair than before).

### Flow 6 — Incorrect selection ends the run with restart — PASS
After building a streak of 1, selecting the lower-Special-Attack Pokemon revealed
the values, marked the selection incorrect, ended the run showing "GAME OVER" and
"Final streak: 1" (matching the streak just before the loss), and offered a "Try
again" control. Clicking "Try again" reset the streak to 0 and presented a fresh
pair in the waiting state.

### Flow 7 — Tie accepts either selection — PASS
By sampling fresh server-side random pairs (tie probability ≈ 2.6%), a genuine
tie was found (e.g. kingambit 60 == medicham 60). Selecting one of the two cards
was accepted as **correct** (streak incremented 0 → 1 and the quiz advanced),
confirming the store marks a tie correct regardless of which card is chosen.

### Flow 8 — Reduced motion shows final values immediately — PASS
With the browser emulating `prefers-reduced-motion: reduce`, making a selection
displayed the final `spAttack` value essentially immediately (< ~20 ms, versus
the ~1 s count-up otherwise) with no animation, and the correct/incorrect outcome
resolved identically (streak incremented on a correct pick).

### Flow 9 — Table lists all Pokemon, sorted by Special Attack descending — PASS
Revealing the table rendered all 274 Pokemon with a sprite (image) column, a Name
column, and a Special Attack column, sorted by Special Attack from highest to
lowest by default (top row = Alakazam Mega, spAttack 175 = the dataset maximum;
values non-increasing down the table).

### Flow 10 — Table sort toggles and search scrolls/highlights — PASS
Clicking the "Name" header sorted by name ascending, and clicking it again toggled
to descending; clicking the "Special Attack" header toggled ascending then
descending. Typing "Pikachu" into the search box highlighted the matching row and
smooth-scrolled it into view (scroll position moved from 0), while **all 274 rows
remained present** (scroll mode does not filter rows out).

### Flow 11 — Insufficient data renders only a graceful message — PASS
Driven by invoking the shipped `SpecialAttackPage()` with seeded server data:
with **0** Pokemon and with **1** Pokemon the page returned exactly
`<main><p>Not enough Pokemon loaded.</p></main>` and nothing else (no hero, no
selector, no interactive wrapper, no table), with no error. The 2-Pokemon control
rendered the full page (hero + `pokemon/special-attack` wrapper + selector +
table), confirming the boundary is exactly `< 2`.

### Flow 12 — No regressions on existing pages / R-3 namespace isolation — PASS
Navigation uses a **client-side router** (`pokemon/router::actions.navigateTo`),
so this exercises the real R-3 risk. Verified:

- `/speeds` is unchanged: it retains **both** games (the "Who's Faster?"
  head-to-head via `actions.guessSpeed` **and** the numeric "Guess Speed" game via
  `actions.submitGuessSpeed` / `actions.updateSpeedGuess`) plus its sortable
  table, under its own namespace set `["pokemon","pokemon/nav","pokemon/speeds","pokemon/data-table"]`
  with **no** `pokemon/special-attack` leakage.
- `/special-attack` uses only `["pokemon","pokemon/nav","pokemon/special-attack","pokemon/data-table"]`
  with **no** `pokemon/speeds` leakage, and exposes only the Special Attack game
  (no speed or numeric game).
- **No state merge or corruption across navigation:** after building a streak of
  1 on `/special-attack`, a client-side navigation to `/speeds` showed the speeds
  head-to-head at streak **0** (the Special Attack streak did not bleed in), and
  the speeds game was live. Navigating back to `/special-attack` kept its own
  coherent streak (its own prior value, never the speeds value), and its game was
  live. Homepage and all existing routes (`/`, `/types`, `/roles`, `/will-it-ko`,
  `/team-building`) return HTTP 200. **Zero** genuine JS/console errors occurred
  during the full back-and-forth navigation.

#### Out-of-scope observation (pre-existing, not a regression)

The shared quiz mechanism (`QuizSection` + `quiz-utils` `storeAnswer` + the
Interactivity router) has a pre-existing quirk: the **first** guess made on a
head-to-head quiz page reached by client-side navigation **after having already
resolved a guess on another quiz page** is mis-evaluated (treated as incorrect).
This was reproduced **symmetrically** — it affects `/speeds` as the destination
exactly as it affects `/special-attack` as the destination — proving it is
inherent to the shared, pre-existing code that this feature reuses verbatim (the
design's "clean fork"), not something the feature introduced. It does **not**
merge or corrupt state across namespaces (streaks remain fully independent, as
verified above), so it is orthogonal to R-3. Both games evaluate correctly on
direct page load and on client-side navigation when no prior quiz was played.
Fixing shared pre-existing behavior is out of scope (Requirement 13 /
Out-of-Scope 5).

## Guardrail gates (full worktree) — no new findings vs. baseline

Recorded baseline: lint = 12 errors + 4 warnings; tsc = 1 error in `src/utils.ts`.

| Gate | Command | Exit | Result |
| ---- | ------- | ---- | ------ |
| lint | `npm run lint` | 1 | **12 errors + 4 warnings** across 74 files (72 baseline + the 2 new feature files). Identical to baseline; **zero** findings in either new file. |
| tsc  | `npx tsc --noEmit` | 2 | **1 error** — `src/utils.ts(58,19): error TS18046` (the exact baseline error). **No** error in any new feature file. |

Both gates match the recorded baseline exactly. This feature's diff introduces
**no new** lint or type findings. The pre-existing baseline failures are out of
scope and were not modified.
