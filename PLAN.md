# Pokemon Website — Implementation Plan

A Pokemon website built to hard-test the WordPress Interactivity API outside of WordPress.

## Tech Stack

| Concern                | Choice                                                                     |
| ---------------------- | -------------------------------------------------------------------------- |
| Runtime                | Node 22 (via nvm)                                                          |
| Backend                | Hono + `@hono/node-server`                                                 |
| API layer              | Hono RPC                                                                   |
| Templates              | Hono `html` helper (`hono/html`) — tagged template literals                |
| Frontend interactivity | `@wordpress/interactivity` (no WordPress)                                  |
| Styles                 | Tailwind CSS CLI **v4** (`@import "tailwindcss"`, no `tailwind.config.js`) |
| JS bundler             | esbuild — ESM + code splitting, one entry per page                         |
| Database               | PostgreSQL (Docker for local dev)                                          |
| ORM                    | Drizzle ORM                                                                |
| Auth                   | Better Auth (deferred)                                                     |
| Package manager        | npm                                                                        |
| Hosting                | Hetzner + Coolify                                                          |

## Local Dev

```bash
nvm use                  # Node 22
npm run docker:up        # start Postgres in Docker
npm run db:migrate       # apply migrations
npm run db:seed          # seed from PokéAPI
npm run dev              # server + tsx watch on http://localhost:3000
# in separate terminals:
npm run build:js:watch   # esbuild watch
npm run build:css:watch  # Tailwind watch
```

## Key Decisions

- **Tailwind v4**: uses `@import "tailwindcss"` in CSS, no `tailwind.config.js`
- **Migrations**: excluded from Git during schema design phase. Before first deploy: delete all migration files, run `db:generate` once for a clean `0000_initial_schema.sql`, then untrack `src/db/migrations` from `.gitignore`
- **Scope**: starting with one page (Pokemon index/search) + Layout component. Other pages added incrementally
- **No auth yet**: Better Auth and teams features deferred until core pages are built
- **Moves seeded, items not seeded**: moves are seeded via PokéAPI for all Pokemon. Items are a large dataset not needed until the damage calculator is built
- **Interactivity API boundary**: stores in `src/interactivity/` must never import from `src/db/` or `src/api/` runtime modules. Client imports `AppType` type only from Hono RPC
- **No JSX**: Switched from Hono JSX to Hono's `html` tagged template helper. The Interactivity API only needs plain HTML with `data-wp-*` directives — JSX's component model and type system add no value here (Hono types all HTML attributes as `any`). The `html` helper auto-escapes, composes via nested tags, and requires no tsconfig JSX config.

## Project Structure

```
src/
  server.ts              ← Hono app entry
  env.ts                 ← Zod env validation (TODO: implement)
  middleware.ts          ← logger, secureHeaders, static files (TODO: implement)
  db/
    client.ts            ← Drizzle pg.Pool singleton
    schema/              ← One file per entity, all exported from index.ts
    migrations/          ← Gitignored during design phase
  routes/
    index.ts             ← GET / → Pokemon search page
  api/
    index.ts             ← Aggregates routers, exports AppType (TODO)
    pokemon.ts           ← GET /api/pokemon, /api/pokemon/:id (TODO)
  pages/
    IndexPage.ts         ← Pokemon search page (TODO)
  components/
    Layout.ts            ← HTML shell (TODO)
    Nav.ts               ← Navigation (TODO)
  interactivity/
    index-store.ts       ← @wordpress/interactivity store for index page (TODO)
  styles/
    input.css            ← @import "tailwindcss"
public/
  js/                    ← esbuild output (gitignored)
  css/                   ← Tailwind output (gitignored)
scripts/
  build.ts               ← esbuild config
  seed.ts                ← PokéAPI seed script
docker/
  docker-compose.yml     ← PostgreSQL 16
```

## Database Schema

All tables defined in `src/db/schema/`, exported from `src/db/schema/index.ts`.
Status conditions and field conditions are **code constants** (not DB tables) — see `src/calc/` (TODO).

### `types`

Single table — matchup data stored as jsonb arrays of type IDs on each row. Neutral effectiveness is inferred by absence from the other arrays.

| Column                       | Type        | Notes                               |
| ---------------------------- | ----------- | ----------------------------------- |
| `id`                         | serial      | PK                                  |
| `name`                       | varchar(50) | Unique                              |
| `color`                      | varchar(7)  | Hex color for UI badges             |
| `attack_no_effect`           | jsonb       | Type IDs where this type deals 0x   |
| `attack_not_very_effective`  | jsonb       | Type IDs where this type deals 0.5x |
| `attack_very_effective`      | jsonb       | Type IDs where this type deals 2x   |
| `defense_no_effect`          | jsonb       | Type IDs where this type takes 0x   |
| `defense_not_very_effective` | jsonb       | Type IDs where this type takes 0.5x |
| `defense_very_effective`     | jsonb       | Type IDs where this type takes 2x   |

### `abilities`

| Column   | Type         | Notes                      |
| -------- | ------------ | -------------------------- |
| `id`     | serial       | PK                         |
| `name`   | varchar(100) | Unique                     |
| `effect` | text         | Human-readable description |

