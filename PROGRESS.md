# Progress Tracker

> **Claude Code: read this file fully before doing anything else.** Update it before you
> stop working, every time — see `CLAUDE.md` §0 for the exact rule. This file is the only
> thing that survives a context reset; treat every edit to it as important as an edit to code.

Last updated: 2026-08-20
Repo status: git initialised, Phases 0–9 committed

---

## Current phase

> **Phases 0–9 complete.** Currently starting **Phase 10 — Skills (floating AI ecosystem),
> Contact, Footer** (see `docs/PHASE_PLAN.md`). Phase 9 is structurally finished but
> **visually incomplete until the image assets land** — see Blockers.

## Phase checklist

- [x] Phase 0 — Project Setup & Foundations
- [x] Phase 1 — Content Intake & Information Architecture
- [x] Phase 2 — Design System Implementation (tokens + base UI primitives)
- [x] Phase 3 — Global Interaction Layer (cursor, GSAP+Lenis wiring, magnetic wrapper)
- [x] Phase 4 — Loader & Navbar
- [x] Phase 5 — Hero Section + Constellation Effect (hero-ambient)
- [x] Phase 6 — About Section (text reveal, portrait-tied constellation)
- [x] Phase 7 — Services (bento grid, magnetic 3D cards)
- [x] Phase 8 — Experience Timeline
- [x] Phase 9 — Projects Showcase + Certifications & Awards
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

### Session 1 (cont.) — 2026-08-21 — Phase 9: Projects + Certifications & Awards
**Did:**
- **`MediaFrame`** — one image slot with one placeholder treatment, used by *every* image on
  the site. While an asset is `null` it renders a labelled placeholder occupying **exactly**
  the space the real file will, so dropping images in later cannot shift layout or disturb the
  animation geometry built on top. `sizes` is a required prop (a wrong one costs real bytes)
  and everything is `loading="lazy"` except an explicitly `priority` hero.
- **`ProjectCard`** — the reveal choreography, sequenced with one parent variant's
  `delayChildren`/`staggerChildren` rather than four hand-tuned delays: image starts zoomed
  under a dark overlay → overlay fades → title slides in → tech tags stagger. Desktop-only
  hover parallax shifts the *image* toward the cursor inside the card bounds (max 14px), gated
  on `usePointerEffectsEnabled` so touch/reduced-motion sessions never attach the listener.
- **`/projects/[slug]` built this phase.** Next.js 16 removed synchronous `params`, so the page
  and `generateMetadata` both `await props.params` and use the generated
  `PageProps<"/projects/[slug]">` helper. `generateStaticParams` prerenders all three — the
  build output confirms three `● (SSG)` routes. Layout: back control, type eyebrow, gradient
  title, pitch, priority hero image, Role/Type/Date/Stack as a real `<dl>`, Abstract, and
  live/repo buttons that are **omitted entirely while null** rather than rendered disabled.
- **Certifications & awards gallery** with the `All / Projects / Certifications / Awards`
  tabs, as a real `role="tablist"`, filtering client-side. A credential with a `url` opens it;
  one without opens `CredentialLightbox` — so neither is ever a dead click.
- **`CredentialLightbox`** is a real modal dialog, not a styled div: `role="dialog"` +
  `aria-modal`, focus moved in on open and returned to the trigger on close, Escape closes,
  Tab is trapped inside, and body scroll is locked while open.
- Fixed a genuine bug while testing it: the focus effect depended on `onClose`, which is an
  inline arrow and therefore a new identity every render — so the effect re-ran constantly and
  re-captured "previously focused" as the dialog itself. `onClose` now lives in a ref and the
  effect depends on `open` alone.
- Also moved the placeholder label off the card's bottom edge (`pendingClassName`), because
  with every image still missing it was colliding with the project title.

**Verified (via `scripts/cdp.mjs`):**
- Tabs: `All → 3 project articles`, `Projects → 3`, `Certifications → 5`, `Awards → 6`,
  back to `All → 3`, with `aria-selected` tracking and **`url=/` unchanged throughout** — the
  grid swaps with no navigation or reload.
- Lightbox: focus moves into the dialog, body scroll locks, Escape closes, focus returns to
  the trigger, scroll unlocks.
  **Testing note for Phase 14:** a scripted `.click()` does not focus the button, so focus
  restoration reads as broken unless the probe calls `trigger.focus()` first. Same class of
  artifact as the `:focus-visible` one in Phase 7 — check the harness before believing the
  failure.
- Detail page: `title=Pest Eye — Abdul Qadir` (distinct per route, ready for Phase 13), h1,
  back control, `Role/Type/Date/Stack` all present, **zero anchors without an `href`** — the
  missing live links degrade to a "Live link coming soon" line rather than a dead button.
