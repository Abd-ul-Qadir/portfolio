# Progress Tracker

> **Claude Code: read this file fully before doing anything else.** Update it before you
> stop working, every time — see `CLAUDE.md` §0 for the exact rule. This file is the only
> thing that survives a context reset; treat every edit to it as important as an edit to code.

Last updated: 2026-08-26
Repo status: git initialised, Phases 0–14 committed except the Vercel deploy, which is
blocked on Abdul's account. Real image assets wired in. The constellation has since been
replaced by an interactive neural field — see the newest session-log entry.

---

## Current phase

> **Phase 14 substantially complete — the build is finished and shippable.** Everything in
> Phase 14 is done except **deploying to Vercel**, which needs Abdul's account, and the
> final Lighthouse run against the production URL that depends on it. See Blockers.

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
- [x] Phase 10 — Skills (floating AI ecosystem), Contact, Footer
- [x] Phase 11 — Scroll Choreography Pass (flagship GSAP hero transform)
- [x] Phase 12 — Section-Transition Macro-Layer
- [x] Phase 13 — 404, Metadata & SEO Pass
- [~] Phase 14 — Performance, Accessibility, Easter Egg & Launch *(all but the Vercel deploy)*

*(Only check a box once its acceptance criteria in `docs/PHASE_PLAN.md` are actually met —
not when the happy path looks fine.)*

---

## Session log

> Append a new entry every session. Do not delete old entries — this is the project's
> memory. Newest entry on top.

### Session 2 (cont.) — 2026-08-26 — Ecosystem: lit nodes, data flow, and axis rotation

Abdul: "still needs improvements", then "make it rotate on its axis".

**The nodes were reading as holes, not nodes.** They were `bg-bg-glass` — a 4% white film — which
against this background renders as a dark disc. Replaced with `nodeFill()`, a radial gradient
scaled by the same proficiency that already drives size and glow, so each one reads as lit from
within. It also stops the connecting line showing through the middle of the circle it ends at.

**The real problem was that the background was beating the foreground.** The site-wide field is
now dense and bright (previous entry), and its `clusters` stage puts its densest knots at roughly
the radius the skill nodes orbit at — so React.js, Agentic AI and Python were each sitting inside
a background cluster and disappearing into it. Added `.ecosystem-scrim`: a radial well that dims
the field *only* under the ecosystem and fades to nothing well before its edge, so the background
stays dense everywhere else. Radial specifically so it has no visible boundary.

**Data flow along the connections**, per `DESIGN_SYSTEM.md`'s constellation language: one short
dash sweeping each line inward toward the hub (`synapse-flow`), staggered per connection so they
never pulse in unison. Pure CSS on an SVG stroke — no JS, no per-frame work — and
`motion-reduce:animate-none` stops it dead. A faint dashed orbit ring was added too: with four
nodes on a cross, the path they sit on is what makes "orbiting" legible rather than static.

**Rotation on its axis.** One wrapper holds the connections, ring and nodes and spins
(`ecosystem-spin`, 48s linear); each node's content counter-spins by exactly the same amount
(`ecosystem-counterspin`). **The two must share duration and timing** or labels tumble upside
down at the halfway point. The counter-rotation is on its own element so it cannot collide with
the Framer transform the button uses for its float. The hub and the info panel sit **outside** the
rotating wrapper — the hub is the axis and its lettering must stay upright, and the panel is UI.

*One mistake worth recording:* the first attempt closed the rotating wrapper before the node
list, because the hub is rendered between the `<svg>` and the `<ul>` in DOM order. The result was
lines rotating while the circles and labels stayed put — which Abdul spotted before I had
finished the fix. The hub now renders after the wrapper, which also paints it correctly on top of
the connections.

**Verified:** all four nodes travel 124–146px over 4s while accumulated label rotation stays
**0° → 0°** through the whole chain; under reduced motion movement is **0px** and labels are still
upright. `build`, `lint`, `tsc --noEmit` clean.

### Session 2 (cont.) — 2026-08-26 — Hero portrait bleeds to the screen edge

Abdul asked twice for the portrait moved "to right side border because my right arm is not
full". Aligning it right *within its box* (previous entry) was not what he meant — the portrait
still stopped at `Container`'s content gutter with ~175px of page margin beyond it.

New `.bleed-right` cancels exactly two things: the container's own right padding (`sm:px-8`), and
half of whatever the viewport has over `max-w-6xl` — i.e. the centring margin. `max()` clamps the
second term to zero below 72rem, where the container is already full-width and only the padding
needs cancelling. **Values are tied to `Container`'s and must change with them.**

Measured: flush at 1024px (gap 0), and at 1424px it overshoots the usable width by 8px. That is
`100vw` including the scrollbar, and it is the preferable direction to err for a bleed — the hero
is `overflow-hidden`, so the overshoot is clipped rather than producing a scrollbar, and
overshooting guarantees no sliver of background between the image and the edge at any width.
Confirmed no horizontal scrollbar at either size.

### Session 2 (cont.) — 2026-08-26 — Reveal rim dropped; portrait aligned right

**The cyan rim is gone.** Abdul: "remove the cyan color circle radius visually." It read as a
hard circle drawn onto the portrait rather than as a reveal. The `.portrait-reveal-rim` class and
its element are deleted; the feathered mask is now the only thing marking where the two versions
meet, which is what the effect wanted in the first place. The faint scanlines stay — they are
neutral white and carry the "scanning" read without drawing an outline.

**Portrait aligned right.** Abdul: "move my picture to right side border because my right arm is
not full." The cause is a ratio mismatch: the photo is 2:3 inside a 4:5 box, so `object-contain`
fits it by height and **letterboxes it horizontally by 75px** — it was floating centred with a
gap on each side, so the shoulder ended in mid-air and read as cropped. `object-right-bottom`
puts the whole gap on the left and the subject flush to the container's right edge, where it
reads as continuing past the boundary.

**⚠ Three things share one object-position and must be changed together:** the normal image, the
robotic image, and **`.portrait-reveal`'s silhouette mask** (`mask-position`). The mask mirrors
`object-position` so the clip lands on the rendered subject; because `contain` letterboxes by
75px here, any disagreement slides the clip off the subject by that much. Verified after the
change: images and mask all report `100% 100%`.

Note the portrait still stops at the Container's right edge, ~175px short of the viewport edge —
that is the page's content gutter, not a gap in the image. Making it bleed to the viewport edge
is a separate layout change, not done.

### Session 2 (cont.) — 2026-08-26 — Hero portrait: cursor-following AI reveal

Abdul supplied `robotic_portrait.jpeg` — the same pose, chrome-plated with cyan circuitry — and
asked for it revealed under the cursor inside the hero portrait, never as a hover swap. New
`components/effects/HeroPortraitReveal.tsx`.

**Containment is structural, not enforced by the mask.** The robotic source has an opaque grey
backdrop, so revealing a circle of it near the silhouette's edge would paint a grey patch outside
the subject. `scripts/cutout.py` now keys it with the **same matte** as the normal cut-out
(eroded 4px, since the robot's body is broader in places and the shared matte otherwise let a
band of its backdrop through along the arms). Verified `alpha identical: True` before the erode —
the two silhouettes cannot disagree.

**No React state.** Pointer position, radius and openness are written as CSS custom properties
(`--rx`/`--ry`/`--rr`/`--ro`) from a rAF loop that starts on pointer entry and **stops itself**
once the window has eased shut, so an idle hero costs nothing. Position eases at 0.22/frame and
radius at 0.12, which is the deliberate slight lag. Gated by `usePointerEffectsEnabled()` —
verified that on touch and under reduced motion the component renders nothing and the robotic
image is **not even downloaded**.

**⚠ Two bugs worth recording, both found by looking at a screenshot rather than the code.**

1. **`radial-gradient(circle <percentage>)` is invalid CSS.** An explicit `circle` radius must be
   a `<length>`; percentages are only legal on `ellipse`. The first version drove `--rr` as a
   percentage, which made the whole `mask-image` declaration invalid — and **an invalid mask
   fails *open***, so instead of hiding the layer it painted the entire box: a solid cyan
   rectangle over the portrait. The radius is now computed in px from the measured box (a
   `ResizeObserver` keeps it current). *An invalid mask does not degrade quietly — it shows you
   everything.*
2. **The rim and scanline layers were not clipped to the subject.** They are plain boxes; only
   the robotic image carried the silhouette alpha. Near an edge they painted cyan crescents into
   the empty space beside the shoulder — Abdul reported this as "edges are not smooth", and it
   was spill, not aliasing. Fixed by masking the **container** with the cut-out
   (`mask-size: contain`, `mask-position: bottom center`, mirroring the images'
   `object-contain object-bottom`), which clips the whole subtree at once and will keep clipping
   anything added there later.

The reveal edge also gained a five-stop feather, and the rim was cut to a narrow annulus at 0.2
opacity — at its first width it read as a bold cyan donut and its screen blend tinted the whole
revealed area.

**About is unchanged and uses the raw photo**, background intact, per Abdul.

