# Design Doc: Special Attack Comparison Page

## Overview

The site has one per-stat comparison game — the "Who's Faster?" page at `/speeds`, which lets visitors learn and test their knowledge of Pokémon Speed. There is no equivalent for the Special Attack stat. This feature adds a new page at `/special-attack` that mirrors the Speeds experience for Special Attack: a hero, a "Learn Special Attack" selector of section cards, a head-to-head "guess which has the higher Special Attack" streak quiz, and a sortable/searchable table of all Pokémon by Special Attack. The exact-value "guess the number" quiz that also lives on the Speeds page is intentionally not carried over.

The chosen approach is a **clean fork**: a new page component and a new client store, reusing the codebase's already-generic shared components (Hero, section cards, quiz section/status, data table) as-is, and swapping the stat from `.speed` to the already-present `.spAttack` field. No new data model, API, query, or schema is required — `spAttack` is already loaded server-side alongside `speed`. The design deliberately touches no existing page's observable behavior: the only edits to existing files are mandatory wiring (route registration, build entry point) and additive discoverability entries (one nav link, one homepage card).

## Approach

Every page on the site (except `/team-building`) is a Hono route whose handler loads Types and Pokémon server-side and renders a `Layout(...)` around a page component; interactivity is provided by the WordPress Interactivity API, where a page's client store is registered under a namespace string that matches a `data-wp-interactive="<namespace>"` attribute in the SSR HTML. The Speeds page is built exactly this way, and its heavy logic already lives in shared, prop-driven modules.

The implementer builds the Special Attack page as a sibling of the Speeds page:

1. **Server render.** A new Hono route `GET /special-attack` reuses the shared page-registration loop, so Types + Pokémon are loaded server-side and the page renders with data present on first paint (no client fetch needed).
2. **Page component.** `SpecialAttackPage()` mirrors the Speeds page's structure minus the numeric guess-speed game and the dead "moves-priority" stub: an insufficient-data early return, a hero, a "Learn Special Attack" selector of two section cards (head-to-head quiz, table), the head-to-head `QuizSection`, and the `DataTable`.
3. **Client store.** A new store registered under the **distinct** namespace `pokemon/special-attack` carries the head-to-head quiz + section-selection logic, reading each Pokémon's `spAttack` value. The count-up reveal animation (including the reduced-motion path) and streak/game-over mechanics are copied from the Speeds store, which are already stat-agnostic; only the three stat-reading points switch to `.spAttack`.
4. **Shared components reused as-is.** `Hero`, `SectionCard`, `QuizSection`, `QuizStatus`, `DataTable`, and `PokemonCard`, plus the shared `pokemon` and `pokemon/data-table` stores and the `pickTwo`/`defaultQuizContext` utilities, are used without modification — they are already generic and driven entirely by props/context.
5. **Discoverability.** One entry is appended to the global nav `GAME_LINKS` and one card to the homepage `GAMES` list; both surfaces are array-driven wrapping layouts, so the fifth item is purely additive.

The mental model: the Special Attack page is a second, independent instance of the same page shape the Speeds page already uses, wired to a different stat field under its own interactivity namespace — sharing the components that are already shared, and duplicating only the thin, page-specific glue.

## Components

**New files:**

- `src/pages/special-attack.ts` — SSR page component `SpecialAttackPage()`. Holds the `pokemons.length < 2` early return; the hero; a "Learn Special Attack" selector of two `SectionCard`s (head-to-head quiz + table); the head-to-head `QuizSection`; the `DataTable`; and the page-local presentational helpers `SpAttackRevealOverlay` / `SpAttackPokemonCard` (the reveal overlay and the clickable Pokémon card).
- `src/client/stores/pages/special-attack.ts` — client store registered as `store("pokemon/special-attack", {...})`. Contains the copied stat-agnostic helpers (`revealAnswer`, `randomize`, `resetQuizState`, `toQuizPokemon`) and a `getDisplayedSpAttack` reader; `state` getters (`isCurrentSection`, `isWaiting`, `isIncorrect`, `isGuessedCorrect`, `isGuessedIncorrect`, `displayedSpAttack`); `actions` (`guessSpAttack`, `restart`, `selectSection`); `callbacks` (`updateContext`, `storeAnswer`). No guess-speed members.