- Grid reflow: 1 column at 390, 3 at 1424, no horizontal overflow at either; cards finish at
  `opacity: 1` under normal *and* reduced motion (the reveal never leaves content invisible).
- 14 pending placeholders currently render — 3 project heroes + 5 certificates + 6 awards.
  That number should drop to 0 as assets arrive.

**Next up:** **Phase 10 — Skills, Contact, Footer.**
- Skills is the one to be careful with: it must be the **floating orbiting ecosystem**, a third
  config of `ConstellationCanvas`'s line-connection approach — *not* progress bars and not
  cards. `DESIGN_SYSTEM.md` explicitly retires the old site's bars, and PHASE_PLAN says to
  double-check this specifically because bars are the easy default to fall back into. Map
  `coreSkills[].proficiency` to node size/glow and reveal the number in a hover/info panel;
  render `skillGroups` as a plain tag list and `spokenLanguages` as circular badges.
- Contact: `contact.formEnabled` is still `false`, so **ship the three direct links** and keep
  the form flagged — that is what PHASE_PLAN says to do while the decision is unconfirmed.
- Footer, then Phases 11–14.

**Blockers / open questions:** unchanged, and now the single biggest gap in the build. Phase 9
is structurally complete but visually incomplete without: 3 project hero images, 5 certificate
images, 6 award images, the About portrait, the résumé link, and the project live/repo links.
Everything degrades gracefully in the meantime. The contact-form-vs-links call is needed before
Phase 10 finishes.

### Session 1 (cont.) — 2026-08-21 — Phase 8: Experience Timeline
**Did:**
- `Experience` rebuilt around `content/data.ts`'s pre-merged `timeline` export, so work and
  education render in **one** list — the Phase 8 decision, implemented. Education entries carry
  an accent "Education" badge against work's neutral "Work" badge, and the work arrangement
  ("Hybrid" / "Onsite") is a third badge where the data has one.
- **Two separate mechanisms, on purpose** — this is the part to understand before changing it:
  1. *The line grows with scroll* — GSAP ScrollTrigger, `scrub: true`, animating `scaleY` on a
     `origin-top` rail from `top 70%` to `bottom 70%`. Scrubbed, so it retracts on the way back
     up; a fixed-duration draw would fail the acceptance criterion outright.
  2. *The active node glows* — an IntersectionObserver over a middle band. This is a
     "what am I reading" question, not a scroll-progress one, so it is deliberately not derived
     from the scrub.
- Markup is a real `<ol>` of `<li>`s, so assistive tech announces an ordered list of six items
  rather than a run of headings. Rail geometry lives in a `.timeline-rail` component class in
  `tailwind.config.ts` (the 7px/11px offsets align it to the centre of the 16px/24px nodes).
- Under reduced motion no ScrollTrigger is created and the rail renders fully drawn.

**Verified (via `scripts/cdp.mjs`):**
- **The scrub genuinely retraces.** Sampling the rail's `scaleY` down the section and back up:
  `0.000 → 0.569 → 0.919 → 1.000`, then `0.919 → 0.569 → 0.000` on the way up — the same values
  in reverse, which is only possible if it is tied to scroll position rather than fired once.
- Active node tracks while scrolling (`pyora-full-stack` → `octanet-intern` →
  `air-university-bscs`).
- `listTag=OL` with `items=6`, and all six ids present including both education entries — they
  are not dropped.
- Reduced motion: `scaleY=1.000` immediately, no scrub.
- Screenshot confirms the growing gradient rail, the glowing active node, and the badges.

**Next up:** **Phase 9 — Projects Showcase + Certifications & Awards.** This is the biggest
remaining phase and the first one that is genuinely asset-blocked. Build it anyway — every
image path already degrades to `null` in `content/data.ts`:
- Project cards on `/`: scroll-in image reveal (zoomed image + dark overlay fading out, title
  sliding in, tech tags staggering after), and a desktop-only hover parallax where the image
  shifts slightly toward the cursor inside the card bounds.
- **Build the `/projects/[slug]` route this phase** — `getProject(slug)` and `projectSlugs` are
  already exported and waiting. Next.js 16 has **async `params`**; check
  `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` before writing the
  page, and use `generateStaticParams`. Each page needs hero image, title, pitch, a
  Role/Type/Date/Stack meta block, Abstract, a "Live Preview" button that is **hidden or
  disabled while `liveUrl` is null** (never a dead click), and a Back control to the homepage
  projects section.
- Certifications & Awards as a lighter secondary gallery with `All / Projects / Certifications
  / Awards` filter tabs that swap the grid client-side with no reload. Cert/award items open a
  link, or a simple image lightbox when `url` is null.
- `next/image` everywhere, lazy below the fold, real alt text from the content (never a
  filename). While images are `null`, render the placeholder treatment the About portrait
  already uses as a model.