`build`, `lint`, `tsc --noEmit` clean (the one warning is the pre-existing unused
`spokenLanguages` from Abdul's own edit to `Skills.tsx`).

### Session 2 (cont.) — 2026-08-26 — New portrait, keyed and wired into both slots

Abdul dropped `public/portrait2.jpeg` (832x1248) and asked for it used, background removed if
needed. It replaces the old photo in **both** portrait slots.

**The preview lied about the source.** Rendered previews show it as a subject on a *light grey*
backdrop; the actual pixels are dark — the backdrop runs L~70-140 with a vignette down to ~23 at
the bottom corners, while the suit is L~20-60. The background therefore sits **between** the suit
and the skin in luminance, and at the bottom it is as dark as the subject, so **no luminance or
chroma threshold separates them**. Sampling the file rather than trusting the preview is what
avoided building the wrong keyer.

**What does separate them is the silhouette edge**, which is strong everywhere it matters. So:
build a barrier from the colour gradient, flood the non-barrier region inward from the frame
border, and whatever the flood cannot reach is the subject. Confidence check: subject coverage is
**59.2%** of the frame and barely moves across edge thresholds from 14 to 36 — a leak would
collapse it toward 0, a failed barrier would push it toward 100. Bottom 10% is faded out, since
the torso runs off-frame and the vignette makes the key least reliable exactly there.

**`scripts/cutout.py` is committed this time.** The previous cut-out came from an uncommitted
one-off, and this file had to carry a note saying it must be re-derived by hand if the photo ever
changed. A new photo is now one command: `python scripts/cutout.py`. Needs only Pillow, numpy and
scipy — no OpenCV, no ML background remover.

**Both slots use the cut-out, including the framed About one.** Using the raw photo there was
tried first and rejected on evidence: its mid-grey backdrop reads as a bright rectangle punched
into a dark page, and — concretely — it **hid the portrait-tied constellation** Phase 6 layers
over that frame, since violet nodes on light grey are invisible. With the background keyed the
subject sits on the glass panel, the frame stays dark, and that field is legible again.

**Verified:** 17 images on the page, **0 broken, 0 without alt text, 0 whose alt is a filename**;
both portrait slots resolve to `/portrait2-cutout.png` and are served at correctly-sized variants
(598x897 hero, 384x576 About). `build`, `lint`, `tsc --noEmit` clean.

**Left alone, flagged rather than changed:** `public/portrait.png` (996K) and
`public/portrait-cutout.png` (744K) are now unreferenced — 1.7MB that still ships. They are in
git, so deleting them is safe and reversible, but they are Abdul's photos and that is his call.

### Session 2 (cont.) — 2026-08-26 — Connections attach; the background was never un-interactive

Abdul: "gap between nodes and its connecting lines. and background neural networks animation is
not interactive on moving mouse pointer."

**1. The gap had two causes, and the larger one was not the gap constant.** `LINE_GAP` was 1.1
viewBox units (~7px), but measured gaps were 8/10/**3**/3px — inconsistent, which the constant
alone cannot explain. The rest was the per-node float: each node bobbed ±8px on its own timer
while its connection is drawn in the SVG and does **not** bob with it, so every circle detached
from the end of its own line, by up to 8px, on a loop. Removing the float and setting `LINE_GAP`
to 0 gives a measured **0px gap on all four**, permanently. The orbit's rotation still supplies
the "gently floating/orbiting" motion `DESIGN_SYSTEM.md` asks for, and it moves the lines and the
nodes together, so the geometry cannot drift.

**2. ⚠ The background was interactive the entire time — it was covered.** Measured before
changing anything: luminance under the cursor **9.99 vs 0.98 at rest, a 10x reaction**, working
exactly as built. The problem was `.ecosystem-scrim`, the local well behind the ecosystem: a
radial gradient of `bg-base` at **90%** at its centre, sitting directly over the field, covering
the middle of the Skills section almost completely. That is precisely where a reader's pointer
spends its time in that section, so the reaction was happening under an opaque lid. Dropped to
56% at centre; the cursor core, its tendrils and the lit cluster around it are now plainly
visible there.

*Worth keeping:* "the effect doesn't work" and "the effect is covered" look identical from the
outside. Measuring the canvas *before* touching the effect is what separated them — the fix was
in a completely different file from the one that looked broken.

### Session 2 (cont.) — 2026-08-26 — Connector geometry, and the hero scroll animation removed

**Hero scroll animation removed, at Abdul's request.** The pinned scrub that scaled the hero
copy down into the top-left corner — Phase 11's flagship moment — is gone. `HeroChoreography`
existed only to hold that timeline, so with the pin removed the wrapper had nothing left to do:
the `<section>` is inlined into `Hero.tsx` and **the component is deleted**. Net effect is one
fewer client component and no GSAP touching the page's LCP element. Verified: `heroTop` tracks
`-scrollY` exactly at every position, the transform stays identity, and **no pin spacer exists**.
Stale references in `SectionTransitions` and `app/page.tsx` updated — neither describes a
Hero → About transform any more.

**Two connector bugs in the ecosystem, both reported by Abdul and both real.**

1. **Circles drifted off the ends of their connections while the orbit spun.** The
   counter-rotation element wraps the button, which is circle *plus* label — so its centre sits
   well below the circle. A transform pivots about its element's own middle by default, so the
   circle swung away from the orbit point as it turned. Fixed by setting `transform-origin` to
   the circle's actual centre (`50% ${BUTTON_PAD + size / 2}rem`). Measured drift is now **6px**,
   which is entirely the intentional ±8px Framer float.
2. **Connections ran centre-to-centre**, so each line passed straight through both circles.
   They now stop at the hub's edge and at each node's edge with a consistent gap. This needs a
   real measurement, not a constant: the SVG works in a 0–100 viewBox while the hub and nodes are
   sized in `rem`, and both are responsive (`max-w-2xl`, `h-20 sm:h-28 lg:h-32`). A
   `ResizeObserver` supplies container width, hub width and the root font size.
   **`offsetWidth`, never `getBoundingClientRect()`** — the latter reports a *rotated* bounding
   box, and this component spins. (That same trap inflated the first verification probe's pixel
   figures; the ratios were what proved the geometry correct.)

   The travelling pulse now derives its dash and distance from each connection's measured span
   via a `--flow-span` custom property, since the segments are no longer all the same length.

**Also this pass:** nodes were `bg-bg-glass` — a 4% white film that rendered them as dark holes;
they now carry a radial fill scaled by the same proficiency the size and glow track. Added a
faint dashed orbit ring, and a cyan `synapse-flow` dash that travels each connection inward to
the hub (pure CSS on an SVG stroke, `motion-reduce:animate-none`).

**Verified:** connections start 10.6 viewBox units out against a 9.5-unit hub radius, and stop at
33.0 against a 34.1-unit node edge — a clean 1.1-unit gap at both ends; circle centres sit at
263–272px against a 269px orbit. `build`, `lint`, `tsc --noEmit` clean.

### Session 2 (cont.) — 2026-08-26 — Ecosystem brought in line with PHASE_PLAN Phase 10

Abdul: "not according to design i described check phaseplan.md phase 10". He was right about two
further things, on top of the glow fixed in the entry below.

**1. The unscored stack should not orbit at all.** Phase 10: "Map each of the **four core
skills'** proficiency … The remaining stack (Databases, Tools, etc. — no percentage given)
**renders as a plain tag list**." The ecosystem was orbiting the five stack *groups* on a second
outer ring **as well as** listing them as tags below — so Backend / Frontend / Data-AI-ML /
Databases / Tools appeared twice, and the plan says once. `content/data.ts` already said the same
thing in a comment on `SkillGroup`: "renders as a plain tag list, deliberately not as bars."
The outer ring is removed; only the four scored core skills orbit. That also **deleted the label
collisions at their source** — they were all between the two rings — so the orbit could be pushed
out (0.32 → 0.40) and the nodes made bigger (3.25–5rem, up from 2.75–4.25).

**2. ⚠ A latent SVG bug: the hub's connecting lines were not painting.** With the four core nodes
evenly spaced from the top, every connection is *exactly* vertical or horizontal — and a
horizontal or vertical `<line>` has a **zero-area bounding box**. The gradient stroke used SVG's
default `gradientUnits="objectBoundingBox"`, which resolves against that box, so it could not
resolve and **the stroke painted nothing at all**. Measured: all four lines report
`bbox 0x40` / `40x0`, `degenerateBBox: true`.

This was **pre-existing and partly hidden** by the very ring that shouldn't have been there: the
group nodes sat at odd angles, so *their* lines drew fine while the lines to React.js (straight
up) and HTML/CSS (straight down) silently did not. Look at Abdul's first screenshot and the two
axis-aligned nodes have no line. Removing the outer ring made it total and therefore obvious.
Fixed with `gradientUnits="userSpaceOnUse"` pinned to the viewBox, which is independent of each
line's geometry. **Never leave a gradient in `objectBoundingBox` units on strokes that can be
axis-aligned.**

Lines were also strengthened (opacity 0.45 → 0.75, width 0.25 → 0.42): the site-wide field is now
much brighter, and at the old values the ecosystem's own connections were outshone by the
decoration behind it.

**Verified:** 4 orbiting nodes and **0 label overlaps at both desktop and 390px** (the 3x44px
mobile overlap noted below is gone too); all four connections paint in normal, reduced-motion and
mobile renders; the tag list still carries every group heading *and* their individual
technologies (Django, FastAPI, Flask, React Native, PostgreSQL, KMeans); spoken languages still
render as circular badges. Node diameters 80/71/52/52px track proficiencies 95/90/80/80.
`build`, `lint`, `tsc --noEmit` clean.

### Session 2 (cont.) — 2026-08-26 — Field density/reach, and the ecosystem's missing glow

**⚠ FIRST, READ THIS — the working tree was rolled back before this entry was written.**
`ReelStage.tsx`, `SectionChoreography.tsx` and `lib/reel.ts` were **deleted from the working
tree**, and several files reverted, putting the tree at roughly commit `0d2557b` (the scroll
story). That rollback was **not** made by me and I did not stage it. **Both features are safe in
git history** — `1eb4422` (per-section choreography) and `4dee1aa` (the pinned reel) — and can be
restored with `git checkout 4dee1aa -- <paths>`. This session's commit deliberately contains only
the three files below, so the rollback stays unstaged and reversing it remains Abdul's call.
Harmless leftovers in the tree: inert `data-section-inner` / `data-stagger-group` attributes that
nothing reads any more.

**1. "The bottom of the page doesn't have the background."** It did — the canvas was fine at
every scroll position (`top: 0`, full viewport height, opacity 1, actively painting). What was
missing was *visibility*: the Phase 12 Projects→Contact darkening layer sits at `-z-10`, directly
above the field at `-z-20`, and scrubbed to **0.72**, subtracting almost three quarters of the
field's brightness exactly where Abdul was looking. Cut to **0.22** — still a perceptible
darkening into Contact, per Phase 12, without burying the field.

**2. Denser and more visible**, as asked: nodes **150 → 215** (mobile 54 → 80), `linkRadius`
132 → 112 so the extra nodes give a finer mesh rather than longer lines, `intensity` 1 → 1.75,
packets 90 → 110. Measured canvas luminance roughly doubled (0.47 → 0.98 at the top, 0.42 → 0.85
at the bottom); combined with the darkening fix the bottom of the page is about **5.7x more
visible** than before. **This is a deliberate readability trade** — a brighter resting mesh does
cross body copy more. `intensity` is the single knob to dial it back and it does not affect the
cursor interaction.

**3. The ecosystem was genuinely off-spec.** Abdul said "this is not according to design" and he
was right on two counts, both measured rather than eyeballed:
- **Every node reported `boxShadow: NONE`.** `DESIGN_SYSTEM.md` §Skills asks proficiency to drive
  "node size **and/or glow intensity**"; size alone was carrying it and glow existed only as a
  hover state, so at rest all nine nodes rendered as identical flat discs. Added a `nodeGlow`
  ramp — 80% → 18px/24%, 95% → 42px/50%, unscored groups a faint 14px/12% — built from
  `--accent-violet` via `color-mix` so it stays a token. It is inline rather than a `shadow-*`
  class because the value is a function of the node's own proficiency, and an inline `boxShadow`
  would silently beat a class-based one anyway, so the active state folds into the same ramp.
- **Two real label collisions**: "Python, Django & FastAPI" x "Frontend" (47x31px) and
  "HTML, CSS & JS" x "Data / AI-ML" (112x21px). Fixed by separating the orbits (core 0.36 → 0.32,
  outer 0.48 → 0.53) and widening the buttons (`w-24 sm:w-28` → `w-28 sm:w-36`) so long names wrap
  onto fewer lines. **Now 0 overlaps**, and label line counts dropped (Python 3 → 2 lines,
  HTML/CSS 2 → 1, Data/AI-ML 2 → 1, Tools/Other 2 → 1).

*Worth noting:* I first also widened the container to `max-w-3xl`, which pushed the hub to the
bottom of the viewport. Re-measuring showed the compact `max-w-2xl` gives **0 overlaps too** — the
orbit separation and button widths did all the work — so the container was reverted. Change one
variable at a time and re-measure; the obvious extra change was not carrying its weight.

**Verified:** 0 overlaps at desktop and under reduced motion; every node carries a glow in both;
mobile 390px shows one 3x44px bounding-box overlap that is not a visual collision (confirmed by
screenshot — the labels are clearly separated). `build`, `lint`, `tsc --noEmit` clean; zero
Tailwind arbitrary values.

### Session 2 (cont.) — 2026-08-26 — The scroll story: one continuous morph, neon ball removed

Abdul: the 3D scroll animation only really happened Hero → next section, felt generic and
disconnected from the portfolio, and leaned on a neon glowing ball. He wanted a continuous
AI-themed journey where the scene evolves with each section, and the ball gone.

**The neon ball is gone.** It was `.transition-blob` — a 26rem violet circle with a 64px blur
that travelled across the screen on the hero's pinned timeline (Phase 12's Hero → About
boundary). Removed in full: the tween, the element, the `data-hero-blob` hook and the Tailwind
component class. Nothing references it.

