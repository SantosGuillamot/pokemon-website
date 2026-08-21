# Design Plan — Pokemon Website

A design system plan to keep visual consistency across the site. Each section is a decision area to resolve before (or during) implementation. Decisions go inline; once resolved, mark the section ✅.

## Resolved Tooling Decisions

Decisions made based on the tech stack (Hono `html` tagged templates, WordPress Interactivity API, esbuild, Tailwind CSS v4). These are settled — the remaining open items in each section are design/creative decisions.

| Area | Decision | Reasoning |
| --- | --- | --- |
| CSS methodology | Tailwind CSS v4 with `@theme` tokens + `@apply` component classes for repeated patterns | Already integrated; best fit for `html` template literals |
| Design tokens | Defined in `@theme` block in `input.css` (generates CSS custom properties + utility classes) | Single source of truth, no extra tooling |
| Component architecture | Typed TS functions returning `html` tagged template literals, variant maps for multi-variant components | Already the project pattern |
| Icons | Lucide via `lucide-static` (inline SVGs in template functions) | 1500+ icons, framework-agnostic, zero client JS |
| Font loading | Self-hosted woff2 files + `font-display: swap` + `<link rel="preload">` for critical fonts | No third-party dependency, GDPR-safe, fastest |
| Font format | woff2 only (97%+ browser support, no woff fallback needed) | Modern browsers only |
| Animations | CSS transitions + `@keyframes` only, no JS animation library | SSR context; CSS handles all planned interactions |
| Reduced motion | Global `prefers-reduced-motion` media query reset + Tailwind `motion-reduce:` variant | Blanket compliance |
| Contrast target | WCAG AA (4.5:1 normal text, 3:1 large text) | Design plan best practice |
| Pokemon type colors | Hardcoded bg + text color pairs in `@theme` (not dynamic from DB) | Works on both server and client, enables Tailwind variants |
| Image hosting | Self-hosted static files in `public/images/` committed to the repo | No external dependency on GitHub/PokeAPI URLs; ~500MB one-time addition, images won't change; served by Hono static middleware from Hetzner VPS at zero extra cost |
| Dark mode | ⏸ Deferred | Not needed now; semantic token names keep the door open |
| Dev component gallery | `/design-system` dev-only route rendering all components with variants | Storybook incompatible with this architecture |

## Priority Order

Suggested order to resolve these decisions:

1. **Brand Identity & Tone** — everything else flows from this.
2. **Color Palette** — needed before any visual work.
3. **Typography** — needed before any visual work.
4. **Layout System** — structural foundation.
5. **Generic Elements & Components** — headings, text, links, buttons, cards, forms.
6. **Project-Specific Components** — Pokemon cards, type badges, filters.
7. **Logo** — can iterate while building.
8. **Navigation Header** — needs logo + colors + typography decided first.
9. **Footer** — low priority, simple.
10. **Icons, Images, Motion, Misc** — resolve as needed during build.

---

## Best Practices

Rules to follow across all design decisions. Not open questions — just "always do this."

- All color pairings must meet **WCAG AA contrast** minimums (4.5:1 for normal text, 3:1 for large text).
- Type badge backgrounds need **dark or light text** depending on the type color brightness. Don't assume white text works on all types.
- Selected/active states must not rely on **color alone** — always pair with a shape, icon, or border change for color-blind users.
- Respect **`prefers-reduced-motion`** — all animations and transitions must be suppressible.
- All images need **meaningful alt text** (e.g., "Official artwork of Pikachu"), not empty or generic.
- Use **semantic HTML landmarks** (`<main>`, `<nav>`, `<header>`, `<footer>`) and logical heading hierarchy (single `<h1>` per page).
- Set explicit **`width` and `height`** on images to prevent layout shift.
- **Font loading** must avoid invisible text (FOIT) — use `font-display: swap` or `optional`.
- When designing components or pages that fetch data or can have no results, **consider loading, empty, and error states** — not everything needs them, but don't forget them where they apply.