**Blockers / open questions (unchanged, now urgent):** the three project hero images, the five
certificate images, the six award images, the About portrait, the résumé link, the project
live/repo links, and the contact-form-vs-links decision. Phase 9 can be *structurally*
complete without them, but it cannot be visually finished.

### Session 1 (cont.) — 2026-08-21 — Phase 7: Services
**Did:**
- `components/ui/icons.ts` — the `IconName` → `LucideIcon` registry, so `content/data.ts`
  stays free of React imports. **Typed `Partial<Record<...>>` on purpose:** `lucide-react` v1
  no longer ships brand marks, so there is no `Github` / `Linkedin` / `Instagram` icon to map
  to. They are absent rather than aliased to some unrelated glyph. See the decision log; Phase
  10 decides between text labels and inline SVG for the socials.
- `TiltCard` — mouse-following 3D tilt on spring-smoothed `rotateX`/`rotateY`, plus the
  cursor-following spotlight (it writes `--spot-x` / `--spot-y`, which the `.card-spotlight`
  radial gradient reads; custom properties inherit, so the glow lives on the inner card while
  the pointer maths lives on the wrapper). `maxTilt` defaults to **5°** — `DESIGN_SYSTEM.md`
  sets 3–6° as a *cap*, not a target. Not mounted at all for touch/reduced-motion users, where
  it renders as a plain wrapper.
- `Services` section: bento grid over three columns with the first and last card spanning two,
  so the rhythm is 2+1 / 1+2 rather than a flat 2×2. Icons rotate and scale on hover
  (`motion-reduce:transform-none`), icon and text carry `data-depth` for the parallax, each
  card is wrapped in `MagneticWrapper`, and entrance is a Framer Motion `whileInView` stagger
  (`once: true`).
- `GlassCard` now forwards native HTML attributes, so the cards can be `tabIndex={0}` and
  `aria-labelledby` their own title.
- Replaced the section's first-draft heading/description: it both trailed off mid-sentence and
  invented marketing copy. The heading now uses `CONTENT_BRIEF.md`'s own section title
  ("Services / What I Do") — `CLAUDE.md` §1 says not to invent copy.

**Verified (via `scripts/cdp.mjs`):**
- **Tilt stays inside the cap:** recovering the angles from the computed 3D matrix gives
  `rotX=-4.80° / rotY=4.80°` with the pointer in the top-left corner, `+4.74° / -4.81°` in the
  bottom-right, and `0.00° / -0.00°` at the centre. Within 3–6°, and it returns to flat.
- **The keyboard equivalent genuinely works.** This needed a real key event: a programmatic
  `element.focus()` does *not* satisfy `:focus-visible`, and reading styles after one reports
  the unfocused card and looks like a bug. Driving a real Tab through CDP,
  `matchesFocusVisible=true`, the border becomes `rgba(139, 81, 239, 0.27)` (the violet
  `--border-hover`) and a 2px violet outline appears — the static treatment that stands in for
  tilt and spotlight.
- **Grid reflow measured, not eyeballed:** `grid-template-columns` resolves to **1 column at
  390px, 2 at 834px, 3 at 1424px**, with no horizontal overflow at any of them. `TiltCard` is
  mounted only at desktop and absent under touch emulation.
- Screenshots at 1424 and 834 confirm the bento proportions and that tablet width is actually
  used rather than collapsing to a single column.

**Tooling:** `scripts/cdp.mjs` gained `--press-tab N` (dispatches real Tab keypresses through
the input pipeline) and `--then <script.js>` (evaluates a second script afterwards). Phase 14's
full keyboard pass should use these rather than `element.focus()`.

**Next up:** **Phase 8 — Experience Timeline.** `content/data.ts` already exports `timeline`
with work and education pre-merged reverse-chronologically and a `kind` discriminant, so the
data work is done. Build: a vertical line that **grows as you scroll**, GSAP ScrollTrigger with
`scrub` (a fixed-duration Framer draw fails the criterion — scrolling back up must retract it),
one node per entry, the node nearest the viewport glowing, and the whole thing marked up as a
real ordered list so a screen reader announces it as one. Education entries get a small type
badge (`Badge tone="accent"` is already there) — this is the phase where that decision lands,
so do not drop them. Verify the retraction the same way the Phase 6 reveal was verified:
sample the line's height at several scroll positions going down *and* back up.

**Blockers / open questions:** unchanged — portrait, project and certificate images, plus the
contact-form-vs-links call before Phase 10.

