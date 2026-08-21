# Build Plan: Special Attack Comparison Page

## Overview

This plan implements a new `/special-attack` page that mirrors the shipped "Who's Faster?" Speeds page (`/speeds`) for the Special Attack stat: a hero, a "Learn Special Attack" selector of section cards, a head-to-head "guess which has the higher Special Attack" streak quiz, and a sortable/searchable table of all Pokémon by Special Attack. It deliberately drops the Speeds page's numeric "guess the number" game and its dead "moves-priority" stub (both out of scope). The approach is the design's **clean fork**: add a new SSR page component and a new client store under the **distinct** Interactivity namespace `pokemon/special-attack`, reuse the already-generic shared components/utilities unchanged, and change only the stat read from `.speed` to the already-present `.spAttack`. No new data model, query, schema, or API is introduced — `spAttack` is already loaded server-side alongside `speed`.

Investigation behind the scope: I read the model page `src/pages/speeds.ts` and its store `src/client/stores/pages/speeds.ts`, plus the shared components (`Hero`, `SectionCard`, `QuizSection`, `QuizStatus`, `DataTable`, `PokemonCard`, `Section`, `Card`) and utilities (`quiz-utils`, `section-utils`, `utils/array.ts`, `utils/quiz.ts`), and the four wiring surfaces (`src/routes/index.ts`, `scripts/build.ts`, `src/components/Nav.ts`, `src/pages/home.ts`). I confirmed: `spAttack` exists on the Pokémon schema (`src/db/schema/pokemons.ts:24`, `sp_attack`) and on the inferred `Pokemon` type; the `pokemon`, `pokemon/data-table`, `quiz-utils`, and `section-utils` stores are stat-agnostic and driven entirely by context/props; `lucide-static` exports `Zap` (verified via `require('lucide-static')`); the `.speed-*` reveal/hover CSS classes are global (single bundle) and referenced only by the Speeds page. Searches that came back empty and shaped scope: there is **no** unit-test runner, e2e harness, or `test`/`vitest`/`jest`/`playwright`/`cypress` dependency in `package.json` (grep of dev/prod deps returned none), and the codebase contains no test files — so this plan adds none and states verification explicitly below (see **Verification approach**).

The order is: build the two new files (client store, then page component), wire them in (build entry point, then route), add the two additive discoverability entries (nav link, homepage card), and finish with an end-to-end validation pass. The single highest-risk item is design residual **R-3**: the new store MUST register the namespace `pokemon/special-attack`, and the page's `data-wp-interactive` string MUST match it exactly — reusing `pokemon/speeds` would merge and corrupt both pages' state across client-side navigation. This is called out in Task 1 and Task 2 acceptance.

## Guardrail scopes

No scoped gates were passed to this planner. Both gates the build phase runs are FIXED and unscoped, applied by every writer/reviewer to the whole worktree.

| Gate | Scope |
| ---- | ----- |
| lint (`npm run lint` = `biome check`) | None (FIXED / unscoped) |
| typecheck (`npx tsc --noEmit`) | None (FIXED / unscoped) |

## Verification approach

There is no unit-test runner and no e2e harness configured in this repository (`package.json` has `lint` = `biome check` and no test script; no test framework is installed). Per the phase guidance, this plan does **not** invent a test command and does **not** add test scaffolding (the design sanctions none, reuses shipped stat-agnostic logic, and the codebase has zero tests — adding a runner would be unsanctioned scope). Instead, every task's Acceptance is verified by:

1. **`npm run lint`** (`biome check`) — passes with no new errors.
2. **`npx tsc --noEmit`** — passes with no new type errors.
3. **App runtime observation** — build assets (`npm run build:js` and `npm run build:css`) and run the app (`npm run dev`), then observe the task's listed behaviors in the browser. The `## E2E test plan` flows below are the concrete drive-through the final task and the reviewer use.

