# Phase Plan

Static reference doc — this doesn't change as work progresses (that's what `PROGRESS.md` is
for). Each phase is sized to comfortably fit inside one Claude Code session. Don't start a
phase until the previous one is checked off in `PROGRESS.md`.

---

## Phase 0 — Project Setup & Foundations

**Tasks**
- `create-next-app` (TypeScript, App Router, Tailwind, ESLint)
- Install: `framer-motion`, `gsap`, `@gsap/react`, `lucide-react`, `lenis`, `clsx`,
  `tailwind-merge`
- Folder structure per `CLAUDE.md` §3
- `next/font`: pick and wire up a heading/body font and a mono accent font (see
  `DESIGN_SYSTEM.md` §Typography)
- Root layout with base metadata, favicon, `<html>` theme-color
- Empty section components stubbed for the full page (Hero/About/Skills/Services/Experience/Projects/Contact) so the page assembles top to bottom even before they're built out

**Acceptance criteria**
- `npm run dev` runs clean, no console errors
- Blank-but-styled shell renders with the base color/typography from `DESIGN_SYSTEM.md`
- `PROGRESS.md` initialized with Session 1 logged

---

## Phase 1 — Content Intake & Information Architecture

**Tasks**
- Read `docs/CONTENT_BRIEF.md`. Any field still `[TODO]`: build the section around it, note
  it in `PROGRESS.md` Known Issues — do not invent specifics (dates, employer names, metrics)
- Define final sitemap: `/`, `/projects/[slug]` (confirmed needed — each project has a full
  case-study page per `CONTENT_BRIEF.md`), `/404`
- `content/data.ts` — typed content (services, experience, education, projects, skills,
  certifications, awards, socials) that every section component imports from — every
  field in `CONTENT_BRIEF.md`, not just the ones needed by the first few sections

**Acceptance criteria**
- Content typed and imported with no `any`, matches `CONTENT_BRIEF.md` structure
- Every remaining placeholder is listed in `PROGRESS.md`

---

## Phase 2 — Design System Implementation

**Tasks**
- `tailwind.config.ts`: color tokens, gradient utilities, shadow presets, radius scale,
  glass-surface utility — all from `DESIGN_SYSTEM.md`, nothing ad hoc
- Base primitives: `Button`, `Badge`, `GlassCard`, `GradientText`, `SectionHeading`,
  `Container`
- Background layer components: `DotGrid`, `RadialOrbs`, `NoiseOverlay` — CSS/SVG-driven where
  possible, not JS-animated per-frame (cheap, so they can run everywhere without a perf cost).
  `NoiseOverlay` is the very faint, slow-moving grain layer from `DESIGN_SYSTEM.md`'s
  Background layer section — a single low-opacity CSS/canvas layer, not a particle system

**Acceptance criteria**
- Primitives render correctly against the dark background at each breakpoint
- No raw hex values or magic Tailwind arbitrary values outside `tailwind.config.ts`
- `NoiseOverlay` is barely perceptible and has no measurable frame-rate cost

---

## Phase 3 — Global Interaction Layer

**Tasks**
- `useReducedMotion` hook (wraps `matchMedia('(prefers-reduced-motion: reduce)')`) and
  `useIsTouchDevice` hook — both consumed by every effect component from here on
- `lib/gsap.ts` — register `ScrollTrigger` once, and wire Lenis's scroll position into it
  (`ScrollTrigger.scrollerProxy` or the documented Lenis+GSAP `raf` integration) so the two
  don't fight each other. This is the wiring `CLAUDE.md` §2 calls out as underpinning
  everything after it — every later scroll-scrubbed phase (Experience timeline, Scroll
  Choreography, the Section-Transition Macro-Layer) depends on this file being correct
- `Lenis` smooth-scroll provider wrapping the app
- `Cursor` component: spring-smoothed follower ball via `useMotionValue` + `useSpring`, dual
  layer (large translucent outer circle that springs/lags, small inner dot that tracks almost
  immediately), `mix-blend-mode` for legibility over any background, expands with a contextual
  label (`VIEW`/`OPEN`/`EXPLORE`, passed per-element as a prop/data attribute) on hoverable
  elements, fully unmounted (not just hidden) on touch devices and when reduced motion is on
- `MagneticWrapper` effect component: wraps a button/link/card and translates the wrapped
  element a small, distance-weighted, clamped amount toward the pointer within a proximity
  radius (a few pixels of max travel, not a teleport) — built once, reusable, not hand-rolled
  per consumer. Services cards (Phase 7) and hero CTAs (Phase 5) both depend on this existing

**Acceptance criteria**
- Cursor tracks smoothly with no jank on desktop, is entirely absent on a touch-simulated
  viewport, and is entirely absent with reduced-motion forced on
