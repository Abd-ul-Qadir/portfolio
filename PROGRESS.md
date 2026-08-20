# Progress Tracker

> **Claude Code: read this file fully before doing anything else.** Update it before you
> stop working, every time — see `CLAUDE.md` §0 for the exact rule. This file is the only
> thing that survives a context reset; treat every edit to it as important as an edit to code.

Last updated: 2026-08-20
Repo status: git initialised, Phases 0–2 committed

---

## Current phase

> **Phases 0–2 complete.** Currently starting **Phase 3 — Global Interaction Layer**
> (see `docs/PHASE_PLAN.md`).

## Phase checklist

- [x] Phase 0 — Project Setup & Foundations
- [x] Phase 1 — Content Intake & Information Architecture
- [x] Phase 2 — Design System Implementation (tokens + base UI primitives)
- [ ] Phase 3 — Global Interaction Layer (cursor, GSAP+Lenis wiring, magnetic wrapper)
- [ ] Phase 4 — Loader & Navbar
- [ ] Phase 5 — Hero Section + Constellation Effect (hero-ambient)
- [ ] Phase 6 — About Section (text reveal, portrait-tied constellation)
- [ ] Phase 7 — Services (bento grid, magnetic 3D cards)
- [ ] Phase 8 — Experience Timeline
- [ ] Phase 9 — Projects Showcase + Certifications & Awards
- [ ] Phase 10 — Skills (floating AI ecosystem), Contact, Footer
- [ ] Phase 11 — Scroll Choreography Pass (flagship GSAP hero transform)
- [ ] Phase 12 — Section-Transition Macro-Layer
- [ ] Phase 13 — 404, Metadata & SEO Pass
- [ ] Phase 14 — Performance, Accessibility, Easter Egg & Launch

*(Only check a box once its acceptance criteria in `docs/PHASE_PLAN.md` are actually met —
not when the happy path looks fine.)*

---

## Session log

> Append a new entry every session. Do not delete old entries — this is the project's
> memory. Newest entry on top.

### Session 1 (cont.) — 2026-08-20 — Phase 2: Design System Implementation
**Did:**
- **Moved the token definitions out of `tailwind.config.ts` into `lib/tokens.ts`**, which the
  config now imports. Same single-source-of-truth guarantee as before, but app code can also
  import a literal where it genuinely needs one at runtime — `viewport.themeColor` already
  does, and the Phase 5 constellation canvas will need real colour values to paint with.
  `tailwind.config.ts` still emits every token onto `:root` via the `addBase` plugin.
  Translucent tokens (`border-hover`, both glows) are derived from the palette with
  `color-mix()` rather than restating the same channels as an `rgba()` literal.
- Extended the theme with the rest of `DESIGN_SYSTEM.md`: `bg-primary` gradient utility,
  `shadow-glow` / `shadow-glow-strong` / `shadow-elevated`, a radius scale
  (`card` / `panel` / `pill`), fluid `text-display` / `text-heading` / `text-eyebrow` clamps,
  a `spacing.section` clamp for the section rhythm, an `ease-smooth` timing function, and the
  `orb-drift` / `grain-shift` keyframes.
- Component classes added in the plugin so no consumer needs an arbitrary value:
  `.glass-surface`, `.text-gradient-primary`, `.dot-grid`, `.ambient-orb{,-a,-b,-c}`,
  `.mask-radial-fade`, `.noise-overlay`.