For the coding/wiring tasks (Type `tdd`), the build-writer treats each Acceptance bullet as the behavioral specification and confirms it via lint + typecheck + the runtime observation above; it must **not** scaffold or invent a unit-test runner. The final task (Type `e2e`) is executed as a documented manual/scripted browser drive-through of the E2E flows (the reviewer re-drives the same flows), not an automated suite.

## E2E test plan

### Flow 1: Page loads server-rendered with data

- **Steps:** Open `/special-attack` directly (fresh load, no prior navigation).
- **Expected:** The page renders with a hero titled "Special Attack" and a "Learn Special Attack" selector of section cards. Pokémon data is present in the initial HTML (SSR table rows and the `#wp-interactivity-data` blob) — first paint requires no client-side data fetch.
- **Traces to:** Acceptance criterion "opens the new page's URL … renders with a hero, a section selector, and Pokémon data present without a client-side data fetch" (Requirement 1, 3).

### Flow 2: Discoverability from nav and homepage

- **Steps:** (a) Open any page, open the global "Games" navigation (desktop dropdown and mobile menu). (b) Open the homepage `/` and view the "Games" section.
- **Expected:** A "SPECIAL ATTACK" entry appears in the Games nav and a "Special Attack" card appears in the homepage Games section; each navigates to `/special-attack` when activated.
- **Traces to:** Acceptance criterion "a 'Special Attack' game entry/card is present and links to the new page" (Requirement 2).

### Flow 3: Section selector reveals one section at a time

- **Steps:** On `/special-attack` load, observe visible sections. Click the head-to-head section card; then click the table section card.
- **Expected:** On load only the hero and the two selector cards are visible; the head-to-head quiz and the table are hidden. Clicking the head-to-head card reveals only that section; clicking the table card reveals only the table. Exactly one section is visible at a time.
- **Traces to:** Acceptance criterion "when nothing has been selected, only the hero and the section-selector cards are visible; when the user clicks a section card, that section becomes visible and the others remain hidden" (Requirement 4).

### Flow 4: Head-to-head shows two distinct Pokémon and the streak

- **Steps:** Reveal the head-to-head quiz section.
- **Expected:** Two distinct Pokémon are shown side by side (with a "VS"), and the current streak ("Streak: 0") is displayed.
- **Traces to:** Acceptance criterion "two distinct Pokémon appear side by side and the current streak is displayed" (Requirement 5, 9).

### Flow 5: Correct selection increments streak and advances

- **Steps:** In the waiting state, select the Pokémon with the higher Special Attack.
- **Expected:** Both Pokémon's Special Attack values are revealed (animated count-up to the real values), the selection is marked correct, the streak increases by one, and a fresh random pair is presented.
- **Traces to:** Acceptance criterion "selects the Pokémon with the higher Special Attack … values revealed, marked correct, streak increases by one, new random pair" (Requirements 5, 6, 7, 9).

### Flow 6: Incorrect selection ends the run with restart

- **Steps:** In the waiting state, select the Pokémon with the lower Special Attack. Then click "Try again".
- **Expected:** Values are revealed, the selection is marked incorrect, the run ends showing "GAME OVER" and "Final streak: N", and a "Try again" restart control is offered. Clicking "Try again" resets the streak to 0 and presents a fresh pair in the waiting state.
- **Traces to:** Acceptance criterion "selects the lower … marked incorrect, run ends showing the final streak, restart control offered" (Requirement 7).

### Flow 7: Tie accepts either selection

- **Steps:** Reach (or arrange) a pair whose two Pokémon have equal Special Attack; select either one.
- **Expected:** The selection is accepted as correct (streak increments, advances to a new pair).
- **Traces to:** Acceptance criterion "two Pokémon with equal Special Attack … selecting either one is accepted as correct" (Requirement 8).

### Flow 8: Reduced motion shows final values immediately

- **Steps:** Enable OS/browser "prefers reduced motion"; make a selection in the head-to-head quiz.
- **Expected:** The final Special Attack values are shown immediately, with no count-up animation; the correct/incorrect outcome is otherwise identical.
- **Traces to:** Acceptance criterion "prefers reduced motion … final values shown immediately without the count-up animation" (Requirement 6).

