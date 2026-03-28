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
| Dark mode | ⏸ Deferred | Not needed now; semantic token names keep the door open |
| Dev component gallery | `/design-system` dev-only route rendering all components with variants | Storybook incompatible with this architecture |

## Priority Order

Suggested order to resolve these decisions:

1. **Brand Identity & Tone** — everything else flows from this.
2. **Color Palette** — needed before any visual work.
3. **Typography** — needed before any visual work.
4. **Layout System** — structural foundation.
5. **Element Styles** — headings, text, links.
6. **Components** — buttons, cards, forms.
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
- [x] **Location**: `public/images/logo.svg` (6.9 KB).

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
  - **Heading**: DotGothic16 — pixel/dot-matrix Gothic font. Evokes Game Boy-era Pokemon. Used for headings and display text only.
  - **Body**: Space Mono — monospaced font. Reinforces the retro/terminal aesthetic across paragraphs and UI text.
  - **Fallback**: Karla — humanist sans-serif. Available as a swap if DotGothic16 or Space Mono feel too restrictive in practice.
  - All three available on Google Fonts (SIL Open Font License).
- [x] **Font source**: Self-hosted woff2 files in `public/fonts/`. ✅ Resolved in tooling decisions.
- [x] **Font format**: `woff2` only. ✅ Resolved in tooling decisions.
- [x] **Font weights needed**:
  - DotGothic16: 400 (only available weight — hierarchy via size, not weight).
  - Space Mono: 400 (body text, table data), 700 (bold emphasis, table headers, labels).
  - Karla (fallback): 400, 700.
  - 3 woff2 files to self-host: DotGothic16-400, SpaceMono-400, SpaceMono-700.
- [x] **Base font size**: `16px`.
- [x] **Type scale**: Custom values (defined per element in the Element Styles section).

---

## 5. Layout System ✅

- [x] **Max content width**: `1280px`. Enough room for the type chart and damage calculator side-by-side layout without feeling stretched on simpler pages.
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

## 6. Element Styles

Define the base styles for core HTML elements. Each one needs: font-family, font-size, font-weight, line-height, color, letter-spacing, margins.

### Headings

- [ ] **H1**: Size, weight, letter-spacing, color, bottom margin. Where is it used?
- [ ] **H2**: Same decisions.
- [ ] **H3**: Same decisions.
- [ ] **H4**: Same decisions. Is H4 even needed?
- [ ] **Heading font**: Same as body or different?

### Body Text

- [ ] **Paragraph**: Font size, line-height, color, max-width for readability (e.g., `65ch`).
- [ ] **Sizes**Define which sizes to use and make the same decisions for all of them.
- [ ] **Bold/emphasis**: Just `font-weight: 700` or a different color/treatment?

### Links

- [ ] **Default link style**: Color, underline, hover state.
- [ ] **Visited state**: Different color or same?
- [ ] **Nav links vs inline links**: Different treatment?
- [ ] **Focus-visible style**: Outline, ring, or box-shadow? Color, width, offset? Applies to all interactive elements (links, buttons, inputs, chips).

### Tables

Used for move selection, Pokemon selection in team builder, type matchup charts, stat displays.

- [ ] **Header style**: Background, font weight, border, sticky header for long tables?
- [ ] **Row style**: Striped or plain? Hover highlight?
- [ ] **Cell padding**: Consistent or compact variant for dense data (move lists)?
- [ ] **Responsive behavior**: Horizontal scroll, stacked layout on mobile, or hide less important columns?

---

## 7. Components

### Section / Container

Reusable wrappers that provide consistent structure and visual rhythm across all pages.

- [ ] **Container**: Max-width + horizontal padding. Same as layout max-width or a separate narrower variant for text-heavy content?
- [ ] **Section backgrounds**: Define variants — e.g., default (white/light), muted (subtle gray), accent (brand color), dark (inverted).
- [ ] **Section vertical padding**: Consistent top/bottom padding for all sections, or small/medium/large sizes?
- [ ] **Section separators**: Divided by background contrast alone, subtle border, or spacing only?

### Buttons

- [ ] **Primary button**: Background, text color, padding, border-radius, hover/active/disabled states.
- [ ] **Secondary button**: Outline or ghost variant?
- [ ] **Sizes**: One size or small/medium/large?
- [ ] **Icon buttons**: Needed? (e.g., search submit).

### Pokemon Card

The main repeating element on the index page.

- [ ] **Layout**: Image on top, info below? Horizontal?
- [ ] **Content**: Name, dex number, types, image. Anything else?
- [ ] **Type badges**: Use the type color as background? Pill shape?
- [ ] **Hover/interaction**: Scale, shadow, border glow?
- [ ] **Size**: Fixed width or fluid within grid?
- [ ] **Responsive behavior**: Cards per row at each breakpoint?

### Other Cards

- [ ] **Generic card style**: Shared border-radius, shadow, padding across all card types.
- [ ] **Specific cards needed**: Move cards? Ability cards? Type matchup cards?

### Form Elements

Needed for search and filters on the index page.

- [ ] **Text input**: Border, padding, border-radius, focus ring style.
- [ ] **Select / dropdown**: Native or custom styled?
- [ ] **Search bar**: Special treatment (icon inside, rounded)?
- [ ] **Filter chips / toggles**: For type filtering — pill buttons? Checkboxes?

### Badges / Pills

- [ ] **Type badge**: Shape, size, text style. Color mapping: both bg and text colors hardcoded per type in `@theme` (e.g., `--color-type-fire-bg`, `--color-type-fire-text`). ✅ Color approach resolved in tooling decisions.
- [ ] **Dual-type rendering**: Two separate pills, a split pill, primary-dominant with smaller secondary? This pattern appears in cards, detail views, and anywhere types are displayed.
- [ ] **Stat badge**: For base stats display?
- [ ] **Damage class badge**: Physical/Special/Status indicators?

---

## 8. Navigation Header

- [ ] **Layout**: Logo left, links right? Centered? How does it collapse on mobile?
- [ ] **Position**: Fixed/sticky or static?
- [ ] **Height**: e.g., `64px` desktop, `56px` mobile.
- [ ] **Background**: Solid, transparent, blur/glassmorphism?
- [ ] **Mobile menu**: Hamburger → slide-out? Dropdown? Full-screen overlay?
- [ ] **Active page indicator**: Underline, background, color change?
- [ ] **Nav items**: Which pages appear in the nav?

---

## 9. Footer

- [ ] **Content**: Links? Credits? Social? Keep it minimal?
- [ ] **Layout**: Single row, multi-column, stacked on mobile?
- [ ] **Background**: Different from page background?
- [ ] **Sticky footer**: Always at page bottom even on short pages?

---

## 10. Icons

- [x] **Icon set**: Lucide via `lucide-static` for generic UI icons (inline SVGs, `currentColor` inheritance). Custom SVGs for Pokemon-specific icons (type symbols, Pokeball, etc.). ✅ Resolved in tooling decisions.
- [ ] **Size convention**: e.g., `16px`, `20px`, `24px`.
- [ ] **Usage**: Where are icons needed? (nav, search, type indicators, stats?)

---

## 11. Images & Media

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