- `lib/utils.ts` — `cn()` over `clsx` + `tailwind-merge`.
- Primitives in `components/ui/`: `Container` (the one horizontal rhythm, `as` +
  default/wide), `Button` (renders a real `<button>` or a `next/link` depending on `href` —
  never a clickable `<div>`; carries an optional `cursorLabel` that Phase 3's cursor will read
  off `data-cursor-label`), `Badge` (neutral/accent/positive), `GlassCard` (with an
  `interactive` flag whose `:focus-visible` state is identical to its hover state, since
  Phase 7's tilt and spotlight have no keyboard analog), `GradientText`, `SectionHeading`
  (eyebrow + heading + optional gradient accent + description + the diffused violet glow, with
  an optional sparkle).
- Background layers in `components/effects/`, all CSS/SVG-driven with zero per-frame JS:
  `DotGrid` (tiled radial-gradient, `faint`/`visible` intensities for Phase 12 to scrub
  between, optional radial edge fade), `RadialOrbs` (three blurred circles on a 24s drift,
  `violet`/`cool` tones), `NoiseOverlay` (one tiled SVG turbulence texture at `opacity-grain`
  = 0.035, `mix-blend-overlay`, mounted once globally in the root layout rather than per
  section).
- Two fixes found by looking at the rendered output rather than the code: `GlassCard` now
  forces `text-left` (it was inheriting `<button>`'s centred text when rendered `as="button"`),
  and the dot grid got its own `--dot-color` token at 0.14 alpha — at `border-subtle`'s 0.08 a
  1px dot was literally invisible rather than subtle.

**Verified (not eyeballed — actual screenshots):** rendered the primitives against the real
background layers at **390 / 834 / 1440** and read the images back. Two things worth knowing
for later phases:
- **Headless Chrome clamps its window to a 500px minimum width**, so a `--window-size=390`
  screenshot is a 500px render cropped to 390 and *looks* like a horizontal-overflow bug.
  To check a real mobile breakpoint, load the page in a fixed-width `<iframe>` inside a
  wrapper HTML file and screenshot that. Don't re-litigate this next session.
- Measured overflow directly with a temporary client component rather than guessing:
  `docSW == innerWidth` at 390/834/1440, so there is no horizontal overflow anywhere.
Also confirmed in the compiled CSS: `@media (prefers-reduced-motion: reduce)` kills
`.ambient-orb`'s animation and the `motion-reduce:animate-none` utility exists; the global
`:focus-visible` outline and `GlassCard`'s focus utilities are all present. `npm run lint`,
`npm run build` and `npx tsc --noEmit` all clean. Audited with grep: **zero raw hex values and
zero Tailwind arbitrary values anywhere outside `lib/tokens.ts`.**

**Decisions made:** the `lib/tokens.ts` move (see decision log — it supersedes the wording of
the Phase 0 entry, which said the values live in `tailwind.config.ts`). Also added
`argsIgnorePattern`/`varsIgnorePattern` `^_` to `eslint.config.mjs` so a component can
destructure styling props off its props and spread the remainder onto a native element without
a lint warning.

**Next up:** **Phase 3 — Global Interaction Layer.** In order: `lib/hooks.ts`
(`useReducedMotion` over `matchMedia`, `useIsTouchDevice`) -> `lib/gsap.ts` (register
ScrollTrigger once and wire Lenis's scroll position into it — `CLAUDE.md` §2 flags this as the
file every later scroll phase depends on, so get it right) -> a Lenis provider wrapping the app
-> `Cursor` (dual layer, `useMotionValue`+`useSpring`, `mix-blend-mode`, contextual label read
from `data-cursor-label`, *unmounted* on touch and under reduced motion) -> `MagneticWrapper`
(distance-weighted, clamped, few-pixels-max pull). Then build a throwaway pinned ScrollTrigger
element, confirm Lenis and GSAP agree on scroll position with no jitter, and **delete the test
element before checking the phase off**. The temporary `/styleguide` route built this phase was
already deleted the same way — don't go looking for it.

**Blockers / open questions:** none for Phase 3.

### Session 1 (cont.) — 2026-08-20 — Phase 1: Content Intake & Information Architecture
**Did:**
- Built `content/data.ts` — the whole of `docs/CONTENT_BRIEF.md`, typed, `readonly`
  throughout, zero `any` (verified with `grep` and a clean `tsc --noEmit`). Covers: identity
  + socials, the 3-role typewriter tuple, education (2), services (4), experience (4),
  projects (3, with full meta + abstract), core skills (4, with percentages), the 5 unscored
  stack groups, spoken languages, certifications (5), awards (6), the gallery filter tabs,
  contact copy + methods, and the nav items.
- **Every `[TODO]` in the brief is typed as `T | null`, never invented and never an empty
  string** — `identity.resumeUrl`, each project's `liveUrl` / `repoUrl` / `image`, each
  credential's `url` / `image`. Consumers must degrade gracefully (Phase 9 criteria); the
  doc comment at the top of the file says so.
- Modelling decisions worth knowing before you touch this file:
  - `IconName` is a string union, not an imported `LucideIcon` — content stays free of React
    imports, and each consuming component owns its `Record<IconName, LucideIcon>` lookup.
  - Work and education share one `TimelineEntry` type separated by a `kind` discriminant,
    and `timeline` exports them pre-merged reverse-chronologically (work first on a year
    tie). That's Phase 8's "Education entries in the same timeline with a type badge"
    decision already encoded in the data, so Phase 8 just renders it.
  - `coreSkills[].proficiency` is kept as a number so Phase 10 can map it to node size/glow
    and reveal it on hover — the brief's "animated progress bars" wording is superseded by
    `DESIGN_SYSTEM.md`, which explicitly retires the bars.
  - `contact.formEnabled` is `false` pending Abdul's call on form-vs-links, so Phase 10 has
    a single flag to flip rather than a rewrite.
  - `siteUrl` is a placeholder until the production domain is settled at deploy (Phase 14).
- **Sitemap confirmed:** `/` (single page, all sections), `/projects/[slug]` (3 static
  params from `projectSlugs`), and the custom `not-found`. No other routes. The
  `/projects/[slug]` route itself is *not* built yet — `PHASE_PLAN.md` assigns it to Phase 9;
  `getProject(slug)` and `projectSlugs` are already exported and waiting for it.
- Wired the data into the shell so it is genuinely exercised by the build rather than sitting
  as dead exports: Navbar renders `navItems` + initials, Hero renders name/tagline/`roles[0]`,
  Contact renders the headline/supporting line/three working links, Footer renders the three
  socials. All still deliberately unstyled-beyond-base and unanimated — About, Skills,
  Services, Experience and Projects remain plain stubs for their own phases.

**Verified:** `npm run lint` clean, `npm run build` clean (routes: `/`, `/_not-found`,
`/icon.svg`), `npx tsc --noEmit` clean.

**Next up:** **Phase 2 — Design System Implementation.** Extend `tailwind.config.ts` with the
remaining `DESIGN_SYSTEM.md` tokens (`--gradient-primary`, `--glow-primary`, shadow presets,
radius scale, a `glass-surface` utility) alongside the colours already there — keep the
`tokens`-object + `addBase` pattern, don't start a second source of truth. Then `lib/utils.ts`
(`cn()` from `clsx` + `tailwind-merge`), the six primitives in `components/ui/` (`Button`,
`Badge`, `GlassCard`, `GradientText`, `SectionHeading`, `Container`), and the three background
layers in `components/effects/` (`DotGrid`, `RadialOrbs`, `NoiseOverlay` — CSS/SVG-driven, no
per-frame JS). Check the "no raw hex or arbitrary values outside `tailwind.config.ts`"
criterion by grepping for `#` and `[` in `components/` before checking the box.

**Blockers / open questions:** none for Phase 2. The asset/decision questions below have been
put to Abdul directly so they can be gathered while Phases 2–5 proceed.

### Session 1 — 2026-08-20 — Phase 0: Project Setup & Foundations
**Did:**
- Scaffolded Next.js 16.3.1 (App Router, TypeScript strict, ESLint flat config, no `src/`,
  `@/*` alias) into the existing repo alongside `CLAUDE.md` / `PROGRESS.md` / `docs/`.
- Installed the exact §2 dependency list and nothing else: `framer-motion` 13, `gsap` 3.15,
  `@gsap/react` 2.1, `lenis` 1.3, `lucide-react`, `clsx`, `tailwind-merge`.
- Set up Tailwind **v3.4** by hand (`postcss.config.mjs`, `tailwind.config.ts`) — see the
  decision log below for why v3 and not the v4 that `create-next-app` ships.
- `tailwind.config.ts` now holds every `DESIGN_SYSTEM.md` colour token as the single source of
  truth, and a small `addBase` plugin re-emits each one as a `:root` CSS custom property so
  canvas / GSAP / inline-SVG code can read the identical value via `var(--token)` without a
  second copy of the hexes. Verified in the compiled CSS: `--bg-base:#08090d`,
  `--accent-violet:#7c3aed`, `.text-accent-violet` utility generated, `body` painted with
  `var(--bg-base)`.
- `next/font/google`: Geist (`--font-sans`) + Geist Mono (`--font-mono`), `display: swap`,
  wired into `tailwind.config.ts`'s `fontFamily`.
- Root layout: real title/description metadata, `viewport.themeColor` `#08090D`,
  `colorScheme: dark`. Replaced the Next.js default `favicon.ico` with an on-brand
  `app/icon.svg` (AQ mark) — full favicon/OG set is still Phase 13.
- `app/globals.css` reduced to Tailwind directives + a small `@layer base` (body colours,
  violet `::selection`, a global `:focus-visible` outline). Deleted the whole
  `create-next-app` demo (`page.module.css`, the five template SVGs).
- Folder structure per `CLAUDE.md` §3: `components/{ui,effects,sections}`, `content/`, `lib/`
  (the first three carry `.gitkeep` until Phases 1–3 fill them).
- Stubbed all nine section components and assembled them top-to-bottom in `app/page.tsx` in
  the `CLAUDE.md` §1 order (Navbar → Hero → About → Skills → Services → Experience → Projects
  → Contact → Footer). Each stub is a full-height labelled placeholder carrying its final
  `id` and `aria-labelledby` so scroll-spy (Phase 4) and anchor links have real targets from
  day one.

**Verified (not eyeballed):** `npm run build` compiles clean (TypeScript included) and
`npm run lint` returns zero findings; `next dev` boots in 2.7s and serves `/` with a 200 and
no server-side errors; compiled CSS confirmed to contain the tokens listed above.

**Decisions made:** Tailwind v3 pin, and tokens-in-config-plus-emitted-CSS-vars — both in the
decision log below.

**Next up:** **Phase 1 — Content Intake & Information Architecture.** Read
`docs/CONTENT_BRIEF.md` end to end and build `content/data.ts`: fully typed (no `any`),
covering *every* field in the brief — identity/socials, education, the 4 services, the 4
experience entries with their bullet lists, the 3 projects with full meta + abstract, skills
(4 core with percentages + the grouped tag list + spoken languages), the 5 certifications and
6 awards, and the contact copy. Confirm the sitemap as `/`, `/projects/[slug]`, `/404`. Every
`[TODO]` in the brief gets a typed nullable/optional field (never an invented value) and a
line in "Known issues" below. Also settle the one open question in `CONTENT_BRIEF.md`'s last
line — working contact form vs. three direct links — by asking Abdul; ship the links and flag
the form as a TODO if unanswered, per Phase 10's task list.

**Blockers / open questions:** none blocking Phase 1. Two questions for Abdul are queued for
when they next appear (neither blocks work before Phase 9/10): the missing image assets and
`[TODO]` links listed under Known issues, and the contact-form-vs-links decision.

---

## Decision log

> Any time you deviate from `DESIGN_SYSTEM.md` or `CLAUDE.md` §3 (tech stack), add a line
> here with the reason. Keeps future sessions from "fixing" an intentional choice.

- **2026-08-20 — Tailwind pinned to v3.4, not the v4 `create-next-app` installs.**
  `CLAUDE.md` §2 and `PHASE_PLAN.md` Phase 2's acceptance criteria both name
  `tailwind.config.ts` as the single place design tokens may live. Tailwind v4 moves
  configuration into CSS (`@theme`) and ships no config file by default, so v4 would have
  meant either contradicting both docs or bolting a legacy `@config` shim onto a v4 engine.
  v3.4 keeps `tailwind.config.ts` genuinely authoritative and is the well-trodden path.
  *If you'd rather be on v4:* the migration is a `tailwindcss@4` install, swapping the
  PostCSS plugin for `@tailwindcss/postcss`, and moving the `tokens` object in
  `tailwind.config.ts` into an `@theme` block in `globals.css` — worth doing before Phase 2
  adds gradients/shadows/glass utilities on top, and painful after.
- **2026-08-20 (Phase 2, supersedes the entry below) — the token object now lives in
  `lib/tokens.ts`, not inside `tailwind.config.ts`.** `tailwind.config.ts` imports it, so
  there is still exactly one definition of every value, but app code can import a literal
  where it genuinely needs one at runtime (`viewport.themeColor`; the Phase 5 canvas, which
  has to paint with a colour value rather than a class). Everything else must keep using a
  Tailwind class or `var(--token)`.
- **2026-08-20 — Raw hex values live in `tailwind.config.ts`; CSS custom properties are
  generated from them, not hand-written.** Phase 2's "no raw hex outside
  `tailwind.config.ts`" and the fact that the constellation canvas (Phase 5) needs literal
  colour values at runtime pull in opposite directions. Resolved with a tiny `addBase`
  plugin that emits the `tokens` object onto `:root`, so `var(--accent-violet)` and
  `text-accent-violet` are provably the same value and there is still exactly one copy of
  each hex in the repo. Don't "fix" this by re-declaring the tokens in `globals.css`.

## Known issues / TODO

> Anything flagged but not blocking — including any `[TODO]` placeholder content still
> pulled straight from `CONTENT_BRIEF.md` that needs the real copy swapped in.

*Carried over from `CONTENT_BRIEF.md`, not yet actioned — these get formally typed as
optional/nullable fields in Phase 1 and start blocking at Phases 6/9/10:*

- **Assets needed from Abdul (blocking Phase 9's visuals):** hero images for all three
  projects (Pest Eye, Customer Segmentation, Netflix Stock Price Predictor); images for all
  five certificates and all six awards.
- **Asset needed from Abdul (blocking Phase 6):** the About-section portrait photo — the
  portrait-tied constellation config is specified against it in `DESIGN_SYSTEM.md`.
- **Links still `[TODO]`:** résumé/CV link; live + repo links for all three projects
  (including the Customer Segmentation Hugging Face Space); links for all five
  certifications. Phase 9 must degrade these gracefully (button hidden/disabled, never a
  dead click).
- **Open content question:** `CONTENT_BRIEF.md` ends by asking whether the contact section
  ships a working form (needs Resend or a serverless function) or just the three direct
  links. Unanswered — Phase 10 ships the three links and keeps this flagged unless Abdul
  says otherwise first.
- **Award issuer names** were only partly legible in the source screenshots; confirm exact
  organisation names with Abdul before spelling any of them out beyond what the brief lists.

## Lighthouse scores (fill in during Phase 14)

| Category       | Score | Date |
|----------------|-------|------|
| Performance    |       |      |
| Accessibility  |       |      |
| Best Practices |       |      |
| SEO            |       |      |