**What replaced it: a stage story inside the existing field, not a new system.** No second
canvas and no second animation layer — the site-wide `NeuralField` now morphs its entire
topology continuously across the page. Every node holds **seven precomputed layouts**, one per
section, and scroll interpolates between the two it currently sits between:

| stage | section | reads as |
|---|---|---|
| `ambient` | Hero | loose neural environment, system at rest |
| `lattice` | About | reorganises onto a grid — structure emerges |
| `clusters` | Skills | five technology clusters |
| `hub` | Services | hub-and-spoke capabilities (angle quantised to spokes) |
| `timeline` | Experience | a serpentine spine with nodes branching off it |
| `pipeline` | Projects | four-layer feed-forward net, signal marching input → output |
| `converge` | Contact | concentric rings — the system settles |

**Stage order follows `app/page.tsx`, where Experience precedes Projects** — Abdul's brief
listed Projects first, but the animation has to match what you actually scroll past.

**The one idea that makes this work with a single topology:** every layout is a **continuous
deformation of the base positions, never a reshuffle**. A node's cluster is the nearest
attractor *to where it already is*; its pipeline column comes from its own x; its converge
angle is its own bearing from centre. So neighbours stay neighbours and the edges built once
against the ambient layout stay short and meaningful in all seven. Random assignment would look
identical at rest and tear the mesh into screen-length lines the moment it morphed. Where a
layout does stretch an edge past ~1.3x its resting length it fades out, gone by ~2.8x.

Geometry is not the only thing that morphs — a per-stage profile lerps alongside it: `drift`
(orbit amplitude) falls from 1.0 to 0.42 so the field visibly *calms* as the story resolves,
`rate` peaks at `pipeline`, and `flow` biases packet direction left→right, reaching 1 at
`pipeline` so signal marches through the layers instead of diffusing. That is what makes it
read as a network running rather than a diagram of one.

Driven by **one ScrollTrigger per section boundary**, scrubbed, created inside `NeuralField`
itself so there is no cross-component wiring. Section-aligned rather than one trigger over the
whole page: the sections differ hugely in height, and a flat `scrollY / maxScroll` mapping
would race through the short ones and crawl through the tall ones, so the scene would stop
agreeing with the content it is describing.

**Also changed:** the Phase 12 Projects → Contact darkening layer now scrubs to **0.72, not 1**.
It sits at `-z-10`, above the field at `-z-20`, so at full opacity it completely buried the
`converge` stage — which is the *ending* of the story. It still darkens decisively; the
resolved network stays legible behind it.

**Verified (production build, real GPU):**

| check | result |
|---|---|
| continuity | all 6 mid-boundary samples distinct from **both** neighbours — the scene changes *between* sections, not only at them |
| genuinely scrubbed | retrace error scrolling back up: **0.003–0.047** (contact 0.125↔0.124, projects 0.263↔0.258) |
| the narrative is measurable | horizontal spread contracts 0.283 (hero) → **0.125** (contact); `sdy` bottoms out at `hub` (0.117) and reopens for `pipeline` |
| perf mid-story, cursor active | field JS **1.70 ms**, **16.8 ms median (60fps)** |
| reduced motion | field byte-identical at top and at Contact (`n: 772`, `sdx: 0.284`), **0 ScrollTriggers, 0 running animations** |
| mobile 390px | story runs (sdy 0.25 → 0.109), 54 nodes, no pointer behaviour |

*Measurement note:* the observable is a spatial signature of the canvas's lit pixels (centroid +
spread). An early continuity check used only `cx`/`sdx` and flagged `services→experience mid` as
a duplicate; it differs by 44% in `sdy`. **The metric was too narrow, not the animation** — the
full 4-D signature shows all six midpoints distinct. Worth remembering: a signature that
collapses the wrong axis will confidently report a working morph as dead.

`build`, `lint`, `tsc --noEmit` clean.

**Not done:** Lighthouse still not re-run since these three sessions of changes (see the Vercel
note below) — the field's JS is ~1.7 ms/frame and no canvas was added, so no regression is
expected, but that remains a prediction.

### Session 2 (cont.) — 2026-08-26 — Navbar readability, and a site-wide `backdrop-filter` bug

Abdul: "apply this background to whole project and blur the navbar its totally like glass and
the text isnt readable."

**The background was already on every route** — `SiteBackground` lives in the root layout, so
`/`, `/projects/[slug]` and the 404 all render the same fixed field. Verified on
`/projects/pest-eye`: field present, 150 nodes. Nothing to do. (Noted while checking: **project
detail pages have no `Navbar` or `Footer`** — both are mounted in `app/page.tsx` only, so those
routes have just a "Back to projects" link. That is pre-existing and was left alone; it is a
scope decision, not a bug.)

**⚠ The real find: `backdrop-filter` was being stripped from the production CSS, site-wide.**
Chasing the navbar complaint turned up that `getComputedStyle(...).backdropFilter` was `none`
on `.glass-surface` too — **every glass surface on the site had zero blur**: the nav, cards,
the contact panel, the credential lightbox, the skills hub, secondary buttons.

Cause: each glass class declared **both** `backdropFilter` and a hand-written
`WebkitBackdropFilter`. The production minifier deduplicated them down to *only*
`-webkit-backdrop-filter` and dropped the standard property. Chrome still honours the `-webkit-`
alias, so it rendered correctly in every screenshot ever taken of this site — but **Firefox does
not support that alias at all**, so Firefox users have been getting flat translucent films this
whole time. The fix is to declare *only* the standard property and let autoprefixer emit the
prefix; a manually written prefix is what the minifier collapses onto. Confirmed in the built
CSS — both properties now present — and via computed style: `.glass-surface` is `blur(16px)`,
the nav is `blur(20px) saturate(1.4)`.

*Lesson, and the reason this is written up rather than just fixed:* the effect looked correct in
Chrome, in every screenshot, for the entire project. **A visual check in one engine cannot
detect a dropped standard property.** There is now a warning comment above `addComponents` in
`tailwind.config.ts` with the exact `grep` to re-check the built CSS.

**The navbar itself.** It used `.glass-surface` — a 4%-**white** film. That works over the calm
card surfaces it was designed for, but the bar sits over the live neural field, and a white wash
cannot stop a lit cyan connection reading through 12px mono labels. Two new component classes,
both tinting *down* toward the page background instead:
- **`.glass-nav`** (scrolled): `bg-base` at 72% + `blur(20px) saturate(140%)`. `.glass-surface`
  was deliberately **not** changed — 8 card/button consumers depend on it.
- **`.nav-veil`** (at rest over the hero): a masked gradient on its own element behind the nav
  content. `DESIGN_SYSTEM.md` asks for the bar to be transparent over the hero, but transparent
  cannot mean illegible; this keeps the intent (no border, no edge, hero still full-bleed) while
  darkening and blurring just the band behind the labels. **It has to be its own element** — a
  mask applies to an element's children too, so on `<header>` it would have faded out the bottom
  of the nav text. Cross-faded with `.glass-nav` on opacity so it hands over smoothly rather
  than popping at the 24px scroll threshold.

**Verified:** readable at the top even with the cursor core firing directly beneath the bar;
`blur(12px)` veil at rest, `blur(20px) saturate(1.4)` scrolled, veil at opacity 0 when scrolled;
correct under reduced motion (0 running animations — the veil is a static readability layer, not
motion) and on mobile. **No perf regression: still 16.7 ms median (locked 60fps), field JS
1.58 ms.** `build`, `lint`, `tsc --noEmit` clean.

### Session 2 — 2026-08-26 — Constellation replaced by an interactive neural field

Abdul's brief: the constellation read as "generic, boring, too slow", and barely reacted to the
cursor. Replace it with a **dynamic AI neural-network interface** whose cursor behaves like a
processing core. Everything else — content, sections, layout, GSAP choreography — untouched.

**Stack decision, logged because the brief asked for something that does not exist here.** The
brief said to use "the existing Three.js/R3F setup if possible", and that R3F/three/drei are
"fine **if already installed or genuinely useful**". Neither is installed (`package.json` has
no `three`), and `CLAUDE.md` §2 rules the constellation is a hand-rolled 2D canvas. Both of the
brief's own conditions therefore point away from WebGL, so this stayed on canvas. The reasons
are in the header of `lib/neural-field.ts`: the "3D" being asked for is depth-sorted parallax
and perspective scaling, which is a projection problem, not a GPU one — and this page's
measured weak point has always been main-thread time. Nothing was added to `package.json`.