### Flow 9: Table lists all Pokémon, sorted by Special Attack descending

- **Steps:** Reveal the table section.
- **Expected:** The table lists all loaded Pokémon with sprite, name, and Special Attack columns, sorted by Special Attack from highest to lowest by default.
- **Traces to:** Acceptance criterion "lists all loaded Pokémon with sprite, name, and Special Attack, sorted by Special Attack from highest to lowest by default" (Requirement 10, 11).

### Flow 10: Table sort toggles and search scrolls/highlights

- **Steps:** Click the "Name" column header (twice to observe toggle); click the "Special Attack" header (twice); type a Pokémon name into the search box.
- **Expected:** Clicking a sortable header sorts by that column and toggles ascending/descending on repeat clicks. Searching scrolls to and highlights matching rows while all other rows remain present (not filtered out).
- **Traces to:** Acceptance criterion "sort by that column (toggling asc/desc); searching scrolls to and highlights matching rows while other rows remain present" (Requirement 10).

### Flow 11: Insufficient data renders only a graceful message

- **Steps:** With fewer than two Pokémon available in the server data, open `/special-attack`.
- **Expected:** The page renders only a "Not enough Pokemon loaded." message — no hero, no section selector, no table — and no error occurs.
- **Traces to:** Acceptance criterion "fewer than two Pokémon … renders only a 'not enough Pokémon' message … no error" (Requirement 12).

### Flow 12: No regressions on existing pages

- **Steps:** Exercise `/speeds` (both the "Who's Faster?" head-to-head and the "Guess Speed" numeric game, and its speeds table), the homepage, and navigation.
- **Expected:** All existing pages behave exactly as before, apart from the newly added "SPECIAL ATTACK" nav entry and the new homepage "Special Attack" card. In particular, `/speeds` quiz state is unaffected even after navigating between `/speeds` and `/special-attack` (distinct namespaces do not merge).
- **Traces to:** Acceptance criterion "existing pages' observable behavior is unchanged" (Requirement 13).

## Tasks

### Task 1: Create the Special Attack client store (distinct namespace)

- **Goal:** Add a new WordPress Interactivity store, registered under the distinct namespace `pokemon/special-attack`, carrying the head-to-head quiz + section-selection logic and reading each Pokémon's `spAttack`. This is a clean fork of the Speeds store with the numeric guess-speed members removed.
- **Type:** tdd
- **Files to change:** create `src/client/stores/pages/special-attack.ts`.
- **Changes:**
  - Model the file on `src/client/stores/pages/speeds.ts`. Keep the same imports so the page's single bundled script pulls in its dependencies: `getContext` and `store` from `@wordpress/interactivity`; the side-effect imports `@pokemon-website/stores/pokemons` and `../data-table.js`; and from `@pokemon-website/stores/quiz-utils` the named imports `isCurrentSection`, `isIncorrect`, `isWaiting`, `type QuizPokemon`, `selectSection`, `syncPokemonContext`. Do **not** import `randomizeSingle` (guess-speed only). Also keep `import type { PokemonStore } from "@pokemon-website/stores/pokemons"` and `const { state: pokemonState } = store<PokemonStore>("pokemon", {})`.
  - Define a context type (e.g. `PokemonSpecialAttackContext`) with only the head-to-head fields: `correctAnswer: number | "tie" | null`, `currentSection: string`, `streak: number`, `quizState: "waiting" | "revealing" | "correct" | "incorrect"`, `pokemonIndex: number`, `randomPokemons: QuizPokemon[]`, `sectionId: string`, `animationProgress: number`, `guessedIndex: number | null`, `finalStreak: number`. Omit the guess-speed fields (`randomPokemon`, `speedGuess`, `correctSpeed`).
  - Copy the helper functions `toQuizPokemon`, `randomize`, and `resetQuizState` unchanged (they are stat-agnostic).
  - Copy `revealAnswer` **verbatim**, including the `window.matchMedia("(prefers-reduced-motion: reduce)")` reduced-motion branch that jumps `animationProgress` to `1` and shows the final value immediately.
  - Add `getDisplayedSpAttack(pokemonData, animationProgress)` as a copy of `getDisplayedSpeed`, changing the single stat read from `pokemon.speed` to `pokemon.spAttack` and returning `0` on a lookup miss.
  - Register `store("pokemon/special-attack", { ... })` with:
    - **state** getters: `isCurrentSection`, `isWaiting`, `isIncorrect` (each delegating to the quiz-utils helper with the string `"pokemon/special-attack"`); `isGuessedCorrect` and `isGuessedIncorrect` (copied logic); and `displayedSpAttack` (reads `context.randomPokemons?.[context.pokemonIndex]` via `getDisplayedSpAttack`). Omit `displayedGuessSpeed` and the guess-speed-only `isCorrect` getter.
    - **actions**: `guessSpAttack` (copy of `guessSpeed`, renamed), `restart`, and `selectSection` (delegating to the helper with `"pokemon/special-attack"`). Omit `updateSpeedGuess`, `submitGuessSpeed`, `restartGuessSpeed`.
    - **callbacks**: `updateContext` (copied) and `storeAnswer` — copied, but computing against `spAttack`: `context.correctAnswer = pokemonA.spAttack === pokemonB.spAttack ? "tie" : (pokemonA.spAttack > pokemonB.spAttack ? 0 : 1)`. Omit `updateGuessSpeedContext`, `storeGuessSpeedAnswer`.
  - Every `getContext<...>("pokemon/speeds")` and every helper call passing `"pokemon/speeds"` MUST use `"pokemon/special-attack"` instead.