### `natures`

| Column           | Type        | Notes                                                         |
| ---------------- | ----------- | ------------------------------------------------------------- |
| `id`             | serial      | PK                                                            |
| `name`           | varchar(50) | Unique                                                        |
| `increased_stat` | enum        | hp / attack / defense / sp_attack / sp_defense / speed / none |
| `decreased_stat` | enum        | Same as above                                                 |

### `moves`

| Column          | Type         | Notes                                                                      |
| --------------- | ------------ | -------------------------------------------------------------------------- |
| `id`            | serial       | PK                                                                         |
| `name`          | varchar(100) | Unique                                                                     |
| `power`         | smallint     | Nullable (status moves have no power)                                      |
| `accuracy`      | smallint     | Nullable (e.g. Swift never misses)                                         |
| `pp`            | smallint     | Power points                                                               |
| `priority`      | smallint     | Default 0, range -7 to +5                                                  |
| `effect`        | text         | Human-readable description                                                 |
| `effect_chance` | smallint     | Nullable, % chance of secondary effect                                     |
| `type_id`       | integer      | FK → types                                                                 |
| `damage_class`  | enum         | physical / special / status                                                |
| `target`        | varchar      | PokéAPI target string, mapped in app logic                                 |
| `min_hits`      | smallint     | Nullable (null = single hit)                                               |
| `max_hits`      | smallint     | Nullable                                                                   |
| `flags`         | jsonb        | Array of flags: contact, sound, punch, bite, slicing, bullet, wind, powder |

### `items`

Competitive items only (no Poké Balls, key items, etc.).

| Column      | Type         | Notes                                                                                             |
| ----------- | ------------ | ------------------------------------------------------------------------------------------------- |
| `id`        | serial       | PK                                                                                                |
| `name`      | varchar(100) | Unique                                                                                            |
| `image_url` | varchar(500) | Nullable, single sprite                                                                           |
| `category`  | varchar      | Rough grouping for UI filtering (choice, berry, stat_boost, type_boost, gem, mega_stone, utility) |
| `effect`    | text         | Human-readable description                                                                        |
| `meta`      | jsonb        | Structured data for damage calc: multipliers, conditions, etc.                                    |

### `pokemon`

| Column       | Type         | Notes                                  |
| ------------ | ------------ | -------------------------------------- |
| `id`         | serial       | PK                                     |
| `dex_number` | integer      | Unique, national Pokédex number        |
| `name`       | varchar(100) | Unique                                 |
| `images`     | jsonb        | `{ artwork, front, back, shiny, ... }` |
| `hp`         | smallint     | Base stat                              |
| `attack`     | smallint     | Base stat                              |
| `defense`    | smallint     | Base stat                              |
| `sp_attack`  | smallint     | Base stat                              |
| `sp_defense` | smallint     | Base stat                              |
| `speed`      | smallint     | Base stat                              |
| `weight`     | numeric      | In hectograms (PokéAPI format)         |
| `height`     | numeric      | In decimeters (PokéAPI format)         |

### Junction tables

| Table               | Columns                                                                | Notes                                             |
| ------------------- | ---------------------------------------------------------------------- | ------------------------------------------------- |
| `pokemon_types`     | pokemon_id (FK), type_id (FK), slot (smallint)                         | Composite PK. Slot = primary (1) or secondary (2) |
| `pokemon_abilities` | pokemon_id (FK), ability_id (FK), is_hidden (boolean), slot (smallint) | Composite PK                                      |
| `pokemon_moves`     | pokemon_id (FK), move_id (FK)                                          | Composite PK. New table                           |

### Not in DB (code constants)

- **Status conditions** (burn, paralysis, poison, sleep, freeze, badly poisoned, confusion) — defined in `src/calc/status-conditions.ts` with mechanical effects (multipliers, etc.)
- **Field conditions** (weather, terrain, screens, hazards, Tailwind, Trick Room) — defined in `src/calc/field-conditions.ts` with categories and mechanical effects

---

## Phases

### ✅ Phase 0 — Repository Scaffolding

| Task | Description                                 | Status  |
| ---- | ------------------------------------------- | ------- |
| 0.1  | `package.json`, `.nvmrc`, `.gitignore`      | ✅ Done |
| 0.2  | `tsconfig.json` (ESNext, bundler)            | ✅ Done |
| 0.3  | `src/` directory skeleton                   | ✅ Done |
| 0.4  | esbuild config (`scripts/build.ts`)         | ✅ Done |
| 0.5  | Tailwind CSS CLI v4 config                  | ✅ Done |
| 0.6  | Docker Compose for PostgreSQL               | ✅ Done |
| 0.7  | Hono server bootstrap (`src/server.ts`)     | ✅ Done |

### ✅ Phase 1 — Database Foundation