**Modified files (all additive or mandatory-to-ship; none changes an existing page's observable behavior):**

- `src/routes/index.ts` — import the page and add a `pages`-array entry `{ path: "/special-attack", title: "Special Attack", render: SpecialAttackPage, scripts: ["/js/stores/pages/special-attack.js"] }`.
- `scripts/build.ts` — add `src/client/stores/pages/special-attack.ts` to the `entryPoints` array (bundles are not auto-discovered, so this is required or the route's script 404s).
- `src/components/Nav.ts` — append `{ label: "SPECIAL ATTACK", href: "/special-attack" }` to `GAME_LINKS`.
- `src/pages/home.ts` — import `Zap` from `lucide-static` and append a `GAMES` card `{ title: "Special Attack", description: "…", href: "/special-attack", icon: Zap }`.

**Reused unchanged:** `Hero`, `SectionCard`, `QuizSection`, `QuizStatus`, `DataTable`, `PokemonCard` components; the `pokemon`, `pokemon/data-table`, `quiz-utils`, and `section-utils` client stores; `pickTwo` (`utils/array.ts`), `defaultQuizContext` (`utils/quiz.ts`), and `getServerData`; and the existing `.speed-*` reveal/hover CSS classes (reused as-is, not edited).

## Interfaces and Data Flow

**Route / SSR.** `GET /special-attack` is handled by the shared registration loop in `routes/index.ts`, which runs `resetServerState()`, `await loadTypes()`, `await loadPokemons()`, then renders `Layout({ title: "Special Attack", scripts: ["/js/stores/pages/special-attack.js"], children: SpecialAttackPage() })`. First paint requires no client-side data fetch — the Pokémon data is embedded in the SSR HTML and the `#wp-interactivity-data` blob.

**Page data preparation.** `SpecialAttackPage()` reads `getServerData()` → `pokemons`. If `pokemons.length < 2`, it returns the bare `<main><p>Not enough Pokemon loaded.</p></main>` and nothing else renders. Otherwise it builds:
- `spAttackRows = pokemons.map(p => ({ id, sprite: <imageUrl>, name: <capitalized>, spAttack: p.spAttack }))`
- `const [a, b] = pickTwo(pokemons)` → `randomPokemons = [{ dexNumber, formName }, { dexNumber, formName }]` (no stat value is carried in context; the `spAttack` lookup happens client-side).

**Interactive region.** The page wrapper is `<div data-wp-interactive="pokemon/special-attack" data-wp-context='{"currentSection": null}'>`. The head-to-head `QuizSection` is invoked with `sectionId` (its own id), `sectionContext: { randomPokemons }`, `quizContext: { ...defaultQuizContext(), randomPokemons, animationProgress: 0, guessedIndex: null }`, `watchCallback: "callbacks.storeAnswer"`, and `restartAction: "actions.restart"`; these seed the section's `data-wp-context`. (`defaultQuizContext()` is `{ streak: 0, quizState: "waiting", finalStreak: 0 }`.)

**Section visibility.** `currentSection` starts `null` on the wrapper, so on load only the hero and the "Learn Special Attack" selector cards are visible. Each `SectionCard` click invokes `actions.selectSection`, which sets `currentSection` to that card's id; every revealable section (the head-to-head `QuizSection` and the table's section wrapper) binds `data-wp-bind--hidden="!state.isCurrentSection"` (where `isCurrentSection` compares `currentSection` to the section's own id), so exactly one section shows at a time (Requirement 4). The head-to-head section's `QuizStatus` renders "Streak: N" (bound to `context.streak`) while the quiz is played, and the "GAME OVER / Final streak: N / Try again" state on a loss — satisfying Requirement 9 and the restart control of Requirement 7.

**Client store data flow.** The store reads `context.randomPokemons` (the seeded pair, `{ dexNumber, formName }` only), resolves each Pokémon's `spAttack` client-side via the shared `pokemon` store's `getPokemon(dex, form)`, and:
- `state.displayedSpAttack = getDisplayedSpAttack(pokemonData, context.animationProgress)` drives the count-up.
- `callbacks.storeAnswer` sets `context.correctAnswer = a.spAttack === b.spAttack ? "tie" : (a.spAttack > b.spAttack ? 0 : 1)`.
- `actions.guessSpAttack` marks the selection correct/incorrect against `guessedIndex` and calls `revealAnswer(context, isCorrect, () => randomize(context))`; `revealAnswer` animates the reveal (or jumps to final under reduced motion), increments `streak` and advances on correct, or records `finalStreak` and ends the run on incorrect.
- Subsequent pairs come from `pokemonState.getRandomPokemons(2)` client-side.

**Data table interface.**
```
DataTable({
  columns: [
    /* sprite: image render, alt = name */,
    { key: "name",     label: "Name",           sortable: true, searchable: true },
    { key: "spAttack", label: "Special Attack", sortable: true },
  ],
  rows: spAttackRows,
  sortColumn: "spAttack",
  sortDirection: "desc",
  searchMode: "scroll",
  caption: "Pokemon sorted by special attack",
  maxHeight: "70vh",
  searchPlaceholder: "Search Pokemon...",
})
```
The table runs in the shared `pokemon/data-table` interactive region over static SSR rows. `searchMode: "scroll"` scrolls to and highlights matching rows rather than filtering others out.

**Message / data shapes.** `randomPokemons: { dexNumber: number, formName: string | null }[]`; table row: `{ id: string | number, sprite: string, name: string, spAttack: number }`.

## Key Decisions

### Decision: Fork the page + store rather than parameterize or generalize

- **Choice:** Add a new page component and a new client store (under a distinct namespace `pokemon/special-attack`), reusing all already-generic shared components as-is; do not modify the shipped Speeds page or store.
- **Alternatives:** (a) Parameterize the Speeds store by a `statKey` and have both pages call it; (b) Generalize the whole page into a shared "stat comparison page" builder.
- **Trade-offs:** The substantial generic logic (Hero, SectionCard, QuizSection, QuizStatus, DataTable + its store, `pickTwo`, `defaultQuizContext`, section/quiz-state utils) already lives in shared modules; the genuine stat coupling is three property reads in the store plus copy strings and two page-local helpers. So the DRY savings from (a)/(b) are small (~3 lines plus thin glue), while both edit the shipped Speeds surfaces and create an observable-regression risk on `/speeds` that must be re-verified. (a) is further complicated because the numeric guess-speed members are Speeds-only and out of scope here, so a clean factory would have to special-case them. (b) is speculative: there is no roadmap for further per-stat pages — Speeds is the sole precedent — so a page abstraction would have one-and-a-half users. Verified against the WordPress Interactivity API package source: distinct namespaces are independent singletons that coexist cleanly (even under client-side navigation, where both page store modules stay alive), so a fork under `pokemon/special-attack` is collision-free; reusing `pokemon/speeds` would merge state.
- **Traces to:** Requirement 13 / Out-of-Scope 5 (existing pages observably unchanged; reuse-vs-generalize is a design decision); Requirements 1–12 (realized by the forked page/store + reused components); the intent explicitly left this open.

### Decision: Duplicate the reveal animation and page-local helpers; do not extract to shared modules

- **Choice:** Copy the stat-agnostic `revealAnswer` and the small `getDisplayedSpAttack` reader into the new store, and duplicate the page-local `SpAttackRevealOverlay` / `SpAttackPokemonCard` presentational helpers (renaming stat-specific strings/bindings). Keep the `getDisplayed*` reader local because it is inherently stat-coupled.
- **Alternatives:** Extract `revealAnswer` into the shared `quiz-utils` module (which it fits) and have both stores import it; and/or extract a shared reveal-overlay/choice-card component.
- **Trade-offs:** Extraction would remove one duplicated function but edits `quiz-utils` — a module the Types page store also loads — and edits `speeds.ts`, adding a re-verification obligation on `/speeds` and `/types` for marginal DRY gain. `revealAnswer` is stable, shipped code with low drift risk, so duplication is bounded and self-contained; the reduced-motion branch is copied intact. The presentational helpers are ~20-line markup glue whose stat-specific strings would make a shared component about as complex as two copies. The guiding principle: share substantial behavior only where a shared home already exists and the change is behavior-preserving; do not reach into existing observable-page source to refactor stable code or improve cosmetics. Both extractions remain safe, behavior-preserving follow-ups (see Risks).
- **Traces to:** Requirement 13 / Out-of-Scope 5; Requirements 5–9 (quiz mechanics realized by the copied logic); Requirement 6 (reduced-motion branch preserved).

### Decision: Reuse the existing `.speed-*` CSS classes as-is on the new page

- **Choice:** Apply the existing `.speed-overlay-*`, `.speed-correct/-incorrect`, and `.speed-pokemon-btn` classes on the new page without renaming or adding new classes.
- **Alternatives:** Add generic aliases (`.quiz-reveal-*`, `.quiz-choice-btn`) for the new page; or rename `.speed-*`→generic across `input.css` and `speeds.ts` markup.
- **Trade-offs:** CSS is a single global bundle loaded on every page, so these classes already ship site-wide; their values use only generic design tokens, and a grep confirms they are referenced solely by the Speeds page — so reuse is safe and cannot affect any other page, with zero CSS work. Aliasing would create two class-name sets for identical styling; renaming would edit the rendered markup of `/speeds` purely for a cosmetic gain. The accepted cost is that the new page's markup carries `speed`-named classes on a Special Attack page — a user-invisible naming mismatch (see Risks).
- **Traces to:** Requirement 13 / Out-of-Scope 5.

### Decision: Naming, URL, labels, and copy

- **Choice:** URL `/special-attack`; nav label `"SPECIAL ATTACK"`; hero title `"Special Attack"` (literal) with a short "guess which has the higher Special Attack; ties are safe; one wrong answer ends your streak" description; homepage card title `"Special Attack"` with `Zap` icon; table stat column header `"Special Attack"` (full word).
- **Alternatives:** A coined "Who's ___?" hero/card title (e.g. "Who Hits Harder?"); the abbreviated `"SpA"` table column label; other `lucide-static` icons (`Sparkles`, `Flame`, `Wand2`).
- **Trade-offs:** Each choice mirrors the corresponding Speeds surface's own convention (uppercase stat word in nav; full stat word in the single-stat table header; a lucide icon on the homepage card). Where the Speeds pun does not transfer — Special Attack has no natural single-word comparative and coinages like "Who Hits Harder?" risk conflating with the separate physical Attack stat — the literal stat name is the unambiguous, convention-backed default. `"SpA"` is reserved for dense multi-stat tables; the single-stat table spells the stat out, as the Speeds table does for "Speed". All copy strings are owner-adjustable defaults and are not load-bearing.
- **Traces to:** Requirements 1 (URL), 2 (nav + homepage card), 3 (hero), 10 (table column).

## Dependencies

No new dependencies. The design reuses existing infrastructure only:

- **`@wordpress/interactivity`** — `store`/`getContext`, `data-wp-*` directives, `matchMedia`-based reduced-motion detection, and the client-side router. The new store registers a **distinct** namespace `pokemon/special-attack`.
- **Hono** — the new route reuses the shared page-registration loop.
- **Data layer** — the Drizzle-inferred `Pokemon` type and the existing read-only `loadPokemons`/`loadTypes`. `spAttack` already exists in the server data the page consumes; no schema, query, or API change is introduced (Requirement 11).
- **`lucide-static`** — the homepage card icon (`Zap`), imported the same way as existing cards.
- **`esbuild`** (bundling; a new entry point is added) and **`tailwindcss`** (the single global CSS bundle; no new CSS).

## Failure Modes and Observability

- **Insufficient data (fewer than 2 Pokémon):** the page returns only the bare "Not enough Pokemon loaded." message; the hero, selector, quiz, and table do not render, and nothing throws. This early return also guarantees `pickTwo`'s length ≥ 2 precondition (Requirement 12).
- **Reduced motion:** the reveal checks `matchMedia("(prefers-reduced-motion: reduce)")` and jumps the animation progress to its end, showing final Special Attack values immediately (Requirement 6).
- **Ties:** when the two Pokémon have equal `spAttack`, `storeAnswer` yields `correctAnswer: "tie"`, so either selection is accepted as correct (Requirement 8).
- **Client lookup miss:** if a client-side `getPokemon` lookup returns null, `getDisplayedSpAttack` returns 0 and `randomize` bails when fewer than two Pokémon are available — degrading gracefully with no throw.
- **Observability:** the model Speeds page adds no server logging or telemetry, and this design adds none; client-side failures degrade gracefully (zeroed values, no advance). This is a deliberate non-addition consistent with precedent, not a gap.

## Risks and Open Questions

- **R-1 (accepted residual — duplicated reveal logic).** `revealAnswer` (~58 lines, including the Requirement-6 reduced-motion branch) and the small stat reader are duplicated across the Speeds and Special Attack stores; a future change to the reveal animation must be applied in both. Deferral is safe because the code is stable and shipped and a behavior-preserving extraction into shared `quiz-utils` is available at any time. It would be resolved by an optional follow-up refactor, verified by exercising the reveal on `/speeds`, `/types`, and `/special-attack`.
- **R-2 (accepted residual — `.speed-*` class names on a Special Attack page).** The new page's markup carries `speed`-named classes. The impact is cosmetic/readability only — user-invisible and functionally correct — so deferral is safe. It would be resolved by an optional future rename of `.speed-*`→generic across `input.css` and `speeds.ts` markup.
- **R-3 (risk to flag to the build phase — the namespace must be distinct).** Requirement 13 depends on the new store registering the distinct Interactivity namespace `pokemon/special-attack`. Because page scripts stay alive across client-side navigation, reusing `pokemon/speeds` would merge the two pages' store state and corrupt both. The build phase must use `pokemon/special-attack` and ensure the `data-wp-interactive` string in the page HTML matches the `store()` namespace exactly.
- **Open question (owner latitude, not deferred design work):** the exact user-facing copy (hero title/description, homepage card description) is owner-adjustable per the spec; the proposed defaults above are grounded in codebase convention, and no design decision depends on the exact strings.