- **Depends on:** none.
- **Traces to:** Design "Fork the page + store" and "Duplicate the reveal animation" decisions; risk R-3; Requirements 5, 6, 7, 8, 9, 11.
- **Acceptance:**
  - The store is registered with the namespace string exactly `pokemon/special-attack`, and the file contains no reference to the string `pokemon/speeds`.
  - The store contains no guess-speed members: no `randomPokemon`/`speedGuess`/`correctSpeed` context fields; no `updateSpeedGuess`/`submitGuessSpeed`/`restartGuessSpeed` actions; no `displayedGuessSpeed` or guess-speed `isCorrect` getters; no `updateGuessSpeedContext`/`storeGuessSpeedAnswer` callbacks.
  - `storeAnswer` sets `correctAnswer` to `"tie"` when the two Pokémon's `spAttack` are equal, otherwise to the index (`0` or `1`) of the higher-`spAttack` Pokémon.
  - `getDisplayedSpAttack`/`displayedSpAttack` reads `spAttack` (never `speed`) and returns `0` when the client-side Pokémon lookup misses.
  - `revealAnswer` retains the reduced-motion branch: when `prefers-reduced-motion` is set it sets `animationProgress = 1` and resolves the outcome without the `requestAnimationFrame` count-up.
  - `guessSpAttack` marks the selection correct when `correctAnswer === "tie"` or `correctAnswer === pokemonIndex`; on correct it increments `streak` and advances to a new pair, on incorrect it records `finalStreak` and ends the run.
  - `npm run lint` and `npx tsc --noEmit` pass.

### Task 2: Create the Special Attack SSR page component