### Session 1 (cont.) — 2026-08-21 — Phase 6: About Section
**Did:**
- `ScrollRevealText` — per-word progressive reveal, **GSAP ScrollTrigger with `scrub: true`**
  (not `whileInView`, which cannot satisfy this phase's acceptance criterion). Words start at
  `--text-secondary` / 45% opacity and brighten to `--text-primary` / 100% as the paragraph
  crosses the reading band (`top 80%` → `bottom 55%`). Under reduced motion no ScrollTrigger
  is created at all and the paragraph renders fully bright — importantly, the *base* class is
  `text-text-primary` in that case, so text is never left stuck at 45% waiting for a scroll
  that will never come.
  - One layout detail worth keeping: each word is its own `inline-block` span and **the space
    is rendered between spans, not inside them**. A trailing space inside an `inline-block`
    collapses, which runs every word together.
- `About` section: `SectionHeading`, the bio from `content/data.ts` through `ScrollRevealText`,
  a portrait column, a small Focus/Backend/Frontend definition list, and location badges.
- **Portrait-tied constellation** — the same `ConstellationCanvas` from Phase 5 with different
  props, exactly as the plan requires (no second implementation): `connectionDistance` 62 vs
  the hero's 130, `glow` 12 vs 6, `parallaxStrength` **0** (the hero's whole-field drift is
  wrong here) and `attractStrength` **0.55** so nodes visibly pull toward the cursor over the
  portrait, with connecting lines brightening while the pointer is over it.
- **Portrait asset is still missing.** Per `PHASE_PLAN.md` Phase 6 the section is built around
  it: a placeholder holds the exact `aspect-portrait` (4/5) box the real image will occupy, so
  dropping the asset in cannot shift the layout. `identity.portrait` is typed
  `ContentImage | null` in `content/data.ts` and the `next/image` branch is already written —
  filling that field in is the *only* change needed.

**A real bug found while measuring, not reading:** the constellation's "scale down on smaller
viewports" rule was keyed off **canvas** width rather than viewport width. The About portrait
canvas is only ~380px wide, so on a 1440px desktop it was silently taking the mobile branch,
and the old `particleCount * (width / 1440)` scaling would have thinned a deliberately dense
small cluster down to a handful of dots. It now keys off `window.innerWidth`, and the
per-context count is the caller's to choose — which is what the requirement actually says.

**Verified (via `scripts/cdp.mjs`):**
- **The reveal is genuinely scrubbed.** Sampling a mid-paragraph word while scrolling down and
  then back up the same positions: `rgb(156,163,175)`/0.45 before → `rgb(245,246,250)`/1.00 in
  the middle → and **back to `rgb(156,163,175)`/0.45 on the way up**. A fire-once animation
  would have stayed bright. The desktop screenshot also caught it mid-scrub, with the last ten
  words still dim.
- **The portrait field is measurably denser than the hero's:** 25.2 vs 6.2 particles per
  100k px² on desktop (70 particles over 1409×805 vs 46 over 382×478), and 18.0 vs 8.5 on
  mobile. Both the count and the connection distance differ, so the shared component is
  genuinely doing different work in each context.
- Reduced motion: words are `rgb(245,246,250)`/1.00 before *and* after scrolling, and the
  portrait canvas produces byte-identical frames over 900ms (static, no loop).
- Screenshots at 1440 and 390: layout stacks correctly, no overflow, navbar in its glass state
  with the About nav item underlined.
- `npm run lint`, `npm run build` clean; no arbitrary Tailwind values, no raw hex.

**Tooling:** `scripts/cdp.mjs` gained `--screenshot <path>`, which captures **after** the
script runs. This matters more than it sounds: plain `chrome --screenshot` renders a blank
frame for any page that has been scrolled, which is why earlier attempts to photograph a
mid-page section produced empty images. Every section from here on can be photographed in
place.

**Next up:** **Phase 7 — Services (bento grid + magnetic 3D cards).** The four services are
already typed in `content/data.ts` with `icon` names and checkmark sub-points; build the
`Record<IconName, LucideIcon>` lookup in the component (content stays free of React imports).
Needs: a bento grid that uses tablet width properly rather than collapsing to one column
everywhere, mouse-following 3D tilt capped at **3–6°** (a cap, not a target), a cursor-following
glow inside the card, icon/text at slightly different depths, icon rotate/scale on hover, each
card wrapped in `MagneticWrapper`, and a `whileInView` staggered entrance. The acceptance
criterion that is easiest to miss: **`:focus-visible` must get an equivalent static
glow/border**, because tilt and spotlight have no keyboard analog — `GlassCard`'s `interactive`
prop already does exactly this, so use it rather than re-inventing the focus state.

**Blockers / open questions:** unchanged — portrait and project/certificate images are the
outstanding asks, and the contact-form-vs-links decision is needed before Phase 10 ships.