| Task | Description                                                                                                                            | Status                    |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 1.1  | Drizzle ORM setup (`src/db/client.ts`, `drizzle.config.ts`)                                                                            | ✅ Done                   |
| 1.2  | Schema: `types` (single table with matchup jsonb arrays + color)                                                                       | ✅ Done                   |
| 1.3  | Schema: `abilities` (id, name, effect)                                                                                                 | ✅ Done                   |
| 1.4  | Schema: `natures` (id, name, increased_stat, decreased_stat)                                                                           | ✅ Done                   |
| 1.5  | Schema: `moves` (power, accuracy, pp, priority, effect, effect_chance, type_id, damage_class, target, min_hits, max_hits, flags jsonb) | ✅ Done                   |
| 1.6  | Schema: `items` (name, image_url, category, effect, meta jsonb) — competitive items only                                               | ✅ Done                   |
| 1.7  | Schema: `pokemon` (dex_number, name, images jsonb, 6 base stats, weight, height)                                                       | ✅ Done                   |
| 1.8  | Schema: `pokemon_types` (pokemon_id, type_id, slot)                                                                                    | ✅ Done                   |
| 1.9  | Schema: `pokemon_abilities` (pokemon_id, ability_id, is_hidden, slot)                                                                  | ✅ Done                   |
| 1.10 | Schema: `pokemon_moves` (pokemon_id, move_id) — new junction table                                                                     | ✅ Done                   |
| 1.11 | Remove `type_matchups`, `status_conditions`, `field_conditions` schema files + old migrations                                          | ✅ Done                   |
| 1.12 | Seed script via PokéAPI (types with matchups, abilities, natures, moves, all Pokemon + types/abilities/moves)                          | ✅ Done                   |
| 1.13 | Schema: Better Auth tables                                                                                                             | ⏸ Deferred (no auth yet)  |
| 1.14 | Schema: `teams` + `team_members`                                                                                                       | ⏸ Deferred (no teams yet) |

### 🔄 Phase 2 — Server Infrastructure

| Task | Description                                                                           | Status     |
| ---- | ------------------------------------------------------------------------------------- | ---------- |
| 2.1  | Hono middleware (logger, secureHeaders, static files, error handler)                  | ✅ Done    |
| 2.2  | Better Auth setup + session middleware                                                | ⏸ Deferred |
| 2.3  | Hono RPC: Pokemon API (`GET /api/pokemon/:id`) — minimal, returns single pokemon     | ✅ Done    |
| 2.4  | Hono RPC: Moves + damage calculator                                                   | ⏸ Deferred |
| 2.5  | Hono RPC: Teams API (auth-guarded)                                                    | ⏸ Deferred |
| 2.6  | `Layout.ts` + `Nav.ts` (html tagged templates)                                       | ✅ Done    |
| 2.7  | Install `@wordpress/interactivity` + wire into esbuild + create basic store           | ✅ Done    |
| 2.8  | Add `@wordpress/interactivity-router` for client-side navigation                     | ⬜ Todo    |

### 🔄 Phase 3 — Pages

| Task | Description                                           | Status     |
| ---- | ----------------------------------------------------- | ---------- |
| 3.1  | Index page — minimal hello-world with iAPI directives  | ✅ Done    |
| 3.2  | Index page — Pokemon search + type filter, full iAPI store | ⬜ Todo |
| 3.3  | Types mini-game                                       | ⏸ Deferred |
| 3.4  | Speed mini-game                                       | ⏸ Deferred |
| 3.5  | Theory crafting (requires auth)                       | ⏸ Deferred |
| 3.6  | Damage calculator                                     | ⏸ Deferred |

### 🔜 Phase 4 — Auth UI

Deferred until auth is needed.

### 🔜 Phase 5 — Build Pipeline & Deployment

| Task | Description                              | Status                          |
| ---- | ---------------------------------------- | ------------------------------- |
| 5.1  | Unified `dev` script with `concurrently` | ⬜ Todo                         |
| 5.2  | Wire all page entry points into esbuild  | ⬜ Todo (1 entry point for now) |
| 5.3  | `src/env.ts` — Zod env validation        | ⬜ Todo                         |
| 5.4  | Multi-stage `Dockerfile`                 | ⬜ Todo                         |
| 5.5  | `docs/deployment.md` — Coolify setup     | ⬜ Todo                         |

### 🔜 Phase 6 — Polish / Stretch Goals

| Task | Description                                                                                         | Status     |
| ---- | --------------------------------------------------------------------------------------------------- | ---------- |
| 6.1  | Analyze whether to download Pokemon sprites/artwork and self-host instead of using GitHub CDN URLs   | ⬜ Todo    |
| 6.2  | Explore automating client-side navigation directives on internal `<a>` tags                          | ⬜ Todo    |
| 6.3  | Review back/forward navigation to the initial page — current workaround prefetches on load, find a proper solution | ⬜ Todo    |

Other stretch goals deferred. See original plan for details.

---

## Next Up

1. Create global pokemons store. Populate the pokemons store with pokemons from the DB/API, reusing the same call in the server and the client.
2. Explore patterns to reuse store getters between client (`store()`) and server (`setServerState()`). Both support getters with the same closure pattern, but sharing the definition cleanly (without duplication or awkward casts) needs a shared abstraction — e.g. a factory, `this`-based getters, or a typed wrapper around `setServerState`.
3. Review how to handle the design.