- **Goal:** Add the server-rendered page `SpecialAttackPage()` mirroring the Speeds page structure minus the guess-speed game and the moves-priority stub: an insufficient-data early return, a hero, a "Learn Special Attack" selector of two section cards, the head-to-head `QuizSection`, and the `DataTable` — all inside a `pokemon/special-attack` interactive wrapper.
- **Type:** tdd
- **Files to change:** create `src/pages/special-attack.ts`.
- **Changes:**
  - Model on `src/pages/speeds.ts`. Reuse the shared components/utilities via the same import style: `Hero`, `SectionCard`, `QuizSection`, `Section`, `DataTable`, `PokemonCard`, `getServerData`, `pickTwo` (from `../utils/array.js`), and `defaultQuizContext` (from `../utils/quiz.js`); the `Pokemon`, `DataTableColumn`, `DataTableRow` types; and `html` from `hono/html`. Do **not** import `pickRandomPokemon` (guess-speed only).
  - Define two page-local presentational helpers, copied from the Speeds page with stat-specific renaming:
    - `SpAttackRevealOverlay(textBinding, correctBinding, incorrectBinding)` — identical markup to `SpeedRevealOverlay`, reusing the existing `.speed-overlay-bg`, `.speed-overlay-correct`, `.speed-overlay-incorrect`, `.speed-correct`, `.speed-incorrect` classes as-is (accepted residual R-2). Use `aria-label="Special Attack stat"`.
    - `SpAttackPokemonCard(index, pokemon)` — copy of `SpeedPokemonCard`, reusing the `speed-pokemon-btn` class as-is; `aria-label="Select <name> as higher special attack"` (name with hyphens replaced by spaces); `data-wp-on--click="actions.guessSpAttack"`; and the overlay bound to `state.displayedSpAttack`, `state.isGuessedCorrect`, `state.isGuessedIncorrect`.
  - In `SpecialAttackPage()`:
    - Read `getServerData()` → `pokemons = Object.values(state.pokemon.pokemons)` (same as Speeds).
    - If `pokemons.length < 2`, return exactly `html\`<main><p>Not enough Pokemon loaded.</p></main>\`` and nothing else.
    - Otherwise: `const [pokemonA, pokemonB] = pickTwo(pokemons)`; `randomPokemons = [{ dexNumber, formName }, { dexNumber, formName }]`; include the same inline `capitalize` helper; build `spAttackRows: DataTableRow[] = pokemons.map(p => ({ id: String(p.id), sprite: p.imageUrl ?? "", name: capitalize(p.name.replaceAll("-", " ")), spAttack: p.spAttack }))`.
    - Render a `<main>` containing:
      - `Hero({ title: "Special Attack", description: "Two Pokemon appear side by side. Guess which one has the higher Special Attack stat — or if they're tied. One wrong answer ends your streak!", image: "/images/pokemon/artwork/25.png", imageBg: "/images/pokemon/artwork/9.png" })` (copy strings are owner-adjustable proposed defaults).
      - An interactive wrapper `<div data-wp-interactive="pokemon/special-attack" data-wp-context='{"currentSection": null}'>` containing everything below.
      - A `Section` with an `<h2>Learn Special Attack</h2>` and exactly two `SectionCard`s:
        - `{ title: "Higher Special Attack", description: "Guess which Pokemon has the higher Special Attack stat.", sectionId: "whos-higher-special-attack" }`
        - `{ title: "Special Attack Table", description: "Browse all Pokemon sorted by their Special Attack stat.", sectionId: "special-attack-table" }`
      - A head-to-head `QuizSection({ sectionId: "whos-higher-special-attack", sectionContext: { randomPokemons }, quizContext: { ...defaultQuizContext(), randomPokemons, animationProgress: 0, guessedIndex: null }, watchCallback: "callbacks.storeAnswer", restartAction: "actions.restart", children: <two SpAttackPokemonCard(0, pokemonA) / SpAttackPokemonCard(1, pokemonB) with a "VS" between them, plus an sr-only <h3>> })`.
      - A table `Section({ class: "section-diagonal py-32", attrs: \`data-wp-context='${JSON.stringify({ sectionId: "special-attack-table" })}' data-wp-bind--hidden="!state.isCurrentSection"\`, children: <div class="rounded-lg p-6" data-wp-interactive="pokemon/data-table"> DataTable(...) </div> })` where `DataTable` is configured with columns `[{ key: "sprite", label: "", render: "image", altKey: "name", cellClass: "w-20" }, { key: "name", label: "Name", sortable: true, searchable: true }, { key: "spAttack", label: "Special Attack", sortable: true }]`, `rows: spAttackRows`, `caption: "Pokemon sorted by special attack"`, `maxHeight: "70vh"`, `searchPlaceholder: "Search Pokemon..."`, `searchMode: "scroll"`, `sortColumn: "spAttack"`, `sortDirection: "desc"`.
    - Do **not** render a guess-speed section or a moves-priority section.
  - `export default SpecialAttackPage`.