### Session 1 (cont.) — 2026-08-20 — Phase 5: Hero + Constellation
**Did:**
- **`ConstellationCanvas`** — the one canvas implementation for all three contexts, built
  generic from the start as `PHASE_PLAN.md` insists. Every difference between contexts is a
  prop: `particleCount`, `mobileParticleCount`, `connectionDistance`, `min/maxRadius`,
  `speed`, `nodeColor`, `lineColor`, `glow`, `parallaxStrength`, and
  `attractStrength`/`attractRadius`. **Phase 6 and Phase 10 must pass different props to this
  component, not write a second one.** Implementation notes: devicePixelRatio-aware sizing
  (capped at 2) via `ResizeObserver`; particles *wrap* rather than bounce (bouncing makes the
  field visibly breathe against the edges, which reads as motion instead of ambience);
  connecting-line opacity falls off linearly with distance; pointer attraction is eased toward
  its target each frame instead of snapping; the rAF loop stops on `visibilitychange` and on
  unmount; under reduced motion it draws **one frame and never starts a loop**.
- Hero-ambient instance wired: 70 particles at 1440px, 130px connection distance, parallax
  only (no attraction — that is the portrait's configuration in Phase 6).
- `Typewriter` — self-contained, cycles all three `identity.roles`, types/holds/deletes. Every
  state change happens inside the timer rather than in the effect body (React's
  cascading-render lint rule is right about this). Under reduced motion it renders the first
  role as plain static text with no timers at all. The animating text is `aria-hidden` and a
  stable `sr-only` label carries all three roles, so a screen reader is not read a
  character-by-character stream.
- Hero section: copy entirely from `content/data.ts`, staggered entrance, CTAs wrapped in
  `MagneticWrapper` with `EXPLORE` / `OPEN` cursor labels, and an animated scroll-down arrow.
- **`scripts/cdp.mjs` gained `--viewport 390x844`**, which sets device metrics *and* enables
  touch emulation — device metrics alone do not flip `(hover: none)` / `(pointer: coarse)`.
  This finally closes the gap flagged in Phase 3.

**A real bug caught by looking at the SSR output, worth understanding before touching the
hero again:** the hero was first built with a Framer Motion staggered entrance. That
server-renders `style="opacity:0"` onto the `<h1>` — which is this page's **LCP element**. It
would have stayed invisible until hydration, and forever with JS disabled, against a
Lighthouse Performance ≥ 90 budget. The entrance is now a **CSS** animation (`.rise-in`, with
an inline `animation-delay` per child for the stagger), which starts at first paint with no JS
and no framework involved. Confirmed in the served HTML: the `<h1>` now ships its real text
with only `animation-delay` inline and no opacity. A side benefit is that `Hero` went back to
being a Server Component — only the canvas, typewriter and magnetic wrappers are client
components. See the decision log for why this is not treated as abandoning Framer Motion.

**Verified (all via `scripts/cdp.mjs`, i.e. with a real rendering loop):**
- Canvas genuinely paints and animates frame to frame; the loop **stops** while the tab is
  hidden (`visibilitychange` → no pixel changes at all) and **resumes** when visible.
- Under reduced motion: exactly one static frame, unchanged over 1.2s; role line static on
  "Full Stack AI Engineer"; cursor absent. Computed `animation-name` is `none` for the scroll
  arrow, the ambient orbs and the grain layer — checked as computed style, not class names.
- Typewriter observed mid-cycle deleting "ML Engineer", so it is cycling past variant 1.
- **Particle scaling: 68 particles at 1440px vs 28 at 390px** (the canvas exposes
  `data-particles` so this is asserted, not guessed).
- At 390x844 with touch emulation: no horizontal overflow, hamburger shown, desktop nav
  hidden, and **the cursor is not mounted** while `(hover: none)`/`(pointer: coarse)` are
  true — the touch branch is now empirically confirmed, not just reasoned about.
- Frame cadence with constellation + cursor + grain all running: **median 16.70ms / p95
  16.70ms (60fps) under mobile emulation**, and a locked 30fps on desktop headless — that is
  `--disable-gpu` vsync-capping, not jank, and the giveaway is that p95 (33.40ms) is
  essentially identical to the median (33.30ms). Zero frame-time variance attributable to our
  own work in either case. A real 60Hz laptop reading still belongs in the Phase 14 pass.
- Screenshots at 1440 and 390 both read correctly.

**Next up:** **Phase 6 — About Section.** Bio copy is already in `content/data.ts`. Three
pieces: (1) the **portrait-tied** `ConstellationCanvas` — same component, different props: a
much tighter node cluster, denser/thinner lines, glow, and a *pronounced* `attractStrength`
so nodes visibly pull toward the cursor over the portrait. The acceptance criterion is that it
is visibly tighter/denser than the hero field, so set `connectionDistance` well below the
hero's 130 and turn `attractStrength` up from 0. (2) The scroll-tied **progressive text
reveal** — words dim → bright as they cross the viewport, and it must be genuinely scrubbed:
scrolling back up has to dim them again, so a fire-once `whileInView` fails the criterion.
`scripts/cdp.mjs` can verify this directly by sampling computed colour at several scroll
positions going down *and* back up. (3) The portrait itself — **the image asset is still
missing** (Known issues); `PHASE_PLAN.md` Phase 6 explicitly says to build around it and flag
it, so use a styled placeholder holding the correct aspect ratio and keep going.

**Blockers / open questions:** none that stop Phase 6, but the portrait and project images are
now the nearest real blocker — Phase 9 cannot be finished properly without them.

### Session 1 (cont.) — 2026-08-20 — Phase 4: Loader & Navbar
**Did:**
- **`scripts/cdp.mjs` — read this before writing another verification script.** A ~150-line,
  zero-dependency Chrome DevTools Protocol driver (Node 22's global `fetch` + global
  `WebSocket`, nothing installed). It exists because `chrome --headless --dump-dom
  --virtual-time-budget` never runs the browser's rendering steps: `requestAnimationFrame`
  never ticks, `scroll` events never fire, and IntersectionObserver callbacks never run. In
  that mode *every* scroll-driven feature reads as broken when it is fine — which is exactly
  what happened here, and it cost most of this phase to work out. Run
  `node scripts/cdp.mjs <url> <script.js> [--reduced-motion]`; the script body runs in the
  page with `sleep(ms)` and a self-verifying `scrollTo(y)` available, and its return value is
  printed. It defaults to the motion path (headless otherwise reports reduced motion), waits
  for the boot loader to clear before evaluating (the loader calls `lenis.stop()`, so
  scrolling during it is silently ignored), and retries `scrollTo` until the position sticks.
  `SmoothScrollProvider` exposes `window.__lenis` in development only so the driver can
  position the page exactly.
- `useHasSeenLoader` in `lib/hooks.ts` — `sessionStorage`-backed, reads in a `useState`
  initialiser (safe: only ever called from an `ssr: false` component), and defensive against
  `sessionStorage` throwing in privacy modes.
- `Loader` — the `DESIGN_SYSTEM.md` boot sequence (initials, role, block-character progress
  bar with a live percentage, four staged status lines), ~1.3s, then a 0.4s fade. Built as a
  **single GSAP timeline** because the bar, the percentage and the four lines all have to stay
  in lockstep; `PHASE_PLAN.md` explicitly permits either library here and nothing about it is
  scroll-driven, so this does not cut across the Framer/GSAP split. Locks page scroll and
  calls `lenis.stop()` while it plays. Marked up as `role="status" aria-live="polite"`.
- `LoaderMount` gates it on reduced motion (skipped outright) and on the session flag.
  **The session is claimed when the sequence *starts*, not when it completes** — marking on
  completion meant a load interrupted part-way (tab backgrounded, navigation away) would
  replay the whole boot sequence next time, which is the opposite of the point.
- `Navbar` rebuilt: transparent over the hero → glass + border + `shadow-elevated` on scroll,
  height compacting 80px → 56px, scroll-spy via IntersectionObserver, `aria-current` on the
  active item, and a `layoutId` underline that slides between items (and simply jumps, without
  sliding, under reduced motion). Added an accessible mobile disclosure menu
  (`aria-expanded` / `aria-controls`, Escape to close, closes on link activation) — the
  desktop-only link row would otherwise have left mobile with no navigation at all.
- One z-scale for the whole site now lives in `tailwind.config.ts` — nav (30) < grain (40) <
  loader (45) < cursor (50) — after a screenshot caught the navbar rendering *through* the
  loader.

**Verified (via `scripts/cdp.mjs`, on both the motion and reduced-motion paths — identical
results):** at scroll 0 the navbar is 80px and not glass with no active item; at each of
About / Services / Contact the requested position was reached exactly, the navbar was 56px and
glass, and `aria-current` was on precisely the right item (About → Services → Contact);
scrolling back to 0 returned it to 80px, not-glass, no active item. Mobile menu: `aria-expanded`
false → true on activation with the panel mounted, and Escape returns it to false and unmounts
the panel; the header exposes 8 keyboard-focusable controls and focus moves into them.
Loader: screenshotted mid-sequence (correct layout, covering the navbar); **absent** from the
DOM under reduced motion; and a second `LoaderMount` mounted later in the same session
rendered nothing while `sessionStorage["aq.loader.seen"] === "1"` — the "don't replay on
internal navigation" requirement, tested by remount, which is what returning from a project
page will do. `npm run lint` and `npm run build` clean; still zero raw hex and zero Tailwind
arbitrary values outside `lib/tokens.ts`.

**A dead end, recorded so it is not repeated:** mid-phase I replaced the IntersectionObserver
scroll-spy with cached `offsetTop` maths because the IO version appeared not to fire — it was
the frozen-rAF artifact above, not the code. It has been **reverted to IntersectionObserver**,
which is also the right choice going forward: Phase 11 pins the hero with ScrollTrigger, which
changes section offsets during scroll, and cached offsets would go stale silently.

**Next up:** **Phase 5 — Hero Section + Constellation Effect.** Build
`ConstellationCanvas` **generic from the start** — particle count, connection distance, node
styling and interactivity strength all as props — because Phase 6 (portrait-tied) and Phase 10
(skills ecosystem) reuse this exact component with different config, and a second
implementation is the failure mode to avoid. Requirements: drift, distance-thresholded
connecting lines with opacity falloff, pointer parallax, particle count scaling down on small
viewports, `requestAnimationFrame` paused on `visibilitychange`, and **one static frame with no
loop at all** under reduced motion. Then the hero itself: copy from `content/data.ts` (already
wired), Framer Motion staggered entrance, CTAs wrapped in `MagneticWrapper`, animated
scroll-down arrow, and the typewriter role line cycling all three `identity.roles` (static
first variant under reduced motion). **Do not** build the pinned hero-shrinks-into-a-corner
transform — that is Phase 11, with GSAP, and it needs About's layout to exist first.

**Blockers / open questions:** none for Phase 5. Phase 6 needs the portrait asset from Abdul
(see Known issues) — if it has not arrived by then, build the section around a placeholder and
keep going.

### Session 1 (cont.) — 2026-08-20 — Phase 3: Global Interaction Layer
**Did:**
- `lib/hooks.ts` — `useReducedMotion`, `useIsTouchDevice`, and `usePointerEffectsEnabled`
  (the `!reduced && !touch` combination every pointer effect starts with). Built on
  `useSyncExternalStore` rather than `useState` + `useEffect`, so the value is right on the
  first client render and there is never a frame where an animation starts and is then torn
  down. **Both hooks default to the cautious value during SSR** (reduced = true, touch =
  true): assume less motion until the client proves otherwise.
- `lib/gsap.ts` — registers `ScrollTrigger` (and `useGSAP`) exactly once, and exports
  `connectLenisToScrollTrigger()`. **Import `gsap`/`ScrollTrigger` from this file, never from
  `gsap` directly**, so no component can forget the registration. Lenis drives *native*
  scroll, so no `scrollerProxy` is needed — the integration is: update ScrollTrigger on every
  Lenis scroll event, drive `lenis.raf()` from `gsap.ticker` (seconds → ms) instead of Lenis's
  own rAF so both live in one frame, and `gsap.ticker.lagSmoothing(0)` so GSAP never skips
  time and desynchronises a scrub. The returned cleanup undoes all three.
- `SmoothScrollProvider` wraps the app in `ReactLenis root options={{ autoRaf: false }}`.
  **Under reduced motion Lenis is not mounted at all** — eased scrolling is exactly what the
  setting asks us to drop, and native scroll is the right fallback. ScrollTrigger keeps
  working either way precisely because Lenis drives native scroll position.
- `Cursor` — dual layer per `DESIGN_SYSTEM.md`: outer ring on a `useSpring`
  (stiffness 220 / damping 26 / mass 0.6) that lags, inner dot on the raw motion values that
  tracks immediately. Expands to a violet-bordered filled ring over anything interactive and
  shows that element's own `data-cursor-label`. `mix-blend-difference` on the whole layer.
  Mounted through `CursorMount`, a client wrapper whose only job is that `next/dynamic`'s
  `ssr: false` is illegal in a Server Component (confirmed in the bundled Next 16 docs) — the
  gate there also keeps the chunk from ever being fetched on touch/reduced-motion sessions.
  `globals.css` hides the native cursor under a media query matching the mount conditions
  exactly, so it is never hidden without a replacement.
- `MagneticWrapper` — distance-weighted linear falloff (full strength at centre, zero at the
  radius edge), clamped to `maxTravel` (default 8px over a 120px radius), spring-smoothed,
  resets to 0 outside the radius and on pointer-leave. Renders a plain `div` — no motion
  component, no listeners — when pointer effects are off, so the wrapped control is untouched
  for keyboard and touch users.
- `Button` gained nothing new this phase but is now wired end to end: `cursorLabel` prop →
  `data-cursor-label` → the cursor's contextual label.

**Verified — the throwaway ScrollTrigger test from the acceptance criteria (now deleted):**
built a temporary `/scrolltest` route with a pinned, scrubbed box plus a probe that jumped to
a series of scroll positions and read back all four numbers at each. Lenis, `window.scrollY`,
ScrollTrigger's own scroll reading and the tween progress agreed **exactly** at every sample,
in both directions (`target=900 window=900 st=900 progress=0.75`, and scrolling back up to 600
returned the identical `progress=0.5 scale=0.675` it had on the way down). No drift, no
jitter, no fighting. The route, its probes and a temporary `/magnettest` route were all
deleted; `lib/gsap.ts` is what remains.
- Cursor and Lenis are **present** in the DOM with motion allowed and **absent** (not hidden)
  under reduced motion — checked by dumping the DOM in both states.
- `MagneticWrapper` measured numerically: at a 120px radius and 8px max travel, a pointer 60px
  from centre produced exactly 4.00px of travel and 119px produced 0.07px — textbook linear
  falloff — while 121px (just outside the radius) and 400px both produced 0. The spring's
  visual interpolation was then confirmed by screenshot diff: with the pointer to the right,
  the button's rightmost pixel moved 541 → 544 mid-flight toward its target.

**Headless-browser gotchas worth not rediscovering (this cost real time):**
- **Headless Chrome reports `prefers-reduced-motion: reduce` by default.** Every screenshot
  and DOM dump so far was silently testing the reduced-motion path. Pass
  `--force-prefers-no-reduced-motion` to test the real one.
- **`requestAnimationFrame` does not tick under `--dump-dom --virtual-time-budget`** (a frame
  counter stayed at 4 for an entire run), so no spring/GSAP-ticker animation can be *observed*
  that way — read the underlying motion value instead. `--screenshot` does force paint, and
  with `--run-all-compositor-stages-before-draw` it captures mid-animation.
- Headless Chrome clamps its window to 500px wide (already noted under Phase 2 — use an
  iframe harness for real mobile widths).

**Not verified here, flagged for Phase 14:** the touch-device branch. `(pointer: coarse)`
cannot be forced in this headless setup, so `useIsTouchDevice` is verified by code path only —
it is the same `usePointerEffectsEnabled` gate whose reduced-motion branch *was* confirmed to
unmount everything. Confirm on a real phone during the Phase 14 device pass.

**Next up:** **Phase 4 — Loader & Navbar.** `useHasSeenLoader` (new hook in `lib/hooks.ts`,
`sessionStorage`-backed, SSR-safe) gating a `Loader` that runs the boot sequence from
`DESIGN_SYSTEM.md` in ~1–1.5s and is **skipped entirely — not merely sped up — under reduced
motion**. Then the `Navbar`: transparent over the hero → glass/blurred/bordered with a height
reduction on scroll, scroll-spy active-section indicator, animated underline. Framer Motion
for both (the navbar is a discrete state transition, not a scrub — do not reach for
ScrollTrigger). `navItems` is already in `content/data.ts` and every section stub already
carries its final `id`, so the scroll-spy has real targets. Remember to re-check the navbar
against `--force-prefers-no-reduced-motion` or you will be testing the wrong path.

**Blockers / open questions:** none for Phase 4.

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
- **2026-08-21 (Phase 7) — `lucide-react` v1 has no brand icons.** `CLAUDE.md` §2 makes
  lucide the sole icon set, but v1 removed GitHub / LinkedIn / Instagram marks. Rather than
  map them to unrelated glyphs, `components/ui/icons.ts` simply omits them and socials render
  as text labels for now. If brand marks are wanted, add them as inline SVG in Phase 10 — do
  **not** install a second icon package.
- **2026-08-20 (Phase 5) — the hero's entrance is a CSS animation, not Framer Motion.**
  `CLAUDE.md` §2 assigns entrances to Framer Motion, and that still holds everywhere else
  (Navbar, Cursor, MagneticWrapper, and the Phase 11 `Reveal` component all use it). The hero
  is the one exception because Framer server-renders `opacity: 0` onto the `<h1>`, and that
  `<h1>` is the page's LCP element: it would be invisible until hydration and permanently
  invisible without JS, against a Lighthouse Performance ≥ 90 budget. The `.rise-in` class in
  `tailwind.config.ts` starts at first paint instead and collapses to no animation at all
  under reduced motion. This is a substitution of *technique*, not of the dependency — no
  package was added or dropped. If you ever move the hero entrance back to Framer Motion,
  re-check the served HTML for an inline `opacity:0` on the heading first.
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
- **Service sub-points are derived, not supplied.** The checkmark bullets under each service
  card (e.g. "React front-ends", "Business process automation") are condensed restatements of
  that service's own description in `CONTENT_BRIEF.md` — `PHASE_PLAN.md` Phase 7 asks for
  sub-points but the brief does not list any. No new claims were introduced, but Abdul should
  read them over and reword if he'd put it differently.
- **Award issuer names** were only partly legible in the source screenshots; confirm exact
  organisation names with Abdul before spelling any of them out beyond what the brief lists.

## Lighthouse scores (fill in during Phase 14)

| Category       | Score | Date |
|----------------|-------|------|
| Performance    |       |      |
| Accessibility  |       |      |
| Best Practices |       |      |
| SEO            |       |      |