**New files.** `lib/neural-field.ts` (the engine — framework-free TypeScript, so no React
re-render can reach the hot loop), `components/effects/NeuralField.tsx` (lifecycle only) and
`components/effects/NeuralFieldMount.tsx` (deferral + the touch simplification).
**`ConstellationCanvas.tsx` and `ConstellationMount.tsx` are deleted** — one engine, per the
Phase 5 rule against a second implementation. Both consumers were repointed: `SiteBackground`
and the About portrait.

**What actually fixed the "generic" problem** — the topology, not the styling:
- **Nodes are anchored and orbit by a few px** instead of drifting freely and wrapping. Because
  nodes never travel far, connections are **permanent synapses** built once by
  k-nearest-neighbour with a degree cap, rather than whatever two dots happen to be adjacent
  this frame. A mesh whose edges flicker at random reads as noise; a stable one reads as a
  system. This single change is what stops it looking like a star field.
- Three node tiers (hub / relay / micro) with different degrees, so the mesh has hierarchy.
- **Motion comes from signal, not drift.** Ambient node motion stays slow so body copy in front
  of it is readable; the speed the eye reads is data packets travelling edges at 200–320 px/s,
  plus activation flashes. Packets arriving at a node can re-emit along its other edges, so a
  firing **cascades** a few hops and dies.

**The cursor.** The old field gave the pointer a 2% parallax eased at `0.05`/frame — about
twenty frames to converge on a shift too small to see, which is exactly why it felt inert. Now
the influence field is sampled from the **raw** pointer coordinate every frame (zero lag), and
it pulls nodes toward it, activates them (rise `0.45` / decay `0.055` — the asymmetry leaves a
comet-tail of lit nodes behind a moving cursor), lights nearby edges cyan, **injects signal** so
cascades radiate outward from the cursor, wires tendrils into its nearest nodes, and leaves a
velocity trail that sprays sparks and raises the firing rate when moved fast.

**Perf work, all of it measured:** squared-distance comparisons, edges built once via a spatial
hash rather than O(n²) per frame, edges drawn in a handful of **batched** strokes bucketed by
alpha instead of one `beginPath`/`stroke` per edge, glow via a **cached radial-gradient sprite**
rather than `ctx.shadowBlur` (the old field set a shadow on every node every frame — one of the
most expensive things a 2D context can do), pooled packets/sparks so a cascade never allocates,
and a **delta-timed** step so it no longer runs literally twice as fast on a 120 Hz display.

**Measured (production build, `next start`):**

| check | result |
|---|---|
| topology | 150 nodes / ~334 edges desktop |
| field JS cost per frame | **0.89–1.99 ms** (`window.__neuralDebug`) |
| frame rate, real GPU, cursor active | **16.7 ms median / 16.8 p95 — locked 60fps** |
| brightness under cursor vs. at rest | **8.3 vs 0.54 — 15×** |
| brightness under cursor vs. far away | **31×** |
| reduced motion | `animating: false`, 0 running animations, mesh still drawn |
| mobile 390px | 150 → **54 nodes**, 120 edges, no core/pull/trail |
| About portrait field | **25.2 nodes/100k px² vs 13.2** — 1.9× denser (Phase 6 criterion) |

**⚠ Three verification traps hit this session — all three would have produced a confident wrong
answer, which is the recurring theme of this file:**
1. **`--viewport` in `scripts/cdp.mjs` means *mobile*, not "set the window size".** It sets
   `mobile: true` **and enables touch emulation**. So the first cursor test ran with
   `useIsTouchDevice()` true — the mount had correctly disabled every pointer behaviour — and
   touch emulation silently swallowed the dispatched mouse events. The effect looked broken and
   was working perfectly. **Never pass `--viewport` to a desktop pointer test.**
2. **`--disable-gpu` makes every frame-rate number meaningless.** The field first measured 15fps
   (66 ms/frame). The control — the same page under `--reduced-motion`, where the field paints
   one frame and never loops — ran at a clean 16.7 ms, proving the environment was fine and
   implying the field cost ~50 ms. It did not: `gpu` reported *Microsoft Basic Render Driver*,
   i.e. software rasterisation. Added **`--gpu`** to the driver; on the real Intel UHD 620 the
   same page runs a locked 60 fps. **Always take the control measurement before believing a
   frame-rate regression.**
3. **A stale comment claimed a cap that did not exist.** The engine's header said the
   full-screen field capped its backing ratio "at 1.75 via the React wrapper". Nothing
   implemented that. Rather than delete the sentence, the cap is now real (`maxDpr`, 1.5 for
   the site field) — a full-viewport layer of 1px lines gains nothing visible from a 2x backing
   store and costs ~44% more pixels to fill.

**Tooling:** `scripts/cdp.mjs` gained **`--mouse x,y x,y ...`** (sweeps the real pointer through
the CDP input pipeline, interpolating between waypoints so the page sees a gesture with genuine
*velocity* — trail length, sparks and firing rate are all derived from pointer speed, so a
single jump to a coordinate exercises none of them) and **`--gpu`**.

`npm run build`, `npm run lint`, `tsc --noEmit` clean; zero Tailwind arbitrary values.

**Not done / next up:** unchanged — the **Vercel deploy** is still the only thing left in Phase
14, and still needs Abdul's account plus the real domain (`siteUrl` is still the placeholder
`https://abdulqadir.dev`). Lighthouse has **not** been re-run since this change; the field's JS
is ~1–2 ms/frame and one canvas replaced one canvas, so no regression is expected, but that is a
prediction, not a measurement — re-run it as part of the deploy step.

Two things deliberately left alone, worth knowing: the site-wide mesh does cross body copy at
its resting alpha (that is the trade for it being the page's main texture, and `intensity`
scales only the resting mesh, never the activation), and the navbar wordmark is still the jagged
156×29 raster flagged in the previous session.

### Session 1 (cont.) — 2026-08-22 — Hero animations restored to their Phase 14 state

Abdul asked for the hero animations to go back to how they were at the end of the phase work.
Two post-phase additions were removed:

- the separate **portrait tween** in `HeroChoreography` (portrait lifting/scaling/fading at its
  own rate), added 2026-08-22;
- the **About slide-in** in `SectionTransitions`, added the same day.

`HeroChoreography`'s timeline is now byte-identical to `739a560` (Phase 14) — copy scaling to
`0.46` into the top-left with `yPercent -12` / `opacity 0.18`, plus the one-way blob traverse,
pinned `+=85%`. `SectionTransitions` is identical to Phase 14 in full, owning only the three
non-hero boundaries. Confirmed by diffing both files against that commit: the sole remaining
difference is `HeroChoreography`'s removed `background` prop, which belongs to the shared
`SiteBackground` work, not to the hero animation.

**Deliberately kept** (they are content/background, not hero animation, and were separately
requested): the hero portrait image itself, the removed scroll indicator, the site-wide
constellation, the denser field, and the navbar wordmark. The portrait now simply scales and
fades with the hero block, since it sits inside the transformed wrapper.

Measured after the change: hero `1424 → 655px`, `opacity 1 → 0.18`; ball one-way `439 → 793`;
About static at `opacity 1` throughout (no slide-in). Reduced motion: no pin, no inline styles,
ball at `opacity 0`.

### Session 1 (cont.) — 2026-08-22 — Hero→About re-choreography: BUILT, THEN REVERTED

Abdul asked for a specific beat order — all hero content into the top-left corner, neon ball
out to the right, ball returns left, next section slides in from the bottom corner following
it. It was built and measured working, then **he asked for it to be reverted**, so commit
`5ec46cb` was reverted in full. The hero is back to: copy scaling into the corner, portrait
lifting and fading on its own rate, and a one-way blob traverse.

**Do not rebuild this without being asked.** Recorded only so the attempt is not repeated
blind, and because two of the findings from it are real regardless of the choreography:

1. **`refreshPriority: 1` on a pinned trigger.** Any ScrollTrigger positioned *below* a pin
   measures its start/end against a layout with no pin spacer unless the pinned trigger
   refreshes first. **This was reverted along with everything else**, which means About's
   slide-in currently completes while About is still roughly 1300px below the fold — the
   animation is configured but effectively never seen. That is the pre-existing behaviour
   Abdul asked to return to; re-applying just `refreshPriority: 1` to the hero pin is the
   one-line fix if the slide-in is ever wanted visible.
2. **Never target a moving element's corner with `getBoundingClientRect()`** — the rect
   includes the transform being animated, so the target chases the element. Sum
   `offsetLeft`/`offsetTop` up the `offsetParent` chain instead; it is pure layout.

Both are written up here rather than left in reverted code.

### Session 1 (cont.) — 2026-08-22 — Hero portrait, denser field, logo, hero→about handover

**Constellation density.** Abdul found the unified field too faint: raised to 130 particles
(48 on mobile), `connectionDistance` 118 → 150, and the `opacity-60` damping removed. It is
now the page's main visual texture rather than a whisper.

**Hero portrait, as a real cut-out.** The supplied `portrait.png` is *not* background-removed —
its alpha channel is fully opaque and the backdrop is near-black (sampled RGB 2-7). First
attempt used `mix-blend-mode: screen`, which left a **visible rectangle**: the page background
is `#08090D`, not pure black, so screening a near-black image over it lifts the whole frame.
Generated `public/portrait-cutout.png` instead, with Pillow:
- a narrow luminance ramp (6 → 30) rather than a mid-grey threshold, because the hair is
  nearly as dark as the backdrop and a naive key eats it;
- a **flood fill from the borders**, so only background-*connected* darkness is removed — the
  black tie and the shadows inside the jacket stay opaque, which a global threshold would have
  punched holes through;
- a 0.8px blur on the alpha so the edge is not scissor-cut.
Result: corners transparent, subject opaque, 15% of the frame keyed out. `identity.portraitCutout`
holds it; the framed About portrait still uses the original. **The script is not committed — if
the source photo is ever replaced, re-derive the cut-out.** Better still, a properly
background-removed PNG from Abdul would beat any key.

**Hero layout.** Two columns (`lg:grid-cols-hero`), copy left / portrait right, portrait hidden
below `lg` with `sizes` set so phones never download it. It has its own parallax on the hero's
existing pinned timeline (lifts and fades faster than the copy, so the two planes separate).

**Scroll indicator: removed** at Abdul's request. Before removing it, its position was fixed —
it was `absolute bottom-8` inside the *transformed content wrapper*, whose height is only the
copy block, so it anchored mid-hero instead of to the viewport bottom. Worth knowing if it ever
comes back: it needs to be a direct child of the `<section>`.

