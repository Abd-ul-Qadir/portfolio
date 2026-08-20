# CLAUDE.md — Project Rules for Claude Code

You are building a Next.js portfolio site for **Abdul Qadir, Full Stack AI Engineer**. This
file is read automatically by Claude Code at the start of every session — treat it as
standing orders, not a one-time brief.

This build spans many sessions and your context window **will** reset mid-project.
`PROGRESS.md` is the only memory that survives a reset. Everything in this file exists to
protect that memory.

---

## 0. The one rule that matters most

- **Start of every session:** read `PROGRESS.md` fully, then `docs/PHASE_PLAN.md`, before
  writing or editing a single line of code. Resume exactly where the last session stopped.
  Don't re-plan from scratch. Don't redo a phase already marked complete. Don't jump ahead
  of a phase that isn't.
- **End of every session** — task done, context running low, or stopping for any reason —
  update `PROGRESS.md` *before* you stop: check off what's genuinely done (only if it meets
  the acceptance criteria for that phase in `PHASE_PLAN.md`), add a dated session-log entry,
  write a "Next up" note specific enough that a session with zero memory of this one could
  pick it up cold.
- If unsure what's already built, read the actual code/filesystem — it's ground truth.
  `PROGRESS.md` is the index, not the source of truth.
- Commit to git at the end of every phase with a message referencing the phase, e.g.
  `git commit -m "Phase 5: hero cinematic entrance + constellation"`.

## 1. What this project is

Direction: **"AI operating system / digital laboratory"** — luxury technology, not a gaming
site. Dark, sophisticated, futuristic, restrained. Animation reacts to the user (cursor,
scroll, hover) rather than running continuously in the background.

A mostly-single-page portfolio with a real animation architecture, not just a list of
effects bolted on:

```
LOADER
  -> NAVBAR (transparent -> glass on scroll)
  -> HERO (cinematic entrance, constellation, scroll-driven transform out)
  -> ABOUT (scroll text reveal, portrait parallax)
  -> SKILLS (floating AI ecosystem)
  -> SERVICES (magnetic 3D cards)
  -> EXPERIENCE (animated timeline)
  -> PROJECTS (image-reveal cards, detail pages) + CERTIFICATIONS/AWARDS
  -> CONTACT (interactive terminal)
  -> FOOTER
```

with a macro **section-transition layer** stitching the boundaries above into one continuous
scroll experience (Phase 12) rather than sections just stacking and appearing.

Full content lives in `docs/CONTENT_BRIEF.md`. Full visual/interaction/animation spec lives
in `docs/DESIGN_SYSTEM.md`. Don't invent content, colors, or effects outside those docs — if
something's missing, add a `[TODO]` and flag it in `PROGRESS.md` rather than guessing.

## 2. Tech stack — don't substitute without logging why in PROGRESS.md

- Next.js, App Router, latest stable — TypeScript, strict mode
- Tailwind CSS — design tokens from `DESIGN_SYSTEM.md` go into `tailwind.config.ts` as named
  tokens, never inlined arbitrary values scattered through JSX
- `framer-motion` — UI-level animation: entrances, stagger, hover/tap states, modals,
  simple `whileInView` reveals
- `gsap` + `@gsap/react` (the `useGSAP()` hook) + `ScrollTrigger` — scroll-driven, pinned,
  and scrubbed animation: the hero transform, the timeline growth, the section-transition
  macro-layer. GSAP (including ScrollTrigger) has been 100% free, including commercial use,
  since April 2025 — no license to buy. **Rule of thumb:** Framer Motion for
  entrance/hover/UI state, GSAP ScrollTrigger for anything that pins an element or scrubs
  through a timeline as the user scrolls. Don't reach for both to do the same job in the
  same component.
- `lenis` — smooth-scroll provider; GSAP ScrollTrigger needs to be told about Lenis's scroll
  position (`ScrollTrigger.scrollerProxy` or the documented Lenis+GSAP integration) or the
  two will fight each other — get this wiring right in Phase 3, it underpins everything after
- `lucide-react` — icon set, used everywhere an icon is needed
- `clsx` + `tailwind-merge` — conditional classnames
- Native `<canvas>` for the constellation (both hero-ambient and portrait-tied) — **not**
  Three.js/React Three Fiber. A well-built 2D canvas gets the visual result the reference
  brief asks for (glowing nodes, connecting lines, parallax, hover reactivity) at a fraction
  of the bundle size and complexity. If a genuinely 3D/WebGL look is wanted later, that's a
  scoped upgrade to swap in — don't reach for it by default.
