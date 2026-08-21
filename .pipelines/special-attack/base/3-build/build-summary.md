# Build Summary: Special Attack Comparison Page

## What

A new `/special-attack` page that mirrors the shipped "Who's Faster?" Speeds page for the Special Attack stat: a hero, a "Learn Special Attack" selector of two section cards, a head-to-head "guess which Pokemon has the higher Special Attack" streak quiz, and a sortable/searchable table of all Pokemon by Special Attack. It is discoverable from the global "Games" navigation ("SPECIAL ATTACK") and a homepage game card ("Special Attack", `Zap` icon).

Files:
- New: `src/pages/special-attack.ts` — SSR page component `SpecialAttackPage()` (hero, selector, head-to-head `QuizSection`, `DataTable`, plus page-local `SpAttackRevealOverlay` / `SpAttackPokemonCard` helpers; insufficient-data early return).
- New: `src/client/stores/pages/special-attack.ts` — client store registered under the distinct Interactivity namespace `pokemon/special-attack` (head-to-head quiz + section-selection logic, count-up reveal incl. reduced-motion path, `getDisplayedSpAttack` reader).
- Modified (additive/mandatory-to-ship): `src/routes/index.ts` (route + page import), `scripts/build.ts` (esbuild entry point), `src/components/Nav.ts` (nav link), `src/pages/home.ts` (homepage card + `Zap` import).

## Why

The site had a per-stat comparison game only for Speed. This adds the equivalent for Special Attack, giving users a dedicated place to learn and test which Pokemon has the higher Special Attack. It relies entirely on data already loaded server-side (`spAttack`), so no new data model, schema, query, or API was introduced.

## How

The design's **clean fork** approach: a new page component and a new client store, reusing the already-generic shared components (`Hero`, `SectionCard`, `QuizSection`, `QuizStatus`, `DataTable`, `PokemonCard`), the shared `pokemon`/`pokemon/data-table` stores, and the `pickTwo`/`defaultQuizContext` utilities unchanged. The Speeds store/page were copied and reduced to the head-to-head game and table, switching the three stat reads from `.speed` to `.spAttack`. The numeric "guess the number" game and the dead "moves-priority" stub were intentionally dropped. The new store registers the distinct namespace `pokemon/special-attack`, matching the page's `data-wp-interactive` wrapper, so the two pages' Interactivity state never merges across client-side navigation. The route reuses the shared page-registration loop (Types + Pokemon loaded server-side; first paint needs no client fetch). Discoverability is one appended nav entry and one appended homepage card.

Verification: the repository has no test runner or e2e harness (and the plan sanctioned adding none), so verification was the two guardrail gates measured as "no new findings vs. the recorded RED baseline" plus a runtime drive-through of all 12 E2E flows against the built, running app (SSR via curl; interactivity via Playwright/Chromium on a seeded Postgres). All flows behaved as specified; existing pages were unchanged; both gates showed no new findings.

## Key decisions

- **Fork the page + store rather than parameterize/generalize.** The substantial logic already lives in shared modules; the genuine stat coupling is three property reads plus copy strings and two page-local helpers, so DRY savings from a factory/abstraction were marginal and would have required editing the shipped `/speeds` surfaces (an observable-regression risk). Rejected: (a) parameterize the Speeds store by a stat key; (b) a generalized "stat comparison page" builder (speculative — Speeds is the sole precedent).
- **Duplicate the reveal animation and page-local helpers** instead of extracting to shared modules, to avoid editing `quiz-utils`/`speeds.ts` (which other pages also load) for marginal gain. Accepted residual R-1 (duplicated `revealAnswer`).
- **Reuse the existing `.speed-*` CSS classes as-is** on the new page (single global bundle, generic tokens, referenced only by these pages). Accepted residual R-2 (a user-invisible `speed`-named-class-on-a-Special-Attack-page naming mismatch).
- **Naming/copy:** URL `/special-attack`; nav label "SPECIAL ATTACK"; hero/card title "Special Attack" (literal, since Special Attack has no natural comparative pun); table column "Special Attack"; homepage icon `Zap`. Copy strings are owner-adjustable defaults.

## Known limitations

- **Pre-existing shared-quiz quirk (out of scope, not introduced here):** the first head-to-head guess made on a quiz page reached by client-side navigation *after* resolving a guess on another quiz page is mis-evaluated (treated as incorrect). This was independently confirmed to reproduce symmetrically on both `/speeds` and `/special-attack` as destinations, so it is inherent to the shared quiz mechanism this feature reuses verbatim — not a regression. It does not merge or corrupt state across namespaces (streaks remain independent). Both pages evaluate correctly on direct load and on client-side navigation when no prior quiz was played.
- **Guardrail baseline is RED and out of scope:** `npm run lint` (12 errors + 4 warnings) and `npx tsc --noEmit` (1 error in `src/utils.ts`) fail on the pre-existing codebase in files this feature never touches; the feature adds zero new findings. Fixing them was explicitly out of scope (Requirement 13).
- **Duplicated reveal logic (R-1)** and **`.speed-*` class naming on the new page (R-2)** are accepted residuals with safe, behavior-preserving follow-up refactors available.