**Hero → About handover.** About's content now rises and fades into place (`yPercent 14 → 0`,
`opacity 0 → 1`, slight scale) scrubbed against its own entry, paired with the hero shrinking
away on the pinned timeline — so it reads as one view handing over to the next.
**Note the timing trap:** the first version used `start: "top bottom"`, which the hero's pin
spacer consumes while About is still parked off-screen, so the tween completed before it was
ever visible and looked dead. It is now `top 88% → top 38%`. Measured: `y=94px/op 0` at scroll
0 → `y=70/0.26` → `y=23/0.76` → settled.

**Navbar wordmark.** Now uses Abdul's own `dark-logo.png` (as `public/brand/wordmark.png`) at
124px wide — under its native 156px so it stays sharp at 2x. **It is a 156×29 raster and looks
noticeably jagged**; a vector (SVG) or a 2-3x PNG would fix it properly.

**⚠ A third verification hole found and fixed — this one invalidated a lot of claims.**
`scripts/cdp.mjs --reduced-motion` never forced anything. It merely *omitted*
`--force-prefers-no-reduced-motion`, so it inherited the OS setting. Every reduced-motion check
from Phase 3 onward passed only because this machine had Windows animation effects switched
off; the flag silently became a no-op the moment Abdul switched them on. It now uses
`Emulation.setEmulatedMedia`, which sets the feature for real.
**Everything was re-validated against the working flag and the conclusions all still hold:**
macro layer fully at rest with the hero unpinned and content visible, typewriter static with no
caret, and the new About handover applying no inline styles at all under reduced motion.
*Lesson for future phases:* a negative test that can pass for the wrong reason is worse than no
test. Assert the precondition (`reduceMatches=true`) inside the probe, not just the outcome.

### Session 1 (cont.) — 2026-08-22 — Two fixes from Abdul's testing + one background rework

**1. CRITICAL, shipped since Phase 3: wheel and trackpad scrolling did nothing.**
Abdul reported that two-finger scrolling had no effect while the pointer was over the page,
but dragging the scrollbar worked. Root cause in `SmoothScrollProvider`: it read the Lenis
instance from a ref inside an effect keyed on `[reducedMotion]` and bailed with
`if (!lenis) return`. When the ref was not populated on that single run the effect never
re-ran, so `connectLenisToScrollTrigger` was **never called**. With `autoRaf: false` that
means nothing ever drove `lenis.raf()`, so Lenis accepted wheel input and never applied it.
The scrollbar kept working because that path bypasses Lenis entirely — which is exactly why
it looked so strange.

Fixed by moving the wiring into a `LenisGsapBridge` component *inside* `<ReactLenis>` that
reads the instance with `useLenis()`. The hook re-renders when the instance appears and the
effect is keyed on it, so there is no timing question left.

**Why nine phases of testing missed it — worth internalising.** `scripts/cdp.mjs`'s `scrollTo`
helper does `window.__lenis ? lenis.scrollTo(...) : window.scrollTo(...)`. With the wiring
broken, `__lenis` was never exposed, so **every scroll probe silently used the native
fallback** and passed. The scrubbed-animation checks in Phases 6, 8, 11 and 12 were all real —
they just exercised native scrolling, never Lenis. Two hardenings:
- `--wheel <deltaY>` dispatches a **real** wheel event through the CDP input pipeline. A
  synthetic `new WheelEvent(...)` cannot trigger browser scrolling, so it cannot tell "the
  page scrolled" from "a library swallowed the input" — which is why synthetic tests were
  useless here.
- `scrollTo` now records `window.__scrollPath` (`"lenis"` / `"native"`). **Assert on it** when
  a probe expects Lenis to be live. Verified: `scrollPath=lenis` in dev after the fix.
Verified end to end with real wheel events: `0 → 1799` (dev) and `0 → 1800` (production
build), with reduced motion still scrolling natively.

**2. One continuous constellation background, replacing the per-section backdrops** — Abdul's
call: the mix of `RadialOrbs` / `DotGrid` / `ConstellationMount` scattered across sections made
every boundary a visible change of backdrop. There is now a single `SiteBackground` fixed layer
in the root layout (`-z-20`, below the Phase 12 darkening layer at `-z-10`), holding one
constellation canvas, one set of orbs and one dot grid. Removed the per-section layers; the
only one left is the About portrait's own tied field, which is a distinct feature.
- It is **cheaper than what it replaced**: one rAF loop and a viewport-sized `fixed` canvas
  instead of two full-width fields plus several orb/grid layers per section.
- Held at `opacity-60` with `connectionDistance` reduced 140 → 118. At full strength the lines
  read *through* body copy — visibly crossing the service cards' paragraphs — and
  `DESIGN_SYSTEM.md` asks for ambience, not a competing layer.
- The Phase 12 About→Skills scrub still works; `data-transition-dotgrid` just moved to the
  site-wide grid.

**Deviation logged:** `DESIGN_SYSTEM.md` says the constellation is "confined to the hero".
Abdul asked for it site-wide, so that line no longer holds. Don't revert it back.

### Session 1 (cont.) — 2026-08-21 — Abdul reported "no loader, no typewriter, no constellation movement"
**Verdict: not a bug — but my verification had two blind spots that let me claim "complete"
without ever seeing what Abdul sees.**

**Root cause.** This machine has Windows "Animation effects" **OFF**. Confirmed at the OS level
via `SystemParametersInfo(SPI_GETCLIENTAREAANIMATION)` → `False`, so Chrome reports
`prefers-reduced-motion: reduce`, and `matchMedia("(prefers-reduced-motion: reduce)").matches`
is `true` with no flags forced. All three symptoms are the **spec'd** reduced-motion behaviour
(`CLAUDE.md` §4): loader skipped entirely, typewriter renders `phrases[0]` statically with no
caret, constellation paints a single static frame. Abdul's screenshot shows the role line with
no `_` caret, which is exactly the reduced-motion branch of `Typewriter`.

**Proof the features work when motion is allowed** (`--force-prefers-no-reduced-motion`):
- Typewriter samples over 4s: `"ML Engineer" → "ML E" → "" → "Agenti" → "Agentic AI Builder"`,
  caret present.
- Constellation: canvas pixel hash changes across a 1s gap (`canvasAnimating=true`).
- Loader: screenshotted mid-sequence at 18% with the status lines staging in.

**The two testing blind spots — both now fixed in `scripts/cdp.mjs`:**
1. **Every run forced `--force-prefers-no-reduced-motion`.** So I only ever tested the
   motion-enabled path and the explicitly-forced reduced path, never the *machine default*
   that a real visitor (and Abdul) gets. Added **`--system-motion`**, which passes neither
   flag. **Use it at least once per phase from now on.**
2. **The driver waits for `[role="status"]` to disappear before running any script** — i.e. it
   waits for the loader to finish, by design (the loader stops Lenis, so early scrolling is
   silently ignored). That made every probe structurally incapable of observing the loader:
   it always reported "not there", however well it worked. Added **`--no-settle`** to skip the
   wait.

**A real bug this did surface.** With motion enabled the loader appeared **~840ms after load**,
on top of a hero that had been painted since 0ms — content first, boot screen dropping over it
second, which is worse than no boot screen. Cause: `LoaderMount` code-split the loader with
`dynamic(ssr: false)`, so its chunk was only fetched after hydration. Switched to a static
import: **840ms → 600ms**. *Still not ideal* — any client-gated overlay necessarily appears
post-hydration. The complete fix is to render the overlay in the SSR HTML and have a tiny
inline `<head>` script set `data-loader="skip"` on `<html>` before first paint (the standard
theme-flash technique), so it covers from the very first frame and never flashes for
reduced-motion or returning visitors. **Not done — flagged for whoever picks this up.**

### Session 1 (cont.) — 2026-08-21 — Phase 14: Performance, Accessibility, Easter Egg
**Did — performance.** Every change below was driven by a measurement, not a guess:

1. **The loader was the single biggest cost on the page.** Measured by building with it
   disabled: performance **69 → 86**, TBT **790ms → 220ms**. The cause was `setProgress` being
   called from the GSAP timeline's `onUpdate` — roughly **78 React re-renders of the overlay
   during the most contended moment of the page's life**. Rewritten to write the bar,
   percentage and status lines straight to DOM nodes via refs. Same sequence, same look;
   performance **69 → 80**, TBT → 300ms. *There is a warning comment in `Loader.tsx` — do not
   reintroduce `useState` there.*
2. **The loader no longer plays below 640px** (new `useIsCompactViewport` hook, third gate in
   `LoaderMount`). A 1.3s opaque overlay owns most of the mobile LCP budget. Desktop keeps the
   boot sequence. Logged in the decision log.
3. **Constellation canvases are now deferred and paused.** The homepage mounts three; all
   three previously downloaded their chunk, built a particle field and started a `rAF` loop
   during initial load, for two fields nobody could see. `ConstellationMount` now waits for an
   IntersectionObserver (300px margin) and `ConstellationCanvas` pauses its loop when scrolled
   off-screen (it previously only paused on tab-hide). **Verified: 1 canvas at load, 3 after
   scrolling**, in both motion modes.
4. **Hero entrance shortened** (`rise-in` 0.7s → 0.5s, stagger 0.08s → 0.04s). The LCP element
   is the hero tagline, and because `rise-in` starts at `opacity: 0` with `both` fill, its
   delay and duration land *directly* on LCP — the breakdown showed **1,206ms of element
   render delay** and only 15ms TTFB.

**Did — accessibility.** Full keyboard pass with real Tab keypresses: **22 focus stops** in
logical DOM order (navbar → hero CTAs → scroll indicator → skill nodes → service cards), and
**zero elements missing a focus ring**. No focus traps. Full reduced-motion pass across the
whole page: loader absent, cursor unmounted, **0 running animations**, **0 elements stuck
invisible**, hero never pinned. Lighthouse Accessibility **100** on both presets.

**Did — easter egg** (built last, as the plan requires). Typing `sudo hire-me` anywhere
reveals `> Access granted. / > Let's build something amazing.` Ignores keystrokes while an
input/textarea/contenteditable is focused, Escape dismisses, buffer is a ref so it does not
re-render on every keystroke, and it is **not** gated behind reduced motion (user-initiated and
tiny, per the spec). Verified by dispatching the real character sequence through CDP.
`grep` confirms it is referenced nowhere in the UI.

**Confirmed:** the canvas, cursor and loader all load via `next/dynamic({ ssr: false })` behind
mount wrappers. Zero Tailwind arbitrary values and zero raw hex outside `lib/tokens.ts`.
`build`, `lint` and `tsc --noEmit` clean.