- **Depends on:** Task 1 (the interactive wrapper's namespace string and the `state.*`/`actions.*`/`callbacks.*` references must match the store's contract).
- **Traces to:** Requirements 1, 3, 4, 5, 8, 9, 10, 12; design "Components"/"Interfaces and Data Flow"; decisions "Reuse the existing `.speed-*` CSS classes" (R-2) and "Naming, URL, labels, and copy".
- **Acceptance:**
  - When `pokemons.length < 2`, `SpecialAttackPage()` returns exactly the bare `<main><p>Not enough Pokemon loaded.</p></main>` — no hero, selector, quiz, or table.
  - With ≥ 2 Pokémon, the output contains: one hero whose title is "Special Attack"; a "Learn Special Attack" selector with exactly two section cards; exactly one head-to-head `QuizSection`; and exactly one `DataTable`. It contains no numeric guess-speed form/section and no "moves-priority" section.
  - The interactive wrapper carries `data-wp-interactive="pokemon/special-attack"` and initial context `{"currentSection": null}` (matching Task 1's namespace); the file contains no `data-wp-interactive="pokemon/speeds"`.
  - Each `SectionCard`'s `sectionId` (`whos-higher-special-attack`, `special-attack-table`) matches the `sectionId` on its corresponding revealable section wrapper, so exactly one section is revealed per selection.
  - The `DataTable` has a "Special Attack" column keyed `spAttack`; rows are built as `{ id, sprite, name, spAttack }` from each Pokémon's `spAttack`; `sortColumn` is `"spAttack"`, `sortDirection` is `"desc"`, `searchMode` is `"scroll"`; the name column is sortable and searchable and the Special Attack column is sortable.
  - The head-to-head choice/reveal markup reuses the `.speed-*` classes and binds to `state.displayedSpAttack`, `state.isGuessedCorrect`, `state.isGuessedIncorrect`, and `actions.guessSpAttack`.
  - `npm run lint` and `npx tsc --noEmit` pass.

### Task 3: Register the store bundle as an esbuild entry point

- **Goal:** Add the new client store to the build so `public/js/stores/pages/special-attack.js` is emitted (bundles are not auto-discovered; without this the route's script 404s).
- **Type:** tdd
- **Files to change:** `scripts/build.ts`.
- **Changes:** Append the string `"src/client/stores/pages/special-attack.ts"` to the `entryPoints` array (alongside the existing `src/client/stores/pages/speeds.ts` and siblings). No other change.
- **Depends on:** Task 1 (the source file must exist or esbuild fails).
- **Traces to:** Design "Modified files" (`scripts/build.ts`, mandatory-to-ship); Requirement 1.
- **Acceptance:**
  - `entryPoints` in `scripts/build.ts` includes `src/client/stores/pages/special-attack.ts`.
  - `npm run build:js` completes without error and emits `public/js/stores/pages/special-attack.js`.
  - `npm run lint` and `npx tsc --noEmit` pass.

### Task 4: Register the `/special-attack` route

- **Goal:** Serve the page at `GET /special-attack` through the shared page-registration loop, loading Types + Pokémon server-side and wiring the page script.
- **Type:** tdd
- **Files to change:** `src/routes/index.ts`.
- **Changes:**
  - Add `import SpecialAttackPage from "../pages/special-attack.js";` alongside the other page imports.
  - Append to the `pages` array: `{ path: "/special-attack", title: "Special Attack", render: SpecialAttackPage, scripts: ["/js/stores/pages/special-attack.js"] }`. No change to the loop, the `/team-building` handler, or `loadTypes`.
- **Depends on:** Task 2 (imports the page component), Task 3 (the referenced script bundle must exist).
- **Traces to:** Requirement 1; design "Interfaces and Data Flow" (Route / SSR).
- **Acceptance:**
  - `GET /special-attack` returns HTTP 200 with SSR HTML containing the hero, the section selector, and Pokémon data embedded for first paint (SSR table rows and the `#wp-interactivity-data` blob) — no client-side data fetch is required to render.
  - The rendered document loads the script `/js/stores/pages/special-attack.js`.
  - The Layout/page `<title>` reflects "Special Attack".
  - Existing routes still resolve unchanged.
  - `npm run lint` and `npx tsc --noEmit` pass.

### Task 5: Add the "SPECIAL ATTACK" navigation entry

- **Goal:** Add a global "Games" navigation entry linking to the new page (desktop dropdown and mobile menu are both array-driven from the same list).
- **Type:** tdd
- **Files to change:** `src/components/Nav.ts`.
- **Changes:** Append `{ label: "SPECIAL ATTACK", href: "/special-attack" }` to the `GAME_LINKS` array. No other change.
- **Depends on:** Task 4 (the link target must resolve for meaningful verification).
- **Traces to:** Requirement 2; design decision "Naming, URL, labels, and copy" (nav label).
- **Acceptance:**
  - `GAME_LINKS` contains a fifth entry `{ label: "SPECIAL ATTACK", href: "/special-attack" }`.
  - The desktop Games dropdown and the mobile Games group both render the "SPECIAL ATTACK" link pointing to `/special-attack`, and activating it navigates to the new page.
  - The four existing game links (Types, Speeds, Roles, Will It KO?) are unchanged.
  - `npm run lint` and `npx tsc --noEmit` pass.

### Task 6: Add the homepage "Special Attack" game card

- **Goal:** Add a homepage Games-section card for the new page, with the `Zap` icon, matching the existing card pattern.
- **Type:** tdd
- **Files to change:** `src/pages/home.ts`.
- **Changes:**
  - Add `Zap` to the existing `lucide-static` import.
  - Append to the `GAMES` array: `{ title: "Special Attack", description: "Test your Special Attack knowledge! Two Pokemon appear — guess which one hits harder specially.", href: "/special-attack", icon: Zap }` (description is an owner-adjustable proposed default). No other change.
- **Depends on:** Task 4 (the card target must resolve for meaningful verification).
- **Traces to:** Requirement 2; design decision "Naming, URL, labels, and copy" (homepage card title + `Zap` icon).
- **Acceptance:**
  - `GAMES` contains a card `{ title: "Special Attack", href: "/special-attack", icon: Zap, ... }`, and the homepage Games section renders it linking to `/special-attack`.
  - The existing game cards and the Tools section are unchanged.
  - `npm run lint` and `npx tsc --noEmit` pass.

### Task 7: End-to-end validation of all flows and regressions

- **Goal:** Verify the whole feature against the running app by driving every flow in the E2E test plan, and confirm no regressions on existing pages.
- **Type:** e2e
- **Files to change:** none (verification task). Build assets (`npm run build:js`, `npm run build:css`) and run the app (`npm run dev`), then drive the flows in a browser. Because there is no e2e harness (see **Verification approach**), this is executed as a documented manual/scripted runtime drive-through — do **not** invent a test command or add a test runner.
- **Depends on:** Task 1, Task 2, Task 3, Task 4, Task 5, Task 6.
- **Traces to:** all spec acceptance criteria; Requirement 13 (no regressions); risk R-3 (namespace isolation across navigation).
- **Acceptance:**
  - E2E Flows 1–11 all behave as specified in the `## E2E test plan`.
  - Flow 12 passes: `/speeds` (both its head-to-head and numeric guess-speed games and its table), the homepage, and other existing pages are unchanged apart from the added nav entry and homepage card; navigating back and forth between `/speeds` and `/special-attack` does not merge or corrupt either page's quiz/streak state (confirming the distinct namespace, R-3).
  - `npm run lint` and `npx tsc --noEmit` pass on the full worktree.