- Build one throwaway pinned `ScrollTrigger` test element to confirm Lenis and GSAP agree on
  scroll position with no fighting/jitter, then remove the test element (keep `lib/gsap.ts`)
- `MagneticWrapper` visibly pulls a placeholder button toward the cursor and clamps correctly
  at the edge of its proximity radius
- Scroll feels smooth site-wide with no scroll-hijack side effects yet (that's Phase 11)

---

## Phase 4 — Loader & Navbar

**Tasks**
- `Loader`: the boot-sequence effect from `DESIGN_SYSTEM.md` (name/role line, progress bar,
  four status lines — `INITIALIZING SYSTEM...` etc.), timed to ~1–1.5s total. Either GSAP or
  Framer Motion is fine here (it's a linear, self-contained sequence, not scroll-driven) — pick
  one and keep the loader's own logic isolated from the rest of the app. Gate it with a new
  `useHasSeenLoader` hook backed by `sessionStorage` (SSR-safe) so it shows once per session,
  not on every internal navigation (e.g. returning to `/` from a project detail page). Under
  reduced motion: skip straight to the site, no loader shown at all
- `Navbar`: starts transparent over the hero. On scroll: transitions to a glassy, blurred,
  bordered bar with a smooth height reduction, an active-section scroll-spy indicator, and an
  animated underline on the current nav item. This is a discrete state transition
  (transparent → glass), not a scroll-scrubbed timeline, so Framer Motion is the right tool —
  don't reach for GSAP ScrollTrigger here

**Acceptance criteria**
- Loader shows exactly once per browser session; navigating to a project detail page and back
  to `/` does not replay the boot sequence
- Navbar's active-section indicator correctly tracks which section is in view while scrolling
- Loader is fully skipped (not just faster) under reduced motion

---

## Phase 5 — Hero Section + Constellation Effect (hero-ambient)

**Tasks**
- `ConstellationCanvas`: a hand-rolled `<canvas>` component (not Three.js/React Three
  Fiber — see `CLAUDE.md` §2), built generically from the start with particle count,
  connection distance, node styling, and interactivity strength all as config props. Build it
  this way *now* because Phase 6 (About) and Phase 10 (Skills) both reuse this exact component
  with different config — don't build a second implementation later. Particles drift slowly, a
  connecting line draws between any two within a distance threshold (opacity falls off with
  distance), gentle pointer-reactive parallax across the field, particle count scales down on
  smaller viewports, `requestAnimationFrame` loop pauses on `document.visibilitychange`,
  reduced motion renders one static frame with no animation loop at all
- Wire the **hero-ambient** instance: a loose particle field across the hero background
- Hero copy from `content/data.ts`: name, tagline, staggered text entrance (Framer Motion —
  this is a one-time entrance, not scroll-scrubbed), primary/secondary CTA buttons wrapped in
  Phase 3's `MagneticWrapper`, animated scroll-down arrow indicator
- Role line: typewriter-animated, cycling through the three variants in `content/data.ts`
  (per `CONTENT_BRIEF.md`) — type out, brief pause, delete, next variant, loop. This is a
  looping UI-state effect, not scroll-driven, so build it with Framer Motion or a small
  self-contained hook — not GSAP. Under reduced motion: show the first variant only, static,
  no typing/deleting animation

**Acceptance criteria**
- Smooth on a mid-range laptop; on mobile either a lighter particle count or a static fallback
  is used (your call, log which in `PROGRESS.md`)
- Hero copy pulls from `content/data.ts`, not hardcoded
- Typewriter role line cycles through all three variants continuously and shows a single
  static variant under reduced motion, per `CLAUDE.md` §4
- **Do not** attempt the pinned "hero shrinks into a corner as About takes focus" transform in
  this phase — it needs About's layout to exist first, and it's built with GSAP ScrollTrigger
  in Phase 11 (Scroll Choreography Pass), not here and not with Framer Motion

---

## Phase 6 — About Section

**Tasks**
- Bio copy from `CONTENT_BRIEF.md`
- Portrait image (flag as `[TODO]` in `PROGRESS.md` if the asset isn't available yet) with the
  **portrait-tied** configuration of Phase 5's `ConstellationCanvas`: a tighter node cluster,
  glowing nodes, denser/thinner connecting lines, and a more pronounced hover reaction directly
  over the portrait (nodes pull toward the cursor, lines brighten) — same component, different
  props, per `DESIGN_SYSTEM.md`'s "one canvas approach"
- Scroll-tied progressive text reveal: words/lines start dim (`text-secondary`) and brighten to
  `text-primary` as they cross into the viewport — either a per-word GSAP ScrollTrigger scrub
  or a Framer Motion stagger keyed off scroll progress, either is acceptable per
  `DESIGN_SYSTEM.md`

**Acceptance criteria**
- The text reveal is genuinely tied to scroll position (scrub back up, words dim again), not a
  fire-once `whileInView` animation
- The portrait constellation is visibly tighter/denser than the hero-ambient field, confirming
  the shared component's config is actually doing different work in each context

---

## Phase 7 — Services (Bento Grid + Magnetic 3D Cards)

**Tasks**
- Bento-style grid for services/what-I-do from `CONTENT_BRIEF.md`, `lucide-react` icon per
  item, checkmark-bulleted sub-points where relevant
- `GlassCard` + hover: mouse-following 3D tilt (**3–6° max** — a cap, not a target), a soft glow
  that follows the cursor within the card, icon vs. text content shifting at very slightly
  different depths for a parallax feel, icon rotates/scales on hover
- Wrap each card in Phase 3's `MagneticWrapper` so the card itself also pulls slightly toward
  the cursor
- Scroll-triggered staggered entrance (`whileInView`)

**Acceptance criteria**
- Grid reflows sensibly mobile → tablet → desktop (not just a squeezed single column at every
  size if content allows better use of tablet width)
- `:focus-visible` gets an equivalent static glow/border state — tilt and cursor-spotlight have
  no keyboard analog, so the focus state has to communicate "interactive and focused" on its own

---

## Phase 8 — Experience Timeline

**Tasks**
- A vertical line that **grows as the user scrolls** through the section — a GSAP ScrollTrigger
  scrub tied directly to scroll progress (this is scrubbed, pinned-adjacent work, so GSAP per
  `CLAUDE.md` §2, not a fixed-duration Framer Motion draw)
- One node per entry from `CONTENT_BRIEF.md`, marked up as a real ordered list
  (`<ol>`/semantic structure) so it reads correctly to a screen reader, not just visually
  ordered
- The active node (currently in/near viewport) glows
- Include the two Education entries in the same timeline, distinguished with a small type
  badge — **this is the phase where that decision is implemented**

**Acceptance criteria**
- Line growth is genuinely scroll-scrubbed — scrolling back up retracts it, it isn't a
  one-shot reveal
- Screen reader announces the timeline as an ordered list
- Education entries are present and visually distinguished, not dropped

---

## Phase 9 — Projects Showcase + Certifications & Awards

**Tasks**
- Project cards on `/`: image, name, one-line pitch, tech tags. On scroll into view: image
  starts slightly zoomed with a dark overlay, overlay fades out, title slides in, tech tags
  stagger in after. On hover (desktop only): image shifts slightly toward the cursor position
  within the card bounds (a small parallax-style follow, not a full drag). Card click →
  `/projects/[slug]` — **this is the phase where that route is built**
- `/projects/[slug]` detail page per project in `CONTENT_BRIEF.md`: hero image, title,
  one-line pitch, a meta block (Role / Type / Date / Stack), a "Live Preview" button (link from
  content; hide/disable if still `[TODO]`), an Abstract, and a "Back" control to return to the
  homepage projects section
- Certifications & Awards: a lighter secondary gallery (image + title + label per item, no
  detail page) with `All / Projects / Certifications / Awards` filter tabs, matching the
  structure in `CONTENT_BRIEF.md`. Clicking a cert/award opens its link (or a simple image
  lightbox if no link is set) rather than navigating to a new route
- `next/image` for every project/certificate/award image, lazy-loaded below the fold

**Acceptance criteria**
- All images have real `alt` text (from `CONTENT_BRIEF.md`, not filenames)
- Broken/missing links degrade gracefully (button disabled or hidden, not a dead click) —
  expect several `[TODO]` live links until those are filled in
- Filter tabs update the visible grid without a full page reload

---

## Phase 10 — Skills (Floating AI Ecosystem), Contact, Footer

**Tasks**
- Skills — **not progress bars, not cards**: a centered node (`AI ENGINEER` or similar) with
  the skill nodes gently floating/orbiting around it, connected by thin lines back to the
  center — a third context/config for Phase 5's `ConstellationCanvas` line-connection
  approach, not a new implementation. Map each of the four core skills' proficiency percentage
  from `CONTENT_BRIEF.md` to node size and/or glow intensity; reveal the exact percentage in a
  hover/info panel rather than printing it as a bar-fill label. The remaining stack (Databases,
  Tools, etc. — no percentage given) renders as a plain tag list. Spoken languages as circular
  badges (Urdu / Hindi / English), on-palette colors
- Contact: terminal-styled real, accessible form (semantic `<label>`s, keyboard-operable,
  screen-reader-announced validation) **or** the three direct contact links, per whatever was
  confirmed during Phase 1 — if still unconfirmed, ship the three direct links and flag the
  form as a `PROGRESS.md` TODO rather than guessing
- Footer

**Acceptance criteria**
- Skills renders as an orbiting node system matching `DESIGN_SYSTEM.md`, not bars or cards —
  double-check this explicitly, since the old site's progress-bar pattern is an easy default to
  fall back into
- Every contact link/CTA actually points somewhere real from `CONTENT_BRIEF.md`
- If a form exists: works with keyboard only, validation errors are accessible

---

## Phase 11 — Scroll Choreography Pass

This is the "old content animates out, new content animates in" requirement — read this one
carefully, it's a deliberate scope decision, not a shortcut.

**Tasks**
- **Everywhere:** build a shared `Reveal` effect component (fade + translateY + slight scale on
  enter via `whileInView`, firing once per section, not re-triggering every scroll direction
  change) and use it consistently across sections instead of ad hoc per-section reveal logic
- **Flagship moment — Hero → About:** the real scroll-linked "swap," built with **GSAP
  ScrollTrigger** (pinned, scrubbed directly to scroll progress) — **not** Framer Motion's
  `useScroll`/`useTransform`. This is exactly the kind of pinned, scrubbed work `CLAUDE.md` §2
  assigns to GSAP, and it's what `DESIGN_SYSTEM.md`'s "Scroll-driven hero transform" section
  specifies. The hero portrait/visual starts large and centered, then scales down and
  translates into a corner as About's content takes visual focus
- **Optional second flagship moment:** Experience → Projects, same GSAP ScrollTrigger approach,
  if you want it

**Why not full scroll-jacking on every single section boundary:** doing this everywhere
(pinning each section, hijacking scroll velocity site-wide) tends to hurt exactly the things a
portfolio needs — it fights the browser's native scroll feel, is a common source of
motion-sickness complaints, is heavier to keep at 60fps, and makes the page harder to skim for
a recruiter who just wants to jump to Projects. The hybrid above gets the "wow" moment at the
hero without making the whole page fight the user. If after seeing it you want the full
scroll-jack treatment everywhere, that's a straightforward extension of the same pattern per
section — flag it as a scope change in `PROGRESS.md`'s decision log.

**Acceptance criteria**
- Smooth scrolling up *and* down through the flagship transition, no layout shift
- The flagship transition is confirmed built with GSAP ScrollTrigger — not Framer Motion's
  `useScroll`/`useTransform`
- Under reduced motion, every scroll-linked effect collapses to a plain fade — no parallax, no
  pinning

---

## Phase 12 — Section-Transition Macro-Layer

Only start this phase once every individual section already works correctly on its own — this
is a layer stitched on top of finished sections, not a replacement for their own entrance
animations.

**Tasks**
- **Hero → About:** fold a traveling gradient blob/glow into the same GSAP ScrollTrigger-scrubbed
  timeline built in Phase 11 — don't build a second, competing timeline for this
- **About → Skills:** the ambient background dot-grid becomes more visible/defined
- **Skills → Projects:** the ecosystem's connecting-line visual language carries into the
  project cards' layout — a shared visual grammar between the two sections, not necessarily a
  literal shape-morph animation
- **Projects → Contact:** background gradually darkens

**Acceptance criteria**
- Every transform in this layer is GSAP ScrollTrigger-scrubbed
- Under reduced motion, every one collapses to a plain cross-fade — no pinning, no blob travel,
  no morph, just content in the right order with an instant or fade transition

---

## Phase 13 — 404, Metadata & SEO Pass

**Tasks**
- Custom `not-found.tsx` — lost-in-space/constellation motif fits the theme, with a clear way
  back to the homepage
- `generateMetadata` per route: unique `<title>` and description (not a single global title
  reused everywhere)
- OG image, `sitemap.xml`, `robots.txt`, favicon set

**Acceptance criteria**
- Every route has a distinct title/description
- Lighthouse SEO ≥ 95

---

## Phase 14 — Performance, Accessibility, Easter Egg & Launch

**Tasks**
- Confirm every canvas/mouse-tracking component is `next/dynamic` with `ssr: false`
- Image optimization pass, font subsetting check, bundle size sanity check
- Full keyboard-only pass through the whole page; full reduced-motion pass
- Easter egg — build this **last**, only once everything else is solid: typing `sudo hire-me`
  anywhere on the page (a simple `keydown` buffer, no dependency needed) triggers a small
  on-brand reveal (`> Access granted.` / `> Let's build something amazing.`). Not gated behind
  reduced motion (it's user-initiated and tiny), not referenced anywhere in the UI
- Lighthouse run (Performance/Accessibility/Best Practices/SEO), scores logged in
  `PROGRESS.md`
- Deploy to Vercel, verify production URL

**Acceptance criteria**
- Lighthouse ≥ 90 across all four categories, scores recorded in `PROGRESS.md`
- Easter egg works and is genuinely undocumented anywhere in the visible UI
- Deployed URL works and matches local build