**Tooling:** `scripts/cdp.mjs` gained `--type <text>` (dispatches real character keystrokes),
completing the set: `--viewport`, `--reduced-motion`, `--screenshot`, `--press-tab`, `--then`,
`--type`.

**What is left in Phase 14:** only the deploy. `PHASE_PLAN.md` asks to deploy to Vercel and
verify the production URL, then record Lighthouse for the deployed site. Both need Abdul's
Vercel account. When doing it:
1. Set the real domain in `content/data.ts` (`siteUrl`) **first** — the sitemap, canonical tags
   and OG URLs all derive from it and currently point at the placeholder `abdulqadir.dev`.
2. Deploy, then re-run Lighthouse against the production URL and replace the mobile column in
   the table above with those numbers.

### Session 1 (cont.) — 2026-08-21 — Phase 13: 404, Metadata & SEO
**Did:**
- **`app/not-found.tsx`** — the lost-in-space / constellation motif tying back to the hero: a
  sparser, slower `ConstellationMount` config, "Error 404" eyebrow, gradient headline, two CTAs
  home, and a section nav. A Server Component; only the canvas is client.
- **Root metadata** rebuilt: `metadataBase`, a title `template` (`%s — Abdul Qadir`), keywords,
  canonical, full Open Graph and Twitter card blocks, and an explicit `robots` policy.
- **`app/opengraph-image.tsx`** — 1200×630 social card generated at build time from
  `lib/tokens.ts`, so it cannot drift from the palette. (Satori supports only a CSS subset —
  no CSS variables or Tailwind — so this file reads token values directly; it is the one place
  outside `lib/tokens.ts` allowed to.)
- **`app/sitemap.ts`** and **`app/robots.ts`** — all four URLs, with the sitemap referenced
  from robots.txt.

**Two real bugs found by measuring rather than assuming:**
1. **Doubled titles.** Project pages rendered `Pest Eye — Abdul Qadir — Abdul Qadir`: the page
   appended the name *and* the new root template did too. The page now returns just
   `project.title` and lets the template add the suffix.
2. **404 was advertising itself as indexable.** I removed the page's `robots` override thinking
   Next's automatic `noindex` made it redundant — but the page then *inherited*
   `index: true` from the new root config, so it rendered `noindex` **and** `index, follow`,
   contradicting each other. The override is required, and the comment in the file says why so
   nobody removes it again.

