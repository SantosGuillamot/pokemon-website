# Spec Research: Special Attack Comparison Page

# Special Attack Comparison Page

> Source: `.claude/issues/special-attack.md` (local Markdown issue tracker).
> This file is self-contained; agents do not need to open the source issue.

## Goal

Users can find out which Pokémon has the higher Special Attack stat, through a
dedicated page for comparing Pokémon by their Special Attack — the equivalent of what
the "Who's Faster?" page does for the Speed stat.

## Context

- Model page: the existing "Who's Faster?" experience, implemented on the Speeds page
  (`src/pages/speeds.ts`). Its related issue is `.claude/issues/speeds-table.md`. The
  new page should offer an equivalent experience for Special Attack instead of Speed.

## Assumptions / directions to explore

- Mirror the structure of the Speeds page — hero, section cards, the head-to-head
  "guess which is higher" quiz, and a sortable data table — swapping the Speed stat for
  Special Attack. *(Open — the agents may confirm or revise how much to reuse from the
  existing page versus generalize it.)*

## Q&A

## Research

### R1: Complete observable "Who's Faster?" / Speeds experience

**How the page is reached (routing).** URL path is `/speeds`. Registered as a Hono route in `src/routes/index.ts`: `speeds.js` is imported (line 11) and added to the `pages` array (lines 33-38) as `{ path: "/speeds", title: "Speeds", render: SpeedsPage, scripts: ["/js/stores/pages/speeds.js"] }`. A loop (lines 54-61) registers each page with `app.get(path, ...)`; the handler runs `resetServerState()`, `await loadTypes()`, `await loadPokemons()`, then renders `Layout({ title, scripts, children })`. So every page (except `/team-building`) loads Types + Pokemons server-side before render. Mirroring a page requires four wiring points: (a) `src/pages/<x>.ts` component, (b) a route entry in `src/routes/index.ts`, (c) a client store `src/client/stores/pages/<x>.ts`, (d) that store added to `scripts/build.ts` entryPoints. (These four are how it's built — a design concern; the observable outcome is simply that the page is reachable at a URL with its data loaded server-side.)

**Site navigation.** Speeds is linked from two places: (A) global nav — `src/components/Nav.ts:6-11`, `GAME_LINKS` array entry `{ label: "SPEEDS", href: "/speeds" }`, which renders in both the desktop "GAMES" dropdown and the mobile Games group; (B) homepage — `src/pages/home.ts:22-28`, `GAMES` array entry `{ title: "Who's Faster", description: "Test your speed knowledge! ...", href: "/speeds", icon: Timer }`, rendered as a Card in the homepage "Games" section. Nav labels are uppercase; icons come from `lucide-static` (Speeds uses `Timer`).

**Page shell / section visibility.** Everything is wrapped in `<div data-wp-interactive="pokemon/speeds" data-wp-context='{"currentSection": null}'>` (speeds.ts:92-94). `currentSection` starts null. Every section except Hero and "Learn Speeds" binds `data-wp-bind--hidden="!state.isCurrentSection"` (`isCurrentSection` = `context.currentSection === context.sectionId`, `src/client/stores/section-utils.ts:3-8`). So on load the user sees only the Hero + the three cards; clicking a card reveals exactly one section (tab-like, single-visible).

**Sections and observable behavior:**
- (a) HERO (speeds.ts:84-90) — presentational. Title "Who's Faster?", description about guessing which is faster / ties / one wrong answer ends your streak. Two decorative artwork images (25.png fg, 9.png bg).
- (b) "LEARN SPEEDS" section (speeds.ts:96-117) — always visible. h2 + three `SectionCard` buttons acting as a section selector: "Who's Faster?" (whos-faster), "Guess Speed" (guess-speed), "Speeds Table" (speeds-table). Clicking calls `actions.selectSection` (sets `currentSection`); the active card gets `card-squared-active` styling.
- (c) "WHO'S FASTER?" HEAD-TO-HEAD QUIZ (speeds.ts:119-138; store 169-243) — two Pokémon side by side with "VS"; QuizStatus bar shows "Streak: N". Server seeds two distinct random Pokémon (`pickTwo`). User clicks the one they think is faster (only while `quizState === "waiting"`). Correctness from `correctAnswer` comparing `pokemonA.speed` vs `pokemonB.speed` → `"tie" | 0 | 1`; a tie makes either card correct. Reveal animation shows each speed counting up 0→actual over ~1s (cubic ease-out; `prefers-reduced-motion` jumps to final). Correct → green, `streak += 1`, auto-advance to two new random Pokémon after 1s. Incorrect → red, `finalStreak = streak`, `streak = 0`, shows "GAME OVER" / "Final streak: N" / "Try again" button (`actions.restart`). Endless-run streak game; one wrong answer ends the run.
- (d) "GUESS SPEED" NUMERIC QUIZ (speeds.ts:140-189; store 190-213, 244-258) — FULLY FUNCTIONAL sibling game, not a stub. One Pokémon card + number input (placeholder "Speed?", min 0 max 255) + "Guess" button. Server seeds one random Pokémon. Correct requires EXACT integer match `guess === correctSpeed`. Same reveal animation + streak / GAME OVER / "Try again" mechanics. The run's intent names only the head-to-head quiz + table and does NOT mention this exact-value mode; whether to mirror it is a scope decision for the lead. (Exact-integer guessing of a base stat is punishing — that is the observable design as-is.)
- (e) "SPEEDS TABLE" section (speeds.ts:191-212) — a `DataTable` in its own interactive region `pokemon/data-table`. Columns: sprite (image, alt=name), Name (sortable + searchable), Speed (sortable). Rows = ALL loaded Pokémon → `{ id, sprite: imageUrl, name: capitalized, speed }`. Config: caption "Pokemon sorted by speed", `maxHeight "70vh"`, `searchPlaceholder "Search Pokemon..."`, `searchMode "scroll"`, initial `sortColumn "speed"`, `sortDirection "desc"`. `searchMode: "scroll"` does NOT filter — it keeps all rows and scrolls to + highlights matches.
- (f) "moves-priority" placeholder (speeds.ts:214-222) — CONFIRMED dead/unreachable. Only content is `<p>Table with all moves sorted by priority</p>`; `grep -rn "moves-priority" src` finds only this section — no card or control ever sets `currentSection` to `"moves-priority"`, so a user can never display it. Leftover stub for an unrelated future feature; not part of the observable Speeds experience.

**Data field.** `Pokemon` type (`src/types/pokemons.ts:4`) is inferred from the Drizzle schema `src/db/schema/pokemons.ts`. Stat fields (schema lines 21-26), all `smallint().notNull()`: `hp`, `attack`, `defense`, `spAttack` (DB column `sp_attack`), `spDefense` (`sp_defense`), `speed`. Special Attack already exists as property `spAttack`, a direct peer of `speed`. `/api/pokemons` runs `db.select().from(pokemons)` with no column projection (`src/api/pokemons.ts:49-59`), so full rows including `spAttack` are returned; `loadPokemons` (`src/utils.ts`) stores them under `pokemon.pokemons`, which the page reads (speeds.ts:58-61). So `p.spAttack` is already present in the identical server data — no new API, query, schema, or data-loading work is needed. The current Speeds client store hardcodes `.speed` throughout; a mirrored store swaps those reads to `.spAttack` (a design concern). Existing "SpA" column-label convention: `src/pages/design-system.ts:543` and `src/components/MetaPokemonsSection.ts:48` both use `{ key: "spAttack", label: "SpA", sortable: true }`.

**CSS naming.** Reveal-overlay classes are speed-NAMED but generic in purpose: `.speed-overlay-bg`, `.speed-overlay-correct/-incorrect`, `.speed-correct/-incorrect`, `.speed-pokemon-btn` (`src/styles/input.css:510-570`). Reuse-as-is vs rename is a design/reuse choice.

**Evidence:**
- Speeds page URL is `/speeds`, registered server-side with data preloaded — `src/routes/index.ts:11,33-38,54-61` → route entry + handler loading Types/Pokemons confirmed.
- Speeds is linked in global nav and homepage — `src/components/Nav.ts:6-11`; `src/pages/home.ts:22-28` → `GAME_LINKS` and `GAMES` entries confirmed.
- Page has Hero, a 3-card selector, a head-to-head streak quiz, a numeric exact-guess quiz, a sortable/searchable table, and a dead placeholder — `src/pages/speeds.ts:84-222` + client store `src/client/stores/pages/speeds.ts` → behaviors as described.
- "moves-priority" section is unreachable — `grep -rn "moves-priority" src` → only the section definition itself; no control sets it.
- Special Attack data already exists as `spAttack` in the same server data — `src/db/schema/pokemons.ts:21-26`, `src/types/pokemons.ts:4`, `src/api/pokemons.ts:49-59` → `spAttack smallint notNull`, returned unprojected, read from `state.pokemon.pokemons`.
- "SpA" is the established column label for Special Attack — `src/pages/design-system.ts:543`, `src/components/MetaPokemonsSection.ts:48` → `label: "SpA"`.

### R2: Precedent for stat-comparison game pages + Special Attack naming

**Other per-stat game pages? No — Speeds is the sole precedent.** The `pages` array in `src/routes/index.ts` (lines 25-52) plus the separate `/team-building` handler register: `/` (Home), `/types` (Learn Types, implemented), `/speeds` (Who's Faster?, implemented — the only per-stat comparison game), `/roles` (static placeholder), `/will-it-ko` (static placeholder), `/damage-calculator` (tool), `/design-system` (dev-only, not in nav/home), `/team-building` (tool). `GAME_LINKS` (Nav.ts:6-11) = TYPES, SPEEDS, ROLES, WILL IT KO?. Homepage `GAMES` (home.ts:14-43) = "Learn Types", "Who's Faster", "Roles", "Will It KO?". Speeds is the only page that compares two Pokémon by a single numeric stat. `/roles` mentions "Attack vs Special Attack" but is a different game shape (classifies one Pokémon's own stat lean, not a two-Pokémon comparison) and is a non-interactive placeholder. There is no existing generalized "per-stat game" abstraction.

**Authoritative doc/roadmap for a Special Attack page? Essentially none beyond the issue.** Issues live in the MAIN repo `.claude/issues/` (not in the worktree). `special-attack.md` is a near-verbatim copy of `intent.md`; it does NOT specify a page name, URL, nav label, or card title, names the sub-games as "hero, section cards, head-to-head quiz, sortable table" (no numeric-guess mode), and marks reuse-vs-generalize as OPEN. `speeds-table.md` (scoped to the table) says to show "sprite, name, dex number, and speed" but the SHIPPED table omits dex number (shows sprite, name, speed only) — so dex-number inclusion is an open call; its out-of-scope list = type filtering, pagination, row-click navigation. `CONTENT.md` (worktree root) enumerates the product feature set (Homepage, Who's Faster, KO or Not, Learn Types, Roles, Damage Calculator, Team Building) and does NOT list a Special Attack page — so this page is a new addition beyond the original content spec; CONTENT.md:16-24 confirms the Who's Faster spec (two Pokémon, guess faster or equal, streak-based, one wrong ends the run). `PLAN.md`/`DESIGN_PLAN.md` have no Special Attack roadmap entry and no per-stat generalization concept. => Page name, URL, nav label, homepage card title, and whether to include the numeric-guess sub-game are all the lead's to choose; the only firm guidance is "mirror Speeds: hero + section cards + head-to-head quiz + sortable table."

**User-facing naming for Special Attack.** Two established conventions: abbreviated column label "SpA" (design-system.ts:539-544 and MetaPokemonsSection.ts:45-49, whose full set is HP/Atk/Def/SpA/SpD/Speed), and prose "Special Attack" (roles.ts:30 "Attack vs Special Attack"; CONTENT.md:65). No "Sp. Atk" style anywhere. The shipped Speeds table labels its stat column with the full word "Speed" (speeds.ts:200), while multi-stat tables abbreviate — so a mirror-exact SpA column reads "Special Attack" while cross-table consistency reads "SpA"; both have precedent. Naming pattern from Speeds: nav label = stat word uppercase ("SPEEDS"); hero title + homepage card = a catchy question ("Who's Faster?"). Special Attack has no obvious single-word comparative, so any "Who's ___?" phrasing must be coined (researcher's suggestions "Who Hits Harder?" / "Who's Stronger?" are unverified and risk conflating with physical Attack); a literal "Special Attack" title with a "guess which has the higher Special Attack" description is fully consistent with the prose convention.

**Evidence:**
- Speeds is the only implemented per-stat comparison page — `src/routes/index.ts:25-52`, `src/components/Nav.ts:6-11`, `src/pages/home.ts:14-43`, plus `/roles` and `/will-it-ko` confirmed as static placeholders → no Attack/Defense/HP/SpAtk comparison page exists.
- No authoritative doc names the Special Attack page or its scope — `.claude/issues/special-attack.md`, `.claude/issues/speeds-table.md`, `CONTENT.md`, `PLAN.md`, `DESIGN_PLAN.md` → none specify name/URL/label; CONTENT.md omits a Special Attack page entirely.
- speeds-table issue diverges from shipped table on dex number — `.claude/issues/speeds-table.md:9` says include dex number; `src/pages/speeds.ts:196-201` shipped table omits it.
- Special Attack naming conventions are "SpA" (abbrev) and "Special Attack" (prose) — `src/pages/design-system.ts:539-544`, `src/components/MetaPokemonsSection.ts:45-49`, `src/pages/roles.ts:30`, `CONTENT.md:65`.

## Out of Scope

Each exclusion below is an observable-outcome boundary confirmed during clarification.

1. **The numeric exact-value "guess the Special Attack" quiz** (the model page's "Guess Speed" mode). The intent's goal is narrowly to let users "find out which Pokémon has the higher Special Attack," and its directions enumerate only hero + section cards + head-to-head quiz + sortable table — not the exact-value guess. The intent explicitly delegated reuse-vs-generalize scope to the agents. Excluded to keep the page aligned with the stated goal; a reversible decision a reviewer/owner can revisit. (R1 3d, R2 authoritative-doc)
2. **The dead "moves-priority" placeholder section** from the model page — it is unreachable and not part of the observable Speeds experience. (R1 3f)
3. **A dex-number column in the data table** — the page mirrors the SHIPPED Speeds table (sprite, name, stat only). The `speeds-table.md` issue mentioned dex number but the implemented model omits it. (R1 3e, R2 authoritative-doc)
4. **Data table type-filtering, pagination, and row-click navigation** — carried over as exclusions from the model table's own scope. (R2 authoritative-doc)
5. **Any change to the observable behavior of existing pages** (the Speeds/"Who's Faster?" page, homepage games, nav) beyond adding the new page's own navigation entry and homepage card. Whether shared components are reused or generalized is a design-phase decision; the requirement is only that existing pages stay observably unchanged. (R1 shell, R2 precedent)
6. **New data model / schema / API work** — Special Attack (`spAttack`) already exists in the same server data the page will consume; no backend change is needed. (R1 data)

## Consolidated Requirements

Each requirement is an observable outcome. Concrete copy strings (page name, labels, titles) are the lead's proposed defaults grounded in the codebase's naming conventions; exact marketing wording is owner-adjustable and not itself load-bearing.

1. A new page dedicated to comparing Pokémon by their Special Attack stat is reachable at its own URL (proposed path `/special-attack`) and renders with Pokémon data available on first load (data provided server-side, as with the model page). (R1: routing; R2)
2. The page is discoverable from the same places the model page is: it appears as an entry in the site's global "Games" navigation (proposed label "SPECIAL ATTACK") and as a game card on the homepage, each linking to the page. (R1: navigation; R2)
3. The page opens with a hero that introduces the Special Attack comparison — a title identifying the page as a Special Attack comparison plus a short descriptive line — mirroring the model page's hero. (R1: hero)
4. The page presents a section-selector ("Learn Special Attack") of cards that reveal one section at a time; on load only the hero and the selector cards are visible, and choosing a card reveals exactly that section. (R1: shell + Learn section)
5. Head-to-head quiz — two distinct, randomly chosen Pokémon are shown side by side and the user selects the one they believe has the higher Special Attack. (R1 3c; CONTENT.md)
6. On selection, each shown Pokémon's Special Attack value is revealed with an animated count-up to its actual value; when the user prefers reduced motion, the final value is shown immediately without animation. (R1 3c)
7. A correct selection increases the current streak and advances to a fresh random pair; an incorrect selection ends the run, displays a game-over state showing the final streak, and offers a way to restart the run. (R1 3c)
8. When the two Pokémon have equal Special Attack, selecting either is accepted as correct. (R1 3c; CONTENT.md)
9. The current streak is visible while the head-to-head quiz is being played. (R1 3c)
10. Data-table section — a sortable, searchable table lists all loaded Pokémon with, at minimum, sprite, name, and Special Attack value; it is sorted by Special Attack descending by default; the user can sort by name or by Special Attack; searching scrolls to and highlights matching rows rather than filtering others out. (R1 3e; R2)
11. Every Special Attack value shown (quiz and table) is the Pokémon's `spAttack` value from the existing server data; no new data source, query, or schema is introduced. (R1: data; R2)
12. Edge case — if fewer than two Pokémon are available, the page shows a graceful "not enough Pokémon" message in place of the quiz rather than erroring, mirroring the model page. (R1: shell)
13. The observable behavior of all existing pages (the "Who's Faster?"/Speeds page, other games, the homepage, and navigation) is unchanged apart from the added navigation entry and homepage card for the new page. (Out of Scope 5)