- `next/font` for all fonts, `next/image` for all images, `next/dynamic` (`ssr: false`) for
  any component touching `window`, mouse position, canvas, or GSAP — cursor, constellation,
  loader, and every scroll-choreographed section wrapper all qualify.

## 3. Folder conventions

```
app/                      routes, layouts, metadata (generateMetadata per route)
  not-found.tsx            custom 404
components/
  ui/                       Button, GlassCard, GradientText, SectionHeading, Container...
  effects/                  Cursor, Loader, ConstellationCanvas, RadialOrbs, DotGrid,
                             NoiseOverlay, Reveal, MagneticWrapper
  sections/                 Navbar, Hero, About, Skills, Services, Experience, Projects,
                             Contact, Footer
content/
  data.ts                   typed content pulled from CONTENT_BRIEF.md — sections import
                             from here, never hardcode copy inline in a component
lib/
  gsap.ts                    ScrollTrigger + Lenis registration/wiring, done once
  hooks.ts                   useReducedMotion, useIsTouchDevice, useHasSeenLoader, ...
docs/
  PHASE_PLAN.md, DESIGN_SYSTEM.md, CONTENT_BRIEF.md
PROGRESS.md                 lives at repo root, next to CLAUDE.md
```

## 4. Non-negotiables

- **Respect `prefers-reduced-motion`, everywhere, including GSAP.** Every animated
  component — cursor, loader, constellation, magnetic cards, scroll transforms, the
  section-transition layer, the terminal — checks the shared `useReducedMotion` hook and
  falls back to instant/opacity-only. No parallax, no pinning, no magnetic pull, no
  scroll-scrubbed transforms under reduced motion. This is accessibility, not optional
  polish, and it applies just as much to GSAP timelines as to Framer Motion ones.
- **The terminal-style contact form is a real, accessible form underneath a themed skin.**
  Semantic `<label>`s, keyboard-operable, screen-reader-announced validation errors. The
  "terminal" look is CSS/animation on top of standard form fields, not a replacement for
  them.
- **The loader shows once per session, not on every internal navigation.** Gate it (e.g. a
  flag in `sessionStorage`, respecting SSR) so returning to `/` from a project detail page
  doesn't replay a 1–1.5s boot sequence every time.
- **Keyboard and screen-reader parity everywhere else too.** Hover/magnetic/tilt effects
  need a `:focus-visible` equivalent. Semantic HTML first, `aria-label` where icons carry
  meaning, alt text on every image.
- **Mobile is not an afterthought.** Cursor: off. Magnetic pull: off (nothing to be magnetic
  toward without a mouse). Constellation: reduced particle count or a simplified/static
  version. Scroll-pinned transforms: test carefully on mobile Safari specifically — pinning
  is the single most common source of jank/bugs there; a simpler fade-based fallback per
  section on small viewports is an acceptable, expected simplification.
- **Perf budget:** Lighthouse Performance/Accessibility/Best Practices/SEO all ≥ 90 by the
  final phase. This stack (GSAP + canvas + Lenis + a cursor + a loader) is heavier than a
  typical marketing site — code-split aggressively, dynamically import every heavy client
  component, cap particle/node counts, and clean up every `ScrollTrigger`/`gsap.context()`
  on unmount without exception.
- Don't add a UI/animation/particle package beyond what's in §2 without adding it there and
  logging why in `PROGRESS.md`.

## 5. Definition of done (per phase)

A phase is only checked off in `PROGRESS.md` if, and only after actually verifying each of the
following — don't eyeball it, run the commands:
- `npm run build` and `npm run lint` (or the project's equivalent) both pass clean — run them,
  don't assume from the dev server looking fine
- Responsive at mobile/tablet/desktop (resize/inspect, don't assume from desktop alone)
- Works with keyboard-only navigation
- Respects reduced motion, including any GSAP timelines introduced this phase
- Any scroll-scrubbed or pinned effect built this phase uses GSAP ScrollTrigger, and any
  entrance/hover/UI-state effect uses Framer Motion, per §2 — if a phase's own task list ever
  seems to call for the opposite, that's a signal to re-read `DESIGN_SYSTEM.md` before writing
  code, not to proceed
- The specific acceptance criteria listed for that phase in `docs/PHASE_PLAN.md`