**Accessibility fixes (Lighthouse-driven):**
- **Contrast:** `accent-violet` (#7C3AED) as 12px text measured **3.49:1** on `bg-base` and
  **3.03:1** over the section-heading glow — both below WCAG AA's 4.5:1. `DESIGN_SYSTEM.md`
  only ever certified the *text* tokens, not the accent used as type. Added
  **`accent-violet-text` (#A78BFA)** — same hue, **7.31:1 / 6.34:1** — and pointed all 14 files
  using `text-accent-violet` at it. `bg-accent-violet` / `border-accent-violet` keep the brand
  accent. See the decision log.
- **`label-content-name-mismatch`:** the navbar wordmark showed "AQ" but its `aria-label` was
  "Abdul Qadir — back to top", so the accessible name did not contain the visible text
  (WCAG 2.5.3). Now `AQ — Abdul Qadir, back to top`.

**Lighthouse (production build, `next start`):**

| Category | Score |
|---|---|
| Performance | **53–64** ⚠ |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |

Phase 13's criterion is SEO ≥ 95 — met at 100. Accessibility went 97 → **100** after the two
fixes above.

**⚠ Read this before trusting any Lighthouse number:**
- An early run reported Performance **91**. It was measured against a **stale server**: the
  rebuild's `next start` had failed with `EADDRINUSE` (the old one still held port 3100) and
  the run silently hit the previous build. **Always confirm the served HTML contains your
  change before believing a score.**
- Even after fixing that, scores swung 51 → 64 purely on machine load. `scripts/cdp.mjs` was
  **leaking Chrome processes**: `child.kill()` on Windows kills only the parent and orphans
  every renderer, so runs accumulated stray processes that competed with Lighthouse. The
  driver now kills the whole tree with `taskkill /T /F`. Clean up strays by command line
  (`CommandLine -like '*cdp-profile*'`) — **do not kill all `chrome.exe`**, Abdul's own browser
  is running.
- Honest read: Performance really is ~55–65, not 91. **TBT is 1,100 ms+** and LCP ~4.0–4.4 s.

**Next up:** **Phase 14 — Performance, Accessibility, Easter Egg & Launch.** Performance is the
whole job:
- TBT is the dominant problem, and the likely cause is how much client JS initialises at once:
  **three `ConstellationCanvas` instances** each running their own rAF loop (hero, About
  portrait, Skills), plus GSAP + ScrollTrigger + Framer Motion + Lenis + the loader. Start by
  measuring which of those actually costs the main-thread time rather than guessing.
- Confirm every canvas/mouse component is `next/dynamic({ ssr: false })` (most already are),
  consider pausing off-screen canvases via IntersectionObserver, and check whether Framer
  Motion and GSAP are both being pulled into the initial chunk.
- Then: full keyboard-only pass, full reduced-motion pass, the `sudo hire-me` easter egg
  (built **last**), final Lighthouse with all four ≥ 90 recorded in the table below, and the
  Vercel deploy.

**Blockers:** résumé link, Pest Eye + Netflix live/repo links, contact-form decision,
**production domain** (`siteUrl` is still `https://abdulqadir.dev`, so sitemap/canonical/OG
URLs are all wrong until confirmed), and a Vercel account.

### Session 1 (cont.) — 2026-08-21 — Phase 12: Section-Transition Macro-Layer
**Did:** all four boundaries, every one GSAP ScrollTrigger-scrubbed.

- **Hero → About — folded into the existing Phase 11 timeline, not a second one.**
  `HeroChoreography`'s `gsap.to` became a `gsap.timeline({ scrollTrigger })` carrying two
  tweens at position `0`: the hero transform, and a travelling violet glow that crosses the
  screen (`xPercent -30 → 55`, fading up from 0) as the hero gives way. `PHASE_PLAN.md` is
  explicit that this must share the hero's timeline rather than compete with it — **if you add
  anything else to this boundary, add it to that timeline too.**
- **About → Skills:** a `DotGrid` was added to the Skills section carrying
  `data-transition-dotgrid`, and its opacity is scrubbed `0.25 → 1` as the section is
  approached, so the ambient grid becomes more defined exactly at the boundary. `DotGrid` now
  spreads extra props so it can take a `data-*` hook.
- **Skills → Projects:** each project card grew a node-and-line connector echoing the skill
  ecosystem's hub-and-spoke language (violet node, gradient line, same visual grammar). They
  draw in with a scrubbed, staggered `scaleY` as the grid is approached. This is the "shared
  visual grammar, not necessarily a literal shape morph" the phase asks for.
- **Projects → Contact:** a fixed `bg-bg-deep` layer at `-z-10` — behind the content but above
  the body's own background — scrubs from `opacity 0 → 1`, genuinely darkening the page rather
  than tinting the content. Needed a new `bg-deep` (`#03040A`) token, because overlaying
  `bg-base` on itself cannot darken anything.
- The three non-hero boundaries live in one `SectionTransitions` component mounted once in
  `app/page.tsx` — the macro-layer is a layer *on top of* finished sections, so it finds what
  it animates by `data-*` attribute rather than being tangled into each section.

**Verified (via `scripts/cdp.mjs`) — sampled down the page and back up:**

| boundary | down | back up |
|---|---|---|
| blob (Hero→About) | `0 → 0.585 → 1` | `→ 0` |
| dot grid (About→Skills) | `0.25 → 1` | `→ 0.25` |
| connector (Skills→Projects) | `0 → 1` | `→ 0` |
| darken (Projects→Contact) | `0 → 1` | `→ 0` |

Every one retraces, which is what distinguishes a scrub from a fire-once reveal.

**Reduced motion** (`--reduced-motion`): at *every* scroll position the dot grid sits at its
resting 0.6, connectors are fully drawn and static, the darkening layer stays at 0, the blob
never appears, and the hero never pins — while project cards stay at opacity 1 and content
remains readable and in order. That is the required collapse: no pinning, no blob travel, no
morph. None of these ScrollTriggers are even created, because the whole layer is inside
`gsap.matchMedia("(prefers-reduced-motion: no-preference)")`.

`npm run build`, `npm run lint`, `tsc --noEmit` clean; zero Tailwind arbitrary values.

**Next up:** **Phase 13 — 404, Metadata & SEO Pass.**
- `app/not-found.tsx` — lost-in-space/constellation motif (reuse `ConstellationMount`, it
  already takes a config) with a clear way home.
- Per-route `generateMetadata`: `/` and each `/projects/[slug]` already have distinct titles
  and descriptions — **verify** rather than assume, and add the 404's.
- `sitemap.ts`, `robots.ts`, and an OG image. Note `siteUrl` in `content/data.ts` is still the
  placeholder `https://abdulqadir.dev` — the sitemap and canonical URLs are wrong until Abdul
  confirms the real domain, so flag it if it is still unanswered.
- Then Phase 14: perf/a11y passes, the `sudo hire-me` easter egg (built last), Lighthouse ≥ 90
  in all four categories recorded here, and the Vercel deploy.

**Blockers / open questions:** the résumé link, Pest Eye + Netflix live/repo links, the
contact-form-vs-links decision, the production domain, and a Vercel account. Also still
unanswered: the "Best Developer" award question in Known issues.

### Session 1 (cont.) — 2026-08-21 — Real assets wired in (Abdul supplied images)
**Did:** Abdul dropped his image library into `assets/` at the repo root. Next only serves
static files from `public/`, so the ones the site uses were copied across with clean,
role-stating names and wired into `content/data.ts`. **Every `[TODO]` image placeholder is now
gone — the count went 14 → 0.**

- **Portrait** → `/portrait.png`. Supplied at 1374x1727, almost exactly the `aspect-portrait`
  (4:5) token the About layout was already built against, so it dropped in with no layout
  change. (`homepage/dark-home-image.png` is byte-identical to `profile-image.png` — md5
  `fe0dbf43` — so only one copy was taken.)
- **Projects** — each has two images, and **which goes where is Abdul's explicit instruction**:
  the square graphic from `assets/images/portfolio/` is the **landing-page card**, and the wide
  app screenshot from `assets/images/project-detail/` is the **detail-page hero**. The `Project`
  type now has `cardImage` and `heroImage` (named for where they are used, not what they show)
  and the files are `*-card.*` / `*-hero.*` to match. The card frame changed from `aspect-project`
  (16:11) to **`aspect-square`**, because the source graphics are 2560x2560 and a 16:11 frame
  cropped off their titles and bottom panels.
- **(Resolved 2026-08-21)** Two source files were originally misnamed — `Customer_Segmentaion.jpeg`
  held the Netflix graphic and vice versa — so the `public/` copies were named for their
  *contents* instead. **Abdul has since renamed the originals correctly**, and the two now
  agree: `Customer_Segmentaion.jpeg` (md5 `6dfcd7b6`) is the RFM graphic and matches
  `customer-segmentation-card.jpeg`; `Netflix_Stock_Price.jpeg` (md5 `0a30d4b2`) is the Netflix
  graphic and matches `netflix-stock-price-card.jpeg`. Nothing to do — verified by checksum,
  no code change was needed.
- **Certifications** — images plus **real verification URLs read off the certificates
  themselves**, each checked to return HTTP 200: Programming for Everybody
  (`2CCTQBHBYKRE`), Programming with JavaScript (`5NHZQ49GDDUS`), Django Web Framework
  (`AVVJCNWSY23C`), Version Control (`LCVD2YSDVLZM`). The n8n one is Simplilearn and prints a
  certificate code rather than a URL, so it stays `url: null` and opens the lightbox.
- **Awards** — all six wired, with titles/issuers/dates transcribed from the certificates,
  which are more precise than the screenshot-derived wording in `CONTENT_BRIEF.md`. A `date`
  field was added to `Credential` and now shows on each card. Ordered strongest first.
- **Live link recovered:** the Customer Segmentation screenshot shows the Hugging Face Space
  `abdulqadir12511/Customer_Segmentation`; the URL returns 200 and is now wired as that
  project's `liveUrl`, so its "Live preview" button is live. The other two remain `null` and
  correctly render no button.
- **Favicon** is now Abdul's own mark (`app/favicon.ico` + `app/icon.png`), replacing the
  placeholder AQ `icon.svg` generated in Phase 0.
- Assets deliberately **not** used: `logo/dark-logo.png` is a 156x29 raster wordmark (the
  navbar's typographic "AQ" is crisper at any size), and `svg/linked.svg` + `svg/instagram.svg`
  are an incomplete social set with **no GitHub mark** — a partial set is worse than the
  current text labels. They remain in `assets/` if wanted later.

**Also fixed, found while auditing:**
- `tracking-[0.15em]` / `[0.2em]` / `[0.3em]` were Tailwind **arbitrary values** in eight
  places, which breaks Phase 2's rule. My earlier audit grep (`\[[a-z-]*:`) only caught the
  `[property:value]` form and missed bare `[0.15em]`. Added named `letterSpacing` tokens
  (`tracking-label` / `tracking-mark` / `tracking-eyebrow`). **Use the widened audit from now
  on:** `grep -rno "tracking-\[[^]]*\]\|leading-\[[^]]*\]\|text-\[[^]]*\]\|w-\[[^]]*\]\|h-\[[^]]*\]" app components`.
- `scripts/cdp.mjs` now sends `Network.setCacheDisabled`. The driver reuses one Chrome profile
  per port, so its HTTP cache survived between runs; combined with Next's own
  `.next/cache/images`, screenshots kept showing the **pre-swap** images long after the server
  was serving the correct ones. I chased that for several rounds — curl of
  `/_next/image?...` proved the server right and the screenshot wrong. **If an image change
  seems not to apply, `rm -rf .next` before doubting the code.**

**Verified:** 15 images on the homepage, **0 broken, 0 without alt text, 0 whose alt is a
filename**, all lazy, all through `next/image`; all three detail heroes resolve to the correct
`-hero` file and are eager-loaded; each card now shows its own project's graphic (screenshot
checked after a full cache clear); certification links resolve to the four verify URLs and the
n8n entry opens the lightbox; `npm run build`, `npm run lint` and `tsc --noEmit` all clean.

**Next up:** unchanged — **Phase 12 (Section-Transition Macro-Layer)**, then 13 and 14. See the
Phase 11 entry below for the Phase 12 task breakdown.

### Session 1 (cont.) — 2026-08-21 — Phase 11: Scroll Choreography Pass
**Did:**
- **`Reveal`** — the one entrance reveal for the site: fade + translateY + slight scale on
  `whileInView`, `once: true`, collapsing to opacity-only under reduced motion. Replaced the
  ad hoc `whileInView` blocks that had accumulated in Skills and Contact. Anything genuinely
  *scrubbed* (the timeline rail, the hero transform) stays GSAP and deliberately does not go
  through this.
- **The flagship Hero → About transform**, in `HeroChoreography`: the hero pins and its copy
  is scrubbed directly to scroll position — scaling from 1 to 0.46, lifting, and fading to
  0.18 as About takes focus. **GSAP ScrollTrigger with `pin` + `scrub`**, not Framer Motion's
  `useScroll`/`useTransform` (the criterion this phase names explicitly).
- `Hero` stays a **Server Component**: `HeroChoreography` takes the background layers and the
  copy as props/children, so the page's LCP element is still server-rendered. The background
  (constellation, orbs) stays put while the copy transforms away over it.
- Gating is `gsap.matchMedia()`, which reverts cleanly when a condition stops matching:
  `(min-width: 640px) and (prefers-reduced-motion: no-preference)`. So **no pin and no scrub
  at all** under reduced motion, and none below 640px.

**A bug worth remembering:** the first version also applied `xPercent: -18`. With
`transform-origin: top left`, scaling *already* draws the content toward the corner, so the
extra translate pushed the heading clean off the left edge — the screenshot showed "bdul
Qadir" clipped at x=0. The spec says the hero moves *into* a corner, not out of frame. Now
scale + a small lift only, and the heading's left edge is verified to stay positive
(161px → 122px → 84px through the scrub).

**Verified (via `scripts/cdp.mjs`):**
- **Genuinely scrubbed, and reversible:** scale `1.000 → 0.836 → 0.672 → 0.509` scrolling
  down, and exactly `0.672 → 0.836 → 1.000` scrolling back up, with opacity tracking
  `1 → 0.75 → 0.50 → 0.25` and back.
- **No layout shift through the pin:** `document.scrollHeight` (10788) and About's absolute
  offset (1489) are identical before, during and after the pin, and the browser's own
  `layout-shift` observer reports **CLS = 0.0018**.
- **Reduced motion:** transform stays identity at every scroll position and nothing pins.
- **Mobile (390px):** same — identity transform, no pin, per the documented simplification.
- Screenshot mid-transform confirms the copy shrinking into the top-left corner, on-screen,
  over a stationary constellation.

**Next up:** **Phase 12 — Section-Transition Macro-Layer.** Only the four boundary transforms
remain, and they must all be GSAP ScrollTrigger-scrubbed and collapse to a cross-fade under
reduced motion:
- **Hero → About:** a travelling gradient blob folded into the **existing** timeline in
  `HeroChoreography` — PHASE_PLAN is explicit that this must not be a second, competing
  timeline.
- **About → Skills:** the ambient dot grid becomes more defined. `DotGrid` already takes an
  `intensity` prop and every instance carries a `data-dot-grid` attribute, so scrub its
  opacity rather than swapping the prop.
- **Skills → Projects:** carry the ecosystem's connecting-line language into the project
  grid — a shared visual grammar, explicitly *not* required to be a literal shape morph.
- **Projects → Contact:** background gradually darkens.
Then Phase 13 (404, metadata, sitemap, OG) and Phase 14 (perf/a11y/easter egg/deploy).

**Blockers / open questions:** unchanged, and Phase 14 cannot finish without them. Needed from
Abdul: 3 project hero images, 5 certificate images, 6 award images, the About portrait, the
résumé link, the project live/repo links, the contact-form-vs-links decision, and — new for
Phase 13/14 — the **production domain** (`siteUrl` in `content/data.ts` is still the
placeholder `https://abdulqadir.dev`) plus a Vercel account to deploy to.

### Session 1 (cont.) — 2026-08-21 — Phase 10: Skills, Contact, Footer
**Did:**
- **`SkillEcosystem`** — the floating ecosystem, **not bars and not cards** (the acceptance
  criterion PHASE_PLAN says to double-check explicitly). A centred `AI ENGINEER` hub with four
  core-skill nodes on an inner orbit and the five stack groups on an outer one, each joined to
  the hub by a thin violet→cyan gradient line whose opacity falls off for the outer orbit —
  the same line-connection language as `ConstellationCanvas`.
- **Proficiency drives node diameter and glow**, never a bar: React.js (95%) renders at 80px
  against HTML/CSS/JS (80%) at 56px, measured. The exact number appears only in the
  hover/focus panel.
- Each node is a real `<button>` — keyboard reachable, with `aria-describedby` pointing at an
  `aria-live="polite"` info panel, so tabbing onto a node announces "Python, Django & FastAPI
  90% proficiency" rather than the detail being mouse-only.
- Three fixes that only showed up in screenshots, not in the code:
  1. Labels were overflowing their circles. The circle is now purely the sized/glowing node
     and the label sits **outside** it, so a long name can never overflow.
  2. The connecting lines ended at the button's centre (below the circle). Nodes are now
     anchored so the *circle* sits on the orbit point.
  3. At 390px the outer orbit's labels collided with the core ones and clipped off-screen.
     Below `sm` the five group nodes are dropped in CSS (`hidden sm:block`, so no hydration
     flash) — nothing is lost, since all of them are listed in full in the tag list directly
     below. The hub also shrinks below `sm`, because at mobile scale it was large enough to
     hide the connecting lines underneath itself.
- Broader stack renders as a plain tag list (no invented proficiencies) and spoken languages
  as circular badges.
- **`Contact`** — terminal skin (window chrome, `$ connect --with AbdulQadir` with a blinking
  caret) over real content. The prompt line is `aria-hidden` decoration; the three contact
  methods are genuine `mailto:` / `tel:` / LinkedIn links, each in a `MagneticWrapper`.
  **`contact.formEnabled` is still `false`**, so no form ships — that is PHASE_PLAN's
  instruction while the question is unanswered, not an oversight.
- **`Footer`** — a server component: identity block, section nav, social links, copyright and
  a back-to-top control.

**Verified (via `scripts/cdp.mjs`):** 9 nodes and 9 connecting lines with a centre hub; **no
percentage text visible at rest**; node diameters 80/72/56/56px tracking 95/90/80/80%; contact
links resolve to `mailto:abdulqadir12511@gmail.com`, `tel:+9232454224298` and the real
LinkedIn URL with **zero dead links**; footer has 10 links, none dead, three socials opening in
new tabs; no `<form>` present; all seven section ids exist; no horizontal overflow.
Screenshots checked at 1424 and 390.

**Testing note (third instance of the same trap — read this before debugging focus):** the
headless page reports `document.hasFocus() === false`, so a programmatic `element.focus()`
sets `activeElement` **without dispatching focus events**, and React's `onFocus` never fires.
The skills info panel looked broken for exactly this reason. Use
`scripts/cdp.mjs --press-tab N --then <script>` to move focus with real key events.

**Next up:** **Phase 11 — Scroll Choreography Pass.**
- Build the shared `Reveal` component (fade + translateY + slight scale via `whileInView`,
  firing once) and replace the ad hoc per-section reveal logic that has accumulated in About,
  Services, Projects, Skills and Contact with it.
- The flagship Hero → About moment: pinned and **scrubbed with GSAP ScrollTrigger**, not
  Framer Motion's `useScroll`/`useTransform` — the hero visual starts large and centred, then
  scales down and translates into a corner as About takes focus. `lib/gsap.ts` already has the
  Lenis wiring this depends on, verified back in Phase 3.
- Under reduced motion every scroll-linked effect must collapse to a plain fade — no pinning,
  no parallax. Verify by sampling transforms at several scroll positions in both directions,
  the way Phases 6 and 8 were verified.
- **Mobile Safari caution** (`CLAUDE.md` §4): pinning is the most common source of jank there.
  A fade-based fallback below `sm` is an acceptable, expected simplification — decide and log
  it rather than shipping a pin that janks.

**Blockers / open questions:** unchanged. Still needed from Abdul: 3 project hero images, 5
certificate images, 6 award images, the About portrait, the résumé link, the project live/repo
links, and the contact-form-vs-links decision (the form is a one-flag change now —
`contact.formEnabled` in `content/data.ts` — plus building the form itself).

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

- **2026-08-26 — the Phase 12 Hero → About travelling blob is deleted, and the macro-layer is
  largely superseded by the field's scroll story.** `PHASE_PLAN.md` Phase 12 specifies a
  travelling gradient blob folded into the hero timeline. Abdul asked for it removed: it read
  as a generic glowing ball with nothing to do with an AI portfolio, and it was the only thing
  making that boundary feel like an event. Continuity now comes from the neural field morphing
  its whole topology continuously across all seven sections, which satisfies Phase 12's actual
  goal ("one continuous scroll rather than sections stacking") far better than four
  boundary-local tweens did. The other three boundaries in `SectionTransitions` are **kept** —
  they still work and they reinforce the field rather than competing with it. **Do not
  reinstate the blob.**
- **2026-08-26 — the Projects → Contact darkening layer scrubs to 0.72, not 1.** Phase 12 says
  "background gradually darkens", and it still does. But that layer is at `-z-10`, above the
  field at `-z-20`, so full opacity blacked out the `converge` stage — the ending of the scroll
  story. Capping it keeps the darkening and the payoff.
- **2026-08-26 — the navbar is no longer fully transparent over the hero.**
  `DESIGN_SYSTEM.md` specifies transparent-over-hero → glass-on-scroll. The transition is
  intact, but the at-rest state now carries `.nav-veil`, a masked blur+darken band behind the
  labels. Reason: the bar sits over the live neural field, and with a genuinely transparent bar
  the mesh's lit connections crossed the nav text and made it unreadable — Abdul reported it.
  Accessibility outranks the doc here (`CLAUDE.md` §4). The veil fades out before the element
  ends, so the bar still reads as transparent rather than as a solid strip. To go back to a
  fully transparent bar, delete the veil element in `Navbar.tsx` — and re-check readability
  over a lit cascade before keeping it.
- **2026-08-26 — the constellation is now a neural field, and it stayed on 2D canvas rather
  than moving to Three.js/R3F.** Abdul's brief asked for an "AI neural-network interface" and
  said to use "the existing Three.js/R3F setup if possible", with R3F/three/drei "fine if
  already installed or genuinely useful". Neither is installed, and `CLAUDE.md` §2 mandates a
  hand-rolled canvas — so both of the brief's own conditions pointed at canvas. The depth in
  the effect is perspective scaling and layered parallax, which is a projection problem rather
  than a GPU one, and the measured cost is ~1–2 ms of JS per frame at a locked 60 fps, so there
  is no performance argument for WebGL either. **Do not "upgrade" this to R3F without a reason
  that survives those numbers** — it would add several hundred KB to a page whose historic weak
  point is main-thread time. `ConstellationCanvas`/`ConstellationMount` are deleted; the one
  engine is `lib/neural-field.ts`.
- **2026-08-26 — `DESIGN_SYSTEM.md`'s constellation section is now doubly superseded.** It
  already did not hold on scope (the field is site-wide, not hero-only — Abdul's call, logged
  2026-08-22). It now also does not hold on *behaviour*: nodes are anchored with a permanent
  k-nearest topology rather than free-drifting with proximity-based lines, and the pointer is a
  first-class actor (attraction, activation, signal injection, tendrils, velocity trail) rather
  than a parallax multiplier. Treat `lib/neural-field.ts`'s header as the spec for this effect.
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
- **2026-08-21 (Phase 14) — the boot-sequence loader does not play below 640px.**
  `DESIGN_SYSTEM.md` specifies the loader without qualifying viewport, but measurement showed
  it was the largest single performance cost on the page, and a 1.3s opaque overlay consumes
  most of the mobile LCP budget. Desktop keeps it in full. This is the same mobile-
  simplification licence `CLAUDE.md` §4 grants the hero pin. To restore it everywhere, drop
  the `isCompact` gate in `LoaderMount` — and re-measure before you keep the change.
- **2026-08-21 (Phase 13) — added `accent-violet-text` (#A78BFA), a second violet.**
  `DESIGN_SYSTEM.md` specifies one main accent, and this does not change it: `accent-violet`
  remains the brand colour for fills, borders and glows. But that violet as **small text**
  measures 3.49:1 on `bg-base` and 3.03:1 over the heading glow, failing WCAG AA (4.5:1), which
  Lighthouse flagged. The new token is the same hue at 7.31:1 / 6.34:1 and is used only for
  type and icons. Accessibility is non-negotiable per `CLAUDE.md` §4, so this wins over strict
  single-accent purity. Don't revert `text-accent-violet-text` back to `text-accent-violet`.
- **2026-08-21 (Phase 11) — the flagship hero transform does not pin below 640px.**
  `CLAUDE.md` §4 names scroll-pinning as the single most common source of jank on mobile
  Safari and explicitly allows a simpler per-section fallback on small viewports. Mobile gets
  the hero as a normal, unpinned section; the pin and scrub are gated behind
  `gsap.matchMedia("(min-width: 640px) and (prefers-reduced-motion: no-preference)")`. If this
  is ever revisited, test on a real iOS device, not just a narrow desktop window.
- **2026-08-21 (Phase 10) — the skills ecosystem is DOM nodes + SVG lines, not one canvas.**
  `DESIGN_SYSTEM.md` calls Skills "a third context/config" of the constellation's
  line-connection approach. The *approach* is shared — thin violet→cyan lines, opacity falling
  off with distance — but the nodes are real `<button>`s rather than canvas paint, because each
  one is a labelled control that has to be keyboard-reachable and screen-reader-readable, and
  canvas content is neither. A genuine `ConstellationCanvas` instance (sparse, wide, parallax
  only, no attraction) still runs behind the section as its ambient field, so the third config
  does exist. Don't "fix" this by moving the nodes into the canvas.
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

- ~~Project / certificate / award images, and the About portrait~~ — **all supplied and
  wired 2026-08-21.** Zero image placeholders remain.
- **Navbar wordmark is a 156x29 raster** and looks jagged. Needs an SVG or a 2-3x PNG from
  Abdul.
- **The hero portrait cut-out is derived, not supplied.** Regenerate it if `portrait.png`
  changes; a real background-removed export would be better than any luminance key.
- **Loader still appears ~600ms after first paint** when motion is enabled, instead of
  covering the page from the first frame. See the session entry dated 2026-08-21 for the full
  fix (SSR the overlay + an inline `<head>` script setting `data-loader`).
- **Confirm with Abdul:** `CONTENT_BRIEF.md` listed a **"Best Developer"** award, but no image
  matches it. The six award files map to six *other* awards (the strongest being the
  AIR ROBOTRONICS '24 C++ win), so "Best Developer" was dropped rather than guessed at. If it
  is a separate award, it needs its own entry; if it was shorthand for the C++ win, nothing to
  do.
- **Confirm with Abdul:** several titles now use the certificates' exact wording rather than
  the brief's. Most notably the brief's "Python Specialization" is really the single course
  *Programming for Everybody (Getting Started with Python)* (University of Michigan), and both
  the Hult Prize and Data Fest entries turned out stronger/more specific than the brief said
  (Hult is a **winning team**, not just participation).
- **Links still `[TODO]`:** résumé/CV link; live + repo links for **Pest Eye** and **Netflix
  Stock Price Predictor** (Customer Segmentation's Hugging Face Space was recovered from its
  screenshot and is wired). All five certification links are now resolved — four Coursera
  verify URLs, and n8n opens a lightbox as it has no public URL. Phase 9 must degrade these gracefully (button hidden/disabled, never a
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

Measured against a local **production build** (`next build` + `next start`), Lighthouse CLI,
2026-08-21. **Both presets are recorded, because they differ enormously and quoting only one
would be misleading.**

| Category       | Desktop preset | Mobile preset (default) | Date |
|----------------|----------------|-------------------------|------|
| Performance    | **100**        | 73–91 (median ~80)      | 2026-08-21 |
| Accessibility  | **100**        | **100**                 | 2026-08-21 |
| Best Practices | **100**        | **100**                 | 2026-08-21 |
| SEO            | **100**        | **100**                 | 2026-08-21 |

Desktop: LCP 0.7s, TBT 40ms, CLS 0.

**Read the mobile number carefully before acting on it:**
- Lighthouse's default preset applies **4× CPU throttling and slow-4G**, on top of a dev
  machine that was simultaneously running Abdul's own browser (32 Chrome processes) and Node
  builds. Repeat runs of *identical code* scored 73, 78, 79, 80, 87 and 91 — a ±18 point
  spread from machine load alone. **Never draw a conclusion from a single run.**
- This is `next start` on localhost: no CDN, no Brotli, no edge caching. A real Vercel
  deployment should measure better.
- **Re-run against the deployed URL before treating the mobile figure as final** — that is the
  measurement Phase 14 actually asks for, and it is the one still outstanding.