---

## 1. Brand Identity & Tone ✅

Personal / for-fun project — no commercial goals. The primary user is the author; the site should be something *you* enjoy using.

- [x] **Tone**: Playful and competitive. Light personality with retro charm — evokes the feel of the original Pokemon games (Game Boy era) through typography and details, while keeping the layout clean and usable.
- [x] **Target audience**: The author, casual Pokemon fans, and competitive players.
- [x] **Visual mood** (5 adjectives):
  1. **Retro** — pixel-font headings, monospaced body, nods to Game Boy-era Pokemon.
  2. **Clean** — minimal UI, whitespace-forward, no clutter despite the retro flavor.
  3. **Playful** — light personality, fun without being childish.
  4. **Nostalgic** — typography and details recall early Pokemon games.
  5. **Functional** — data-heavy pages (damage calc, tables) stay scannable, not decorative.
- [x] **Visual principle**: The site blends retro personality (pixel fonts, monospaced text) with a clean, spacious layout. The Pokemon content (type colors, artwork) provides the vibrancy. The UI evokes nostalgia while staying usable.
- [x] **Reference sites**:
  - [frontity.org](https://frontity.org/) — clean, professional, generous whitespace, blue accent on neutral base.
  - [hajster.com](https://hajster.com/en) — minimal, warm, approachable, image-driven.
  - [capeq.com](https://capeq.com/) — restrained, high contrast, structured sections.
  - [iamrob.in](https://iamrob.in/) — personal, refined, thoughtful use of accent color.
  - [ysabella.me](https://www.ysabella.me/) — playful, vibrant, creative details on a clean base.
  - [Dribbble: Customer Table SaaS](https://dribbble.com/shots/23946207-Customer-Table-SaaS) — functional, polished, scannable data table.

---

## 2. Logo ✅

- [x] **Style direction**: Icon only (for now). May add a wordmark later.
- [x] **Relationship to Pokemon branding**: Fully custom — an animal, not a Pokemon.
- [x] **Variants**: Single icon used for nav and favicon. Add more variants if needed later.
- [x] **File formats**: SVG only. No PNG fallbacks needed (97%+ browser support).
- [x] **Location**: `public/icons/logo.svg` (6.9 KB).

---

## 3. Color Palette ✅

- [x] **Primary color**: Yellow `#FFDE00`. Small accents only (hover, focus rings, indicators). Never as text on white — use on dark backgrounds or as a background fill.
- [x] **Secondary color**: Red `#C41425`. CTAs, links, important highlights. Passes AA for normal text on white (~4.6:1).
- [x] **Neutral scale**: Black `#111111` (primary text, headings — softened from pure black), White `#FFFFFF` (page background), Fog `#EEEEEE` (subtle background sections, card fills), Darker-gray `#666666` (secondary text, borders, disabled states — ~5.7:1 on white). Opacities of base colors will be used for additional shades (hover states, lighter tints, subtle borders) instead of a full gray scale.
- [x] **Semantic colors**: Success `#15803D` (~4.6:1 on white). Error shares the brand red `#C41425` — context (alert patterns vs UI accents) distinguishes meaning; revisit if ambiguity arises. Warning and info deferred until needed.
- [x] **Pokemon type colors**: Rely on the DB values (`types.color`) as-is. Revisit if they clash with the palette.
- [x] **Contrast target**: AA (4.5:1). ✅ Resolved in tooling decisions.
- [x] **Dark mode**: ⏸ Deferred. Using semantic token names (`--color-surface`, not `--color-gray-950`) so it can be added later.

---

## 4. Typography ✅

- [x] **Font families**:
  - **Display heading (H1)**: DotGothic16 — pixel/dot-matrix Gothic font. Evokes Game Boy-era Pokemon. Used for H1 display text only.
  - **Heading (H2–H4)**: Space Mono — monospaced font. Reinforces the retro/terminal aesthetic for section and subsection headings.
  - **Body**: Karla — humanist sans-serif. Clean and readable for paragraphs and UI text.
  - All three available on Google Fonts (SIL Open Font License).
- [x] **Font source**: Self-hosted woff2 files in `public/fonts/`. ✅ Resolved in tooling decisions.
- [x] **Font format**: `woff2` only. ✅ Resolved in tooling decisions.
- [x] **Font weights needed**:
  - DotGothic16: 400 (only available weight).
  - Space Mono: 400 (UI text, tables), 700 (headings H2–H4, bold emphasis, labels).
  - Karla: 400 (body text), 700 (bold emphasis).
  - 4 woff2 files self-hosted: DotGothic16-400, SpaceMono-400, SpaceMono-700, Karla-400.
- [x] **Base font size**: `16px`.
- [x] **Type scale**: Custom values (defined per element in the Element Styles section).

---

## 5. Layout System ✅

- [x] **Max content width**: `1200px` (`75rem`). Enough room for the type chart and damage calculator side-by-side layout without feeling stretched on simpler pages.
- [x] **Spacing unit**: 4px grid (Tailwind v4 default `--spacing: 0.25rem`). ✅ Resolved in tooling decisions.
- [x] **Default page padding** (horizontal gutters): `24px` at all breakpoints. Monospaced body font needs a bit more breathing room.
- [x] **Section spacing**: `64px` desktop (`lg`+), `48px` mobile. Keeps the spacious feel without disconnecting sections.
- [x] **Breakpoints**: Tailwind v4 defaults unless overridden. ✅ Resolved in tooling decisions.
  | Name     | Min-width | Notes              |
  | -------- | --------- | ------------------ |
  | `sm`     | 640px     |                    |
  | `md`     | 768px     |                    |
  | `lg`     | 1024px    |                    |
  | `xl`     | 1280px    |                    |
  | `2xl`    | 1536px    | Decide if needed   |
- [x] **Grid system**: Tailwind's CSS Grid + Flexbox utilities. ✅ Resolved in tooling decisions.

---

## 6. Generic Elements & Components

Reusable building blocks common to any website.

### Headings ✅

- [x] **Shared**: `font-weight: bold`, `0.1em` letter-spacing, `--color-black`.
- [x] **H1**: `3rem/4.5rem`, `mb: 1.5rem`. Responsive: `2rem/2.5rem` below `sm`.
- [x] **H2**: `2rem/2.5rem`, `mb: 1rem`. Responsive: `1.5rem/2rem` below `sm`.
- [x] **H3**: `1.5rem/2rem`, `mb: 0.75rem`. No responsive override.
- [x] **H4**: `1rem/1.25rem`, `mb: 0.5rem`, uppercase. Used for labels/subsections.
- [x] **Heading fonts**: DotGothic16 for H1, Space Mono bold for H2–H4. Body uses Karla.

### Body Text ✅

- [x] **Paragraph**: Three sizes — Large (`1.25rem/2rem`), Regular (`1rem/1.5rem`), Small (`0.875rem/1.25rem`). All Space Mono. Color inherits `--color-black`. Tokens defined in `@theme` as `--text-paragraph-lg`, `--text-paragraph`, `--text-paragraph-sm` with paired `--line-height` suffixes.
- [x] **Bold/emphasis**: Standard `<strong>` (700) and `<em>` (italic). No special color treatment.

### Links ✅

- [x] **Default link style**: `a.link` component class — `--color-secondary` red, underline with `2px` offset, `color-mix()` darken on hover.
- [x] **Visited state**: No distinct visited style — same as default.
- [x] **Nav links vs inline links**: Different treatment. Nav links are plain text with `transition-colors`; inline links use the `.link` class with underline + color.
- [x] **Focus-visible style**: `2px solid --color-secondary` outline with `2px` offset and `2px` border-radius. Applied consistently to links, buttons, and text buttons.

### Buttons ✅

- [x] **Shared base** (`.btn`): `inline-flex`, centered, DotGothic16 heading font, `12px 16px` padding, `1px solid --color-black` border, `3px 3px 0` box-shadow. Pokeball SVG icon via `::before` pseudo-element with 360° spin on hover. Active state: `translateY(2px)` with reduced shadow. Disabled: `not-allowed` cursor, `0.6` opacity, muted background.
- [x] **Primary** (`.btn-primary`): `--color-primary` yellow background, `--color-black` text. Hover reduces opacity to 0.8 via relative color syntax.
- [x] **Secondary** (`.btn-secondary`): Transparent background, `--color-black` border/text. Hover adds subtle `--color-fog` background at 0.3 opacity.
- [x] **Text** (`.btn-text`): Standalone component (not extending `.btn`). `--color-secondary` red text, no border/shadow. Pokeball icon via `mask-image` inheriting `currentColor`. Animated underline on hover (0% → 100% `background-size`). Active: `translateY(2px)`. Focus-visible matches link style.
- [x] **Sizes**: One size only. Revisit if needed.
- [x] **Icon buttons**: Not needed yet. Revisit during component build.

### Card ✅

Generic card component (`Card.ts`) used as a base for all card-like elements.

- [x] **Shared style** (`.card-squared`): `max-width: 30rem`, `1.5rem 2rem` padding, white background, `1px solid --color-black` border, `--shadow-card` (`4px 4px 0`).
- [x] **Variants**: Static (info display) vs interactive (linked via `<a>`). Interactive cards: hover `translateY(-2px)` + subtle fog background, active `translateY(2px)` + `--shadow-card-pressed`. Focus-visible: `2px solid --color-secondary`.
- [x] **Icon slot** (`.card-icon`): `3.5rem` square, `--color-primary` at 0.8 opacity background, `12px` border-radius. SVG icon `1.5rem` in `--color-black`.

### Section / Container ✅

Reusable wrappers that provide consistent structure and visual rhythm across all pages.

- [x] **Container**: `Section.ts` component — `px-6` horizontal padding, `py-12` vertical padding. Inner `div` constrained to `max-w-content` (`--container-content: 75rem`) and centered. Accepts a `class` prop for per-instance overrides.
- [x] **Section backgrounds**: Controlled via the `class` prop (e.g., passing a background utility). Default is transparent (inherits page background).
- [x] **Section separators**: Spacing only — no borders or decorative dividers between sections. May add new variants in the future.

### Hero ✅

Full-width banner at the top of each page (`Hero.ts`). Distinct from regular sections — diagonal clip-path, layered background, and overlapping image composition.

- [x] **Layout**: Two-column on `md`+ (text left, image right), stacked on mobile. Inner container constrained to `max-w-content`, centered. Props: `title` (H1), `description` (large paragraph in `--color-darker-gray`), `image` (foreground), optional `imageBg` (background), optional `children` (e.g., CTA buttons).
- [x] **Background**: Three layers via `isolation: isolate`. Base (`.hero::before`, z-index -2): solid white with diagonal clip `polygon(0 0, 100% 0, 100% 80%, 0 100%)`. Accent (`.hero::after`, z-index -1): `--color-primary` at 0.8 opacity filling the bottom wedge. Outer `.hero`: clips everything at `polygon(0 0, 100% 0, 100% 92%, 0 100%)`.
- [x] **Image composition** (`.hero-image-stack`): Relative container, `16rem` square (mobile) / `26rem` square (`md`+). Foreground image offset `translate(-4rem, 4.5rem)` at z-index 1. Optional background image offset `translate(5rem, 1.5rem)` at z-index 0. Both absolutely positioned, `object-fit: contain`. Container has `margin-bottom: -5rem` to overlap the next section.

### Tables

- [ ] **Header style**: Background, font weight, border, sticky header for long tables?
- [ ] **Row style**: Striped or plain? Hover highlight?
- [ ] **Cell padding**: Consistent or compact variant for dense data?
- [ ] **Responsive behavior**: Horizontal scroll, stacked layout on mobile, or hide less important columns?

### Form Elements

- [ ] **Text input**: Border, padding, border-radius, focus ring style.
- [ ] **Select / dropdown**: Native or custom styled?
- [ ] **Search bar**: Special treatment (icon inside, rounded)?
- [ ] **Checkbox / toggle**: Style, size, checked state.

---

## 7. Project-Specific Components

Components unique to this Pokemon website. Built on top of the generic elements above.

### Pokemon Card

The main repeating element on the index page.

- [ ] **Layout**: Image on top, info below? Horizontal?
- [ ] **Content**: Name, dex number, types, image. Anything else?
- [ ] **Type badges**: Use the type color as background? Pill shape?
- [ ] **Hover/interaction**: Scale, shadow, border glow?
- [ ] **Size**: Fixed width or fluid within grid?
- [ ] **Responsive behavior**: Cards per row at each breakpoint?

### Type Badge / Pill

- [ ] **Shape and size**: Pill, rounded rect? Text style?
- [ ] **Color mapping**: Both bg and text colors hardcoded per type in `@theme` (e.g., `--color-type-fire-bg`, `--color-type-fire-text`). ✅ Color approach resolved in tooling decisions.
- [ ] **Dual-type rendering**: Two separate pills, a split pill, primary-dominant with smaller secondary? This pattern appears in cards, detail views, and anywhere types are displayed.

### Stat Badge

- [ ] **Base stats display**: Shape, size, color coding?

### Damage Class Badge

- [ ] **Physical / Special / Status indicators**: Icon, color, shape?

### Other Project Cards

- [ ] **Specific cards needed**: Move cards? Ability cards? Type matchup cards?

### Filter Chips

- [ ] **Type filtering**: Pill buttons? Checkboxes? Use type colors?

---

## 8. Navigation Header ✅

- [x] **Position**: Fixed (`fixed top-0 left-0 right-0 z-50`). Page content needs top padding to compensate.
- [x] **Height**: `80px` at all breakpoints.
- [x] **Background**: Solid `--color-primary` yellow (`#FFDE00`). All text and icons use `--color-black` (`#111111`). Soft box-shadow using `--color-black` at low opacity.
- [x] **Layout (desktop)**:
  - **Left**: Logo (`logo.svg`, 40px) + "POKEMON" text. Space Mono bold, uppercase, `0.1em` tracking. Links to `/`.
  - **Center-right**: Tool links (CALCULATOR, TEAM BUILDER) as direct links + GAMES dropdown (TYPES, SPEEDS, ROLES, WILL IT KO?, SPECIAL ATTACK). Same H4 style. Spaced with `2rem` gap.
  - **Games dropdown**: Button with Lucide `ChevronDown` (rotates 180° on open). Panel: white background, `--shadow-nav`, rounded. Items: Space Mono uppercase, `fog` hover. Opens on hover (desktop) or click. Managed via IAPI state (`isGamesDropdownOpen`).
  - **Far right**: Social icons (Website/Globe, X/Twitter, GitHub) inline SVGs, `20px`. Separated from nav links by a subtle left border (`border-black/20`). Open in new tab.
- [x] **Layout (mobile)**: Logo + "POKEMON" text on the left (always visible). Hamburger icon (`Menu` from Lucide) on the right.
- [x] **Mobile menu**: Full-screen overlay on white (`#FFFFFF`) background. X close button (`X` from Lucide) top-right. Links stacked vertically and centered: Games group (with "Games" label in small uppercase `--color-darker-gray`) then separator (`h-px w-16 bg-black/20`) then Tool links. Font: Space Mono bold, `text-2xl`, uppercase. Social icons grouped at the bottom.
- [x] **Active page indicator**: `2px` underline offset below the link text using `--color-black`. Driven client-side via IAPI `callbacks.isActive` reading `window.location.pathname` — no server-side path passing needed. Applied on both desktop and mobile.
- [x] **Nav items**: Tool links — CALCULATOR (`/damage-calculator`), TEAM BUILDER (`/team-building`). Games dropdown — TYPES (`/types`), SPEEDS (`/speeds`), ROLES (`/roles`), WILL IT KO? (`/will-it-ko`), SPECIAL ATTACK (`/special-attack`). Design system route excluded (dev-only).
- [x] **Nav link hover**: Subtle opacity reduction or `color-mix()` lighten on hover, with `transition-colors`. No underline on hover (reserved for active state).
- [x] **Breakpoint**: Nav links + social icons visible on `md` (768px) and up. Below `md`, collapse to hamburger.
- [ ] **Mobile menu accessibility**: Review focus management — focus the close button (or first focusable element) on open, trap Tab/Shift+Tab within the overlay, return focus to the hamburger on close.

---

## 9. Footer

- [ ] **Content**: Links? Credits? Social? Keep it minimal?
- [ ] **Layout**: Single row, multi-column, stacked on mobile?
- [ ] **Background**: Different from page background?
- [ ] **Sticky footer**: Always at page bottom even on short pages?

---

## 10. Icons

- [x] **Icon set**: Lucide via `lucide-static` for generic UI icons (inline SVGs, `currentColor` inheritance). Custom SVGs for Pokemon-specific icons (type symbols, Pokeball, etc.). ✅ Resolved in tooling decisions.
- [x] **Size convention**: `24px` standard.

---

## 11. Images & Media

- [x] **Image hosting**: Self-hosted static files in `public/images/`, committed to the repo. A one-off download script fetches all sprites from PokeAPI and saves them locally. DB stores local paths (e.g., `/images/pokemon/artwork/25.png`) instead of external GitHub URLs. Hardcoded hero URLs in page files replaced with local paths too. No deploy-time download step — images are part of the repo.
- [ ] **Pokemon artwork**: Which image from the `images` jsonb to use as primary? (official artwork, front sprite, etc.)
- [ ] **Image aspect ratio**: Consistent ratio for cards or let images be natural size?
- [ ] **Loading strategy**: Lazy loading? Blur placeholder? Skeleton?
- [ ] **Sprites vs artwork**: Use sprites for compact views (lists) and artwork for detail views?

---

## 12. Motion & Transitions

- [ ] **Default transition duration**: e.g., `150ms`, `200ms`.
- [ ] **Easing function**: e.g., `ease-out`, `cubic-bezier(...)`.
- [ ] **What animates**: Hover states, page transitions, loading states?
- [x] **Approach**: CSS transitions + `@keyframes` only, no JS animation library. Global `prefers-reduced-motion` reset. ✅ Resolved in tooling decisions.

---

## 13. Misc

- [ ] **Border radius convention**: e.g., `4px` for small elements, `8px` for cards, `full` for pills.
- [ ] **Shadow scale**: None, subtle (`sm`), medium (`md`), large (`lg`)?
- [ ] **Dividers / separators**: Lines, spacing only, or decorative?
- [ ] **Favicon**: Derive from logo? Custom pixel art?
- [ ] **OG / social meta image**: Needed? Style?

---

## 14. Design Document

Once all decisions above are resolved, compile a standalone **design document** (`DESIGN.md`) with the final values — no open questions, no checkboxes, just the resolved system. This becomes the implementation reference.

Contents:
- Color palette (all hex values, semantic mappings, type color bg+text pairs)
- Typography (font families, weights, type scale with exact sizes)
- Spacing and layout (max-width, padding, section spacing)
- Component specs (buttons, cards, badges, inputs, tables — with variants and states)
- Element styles (headings, body, links, focus ring)
- Icon and image conventions
- Motion tokens (durations, easing)
- Misc (border radii, shadows, separators)

This plan (`DESIGN_PLAN.md`) tracks the decision process. The design document (`DESIGN.md`) is the output.

