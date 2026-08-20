# Design System

## Direction

**"AI operating system / digital laboratory."** Dark, sophisticated, futuristic, restrained
— luxury technology, not a gaming site. The test for every effect below: does it react to
the user (cursor, scroll, hover), or does it just run continuously in the background?
Reactive is the goal. Ambient motion should be almost invisible; the "wow" comes from things
responding when touched, not from constant movement.

## Color tokens

```
--bg-base:        #08090D   /* page background */
--bg-surface:      #0E1016   /* raised sections, nav */
--bg-glass:        rgba(255,255,255,0.04)   /* card fill, use with backdrop-blur */
--border-subtle:   rgba(255,255,255,0.08)   /* thin borders throughout — a signature of this look */
--border-hover:     rgba(124,58,237,0.4)    /* violet, on card/element hover */

--text-primary:    #F5F6FA
--text-secondary:  #9CA3AF

--accent-violet:   #7C3AED   /* the one main accent */
--accent-indigo:   #6366F1
--accent-cyan:     #22D3EE   /* very subtle atmospheric use only — see below */
--accent-pink:     #EC4899   /* rare highlight only — sparkles, one-off emphasis */
--accent-emerald:  #34D399   /* checkmarks, success/positive states only */

--gradient-primary: linear-gradient(135deg, var(--accent-violet), var(--accent-indigo) 50%, var(--accent-cyan))
--glow-primary:     0 0 40px rgba(124,58,237,0.25)
```

One main accent (violet), with cyan/purple used only as **very subtle atmospheric
gradients** — soft radial light behind key sections, not flat color blocks. Large
typography, generous whitespace, thin borders over heavy ones, glass only where it earns its
place (cards, nav) rather than everywhere.

Contrast check: `--text-primary`/`--text-secondary` against `--bg-base`/`--bg-surface` both
clear WCAG AA. Gradient text is for short headline phrases only, never body copy.

## Typography

- Headings + body: **Geist Sans** (or Inter as fallback) via `next/font`
- Accent/mono: **Geist Mono** / **JetBrains Mono** — role tags, tech pills, and the terminal
  contact form's monospace lines
- Large, confident hero type (fluid/clamp-based); generous line-height and section spacing —
  the whitespace is doing real work in this direction, don't crowd sections

## Background layer

Very dark base + an extremely subtle dot grid + a handful of tiny ambient particles +
occasional slow animated gradient + soft radial light behind important sections + a very
faint, slow-moving noise/grain texture (a single low-opacity CSS/canvas layer — cheap, and it
is what keeps flat dark sections from looking sterile). All of it should read as barely
perceptible ambience, not as the constellation itself — the constellation is a separate,
higher-detail layer confined to the hero (see below).

---

## The original 20-item checklist — decisions (carried over, still current)

| # | Item | Decision | Notes |
|---|------|----------|-------|
| 1 | Custom 404 page | **Include** | Lost-in-space/constellation motif, ties to the hero |
| 2 | Unique page titles | **Include** | `generateMetadata` per route |
| 3 | Harsh gradients | **Soften, don't skip** | Smooth multi-stop violet→cyan gradients, used atmospherically, not hard-stop/clashing ones |
| 4 | Lucide icons | **Include** | Sole icon set, used consistently everywhere |
| 5 | Rainbow coloring | **Skip as literal full-spectrum** | One main accent + subtle atmosphere keeps this cohesive; a real rainbow fights that |
| 6 | Drop shadows | **Include** | Neutral for elevation, colored glow for hover/active |
| 7 | Liquid glass | **Include** | Cards, nav bar — glass only where it earns its place |
| 8 | Bento grids | **Include, scoped to Services** | Skills is now the floating ecosystem, not a grid — bento still fits Services and, optionally, a compact tech-stack summary |
| 9 | "It's not X, it's Y" copy | **Optional, one instance max** | Hero/about tagline only, if it matches your voice |
| 10 | Checkmark bullets | **Include** | Services sub-points |
| 11 | Soft color radius (ambient glow) | **Include** | Diffused glow behind headings/cards |
| 12 | Radial orbs | **Include** | Ambient background, now joined by the noise texture and constellation layers above |
| 13 | Dot grids | **Include** | Background texture, becomes more visible at the About transition per the section-transition layer |
| 14 | Sparkle icons | **Include, sparingly** | Small accents near key headings/CTAs only |
| 15 | Animated arrows | **Include** | Scroll indicator, CTA buttons, nav hover |
| 16 | Hover animations | **Include** | Core requirement, now considerably richer — see Signature effects below |
| 17 | Neon colors | **Include, as glow only** | Border-glow, hover text-glow — never neon fills |
| 18 | Basic pastel colors | **Skip as primary** | Fights the dark, luxury-tech direction |
| 19 | Framer Motion | **Include** | UI-level animation — see `CLAUDE.md` §2 for the Framer Motion / GSAP split |
| 20 | Optimized | **Include, always** | Lighthouse ≥ 90 all categories — harder now given the added weight, see `CLAUDE.md` §4 |

---

## Signature effects

### Loader (boot sequence)
Shown once per session (gate with `sessionStorage`, not on every route change — see
`CLAUDE.md` §4). Minimal "AI system booting" beat, ~1–1.5s total, then transitions into the
page:
```
        AQ
Full Stack AI Engineer

████████████░░░░ 78%

INITIALIZING SYSTEM...
LOADING NEURAL INTERFACE...
LOADING PROJECTS...
READY.
```
Progress bar fill and the four status lines are timed (GSAP timeline is a good fit here —
it's a linear sequence, not scroll-driven, so either GSAP or Framer Motion works; pick one
and keep the loader's own logic self-contained). Reduced motion: skip straight to the site,
no loader shown at all.

### Cursor — dual layer, magnetic, contextual
Two independently-animated layers:
- **Outer:** a larger translucent circle, springs/lags smoothly toward the pointer
  (`useMotionValue` + `useSpring`, moderate stiffness/damping — this is the "large translucent
  circle that smoothly follows" layer)
- **Inner:** a small dot, tracks pointer position almost immediately (little to no spring)

On hoverable elements: outer circle expands, its border shifts to the accent color, and a
short contextual label appears inside it — `VIEW`, `OPEN`, `EXPLORE` (per-element, passed as
a prop/data attribute so each interactive element controls its own label). Buttons and links
marked "magnetic" pull slightly toward the cursor within a proximity radius: the *element
itself* translates a small, distance-weighted, clamped amount toward the pointer (not just
the cursor snapping to it) — keep the pull subtle, a few pixels of max travel, not a
teleport.

`mix-blend-mode: difference` (or similar) keeps both layers visible over any background.
Entirely unmounted — not `display: none` — on touch devices and under reduced motion.

### Constellation — two contexts, one canvas approach
Hand-rolled `<canvas>` (see `CLAUDE.md` §2 for why not Three.js), used in two places with the
same underlying particle/line-connection logic, different scope:
1. **Hero-ambient:** a loose field across the hero background — particles drift slowly, a
   connecting line draws between any two within a distance threshold (opacity falls off with
   distance), gentle pointer-reactive parallax across the whole field.
2. **Portrait-tied:** if a profile photo is used (see `CONTENT_BRIEF.md` — flagged as a
   needed asset), a *tighter* node cluster around it — glowing nodes, thinner/denser
   connecting lines, and a more pronounced reaction on hover directly over the portrait
   (nodes pull toward the cursor, lines brighten). Same canvas component, different
   config (particle count, radius, connection distance, interactivity strength) — don't
   build a second implementation from scratch.

Both: particle count scales down on smaller viewports, `requestAnimationFrame` loop pauses
on `document.visibilitychange`, reduced motion falls back to a static rendered frame (no
animation loop at all, not just a slower one).

### Scroll-driven hero transform
GSAP ScrollTrigger, pinned: as the user scrolls from Hero into About, the hero
portrait/visual starts large and centered, then scales down and translates into a corner
(becoming a small floating element) as the About section's content takes visual focus —
scrubbed directly to scroll position, not a fixed-duration animation. This is the flagship
"old content transforms into the next" moment for the whole page.

### Text reveal (About)
Progressive reveal tied to scroll position rather than firing all at once: words/lines start
dim (`text-secondary` or lower) and brighten to `text-primary` as they cross into the
viewport — either a per-word GSAP ScrollTrigger scrub, or a Framer Motion stagger keyed off
scroll progress. Pair with the portrait becoming a small floating parallax element per the
hero-transform above.

### Skills — floating AI ecosystem
Not skill cards, and not progress bars — the old portfolio's linear percentage bars are
explicitly retired in favor of this. A centered node (`AI ENGINEER` or similar) with the skill nodes
(`React.js`, `Python, Django & FastAPI`, `HTML, CSS & JS`, `Agentic AI`, plus the broader
stack tags from `CONTENT_BRIEF.md`) gently floating/orbiting around it, connected by thin
lines back to the center — visually a sibling of the constellation, reusing the same
line-connection rendering approach. Map each core skill's proficiency percentage (from
`CONTENT_BRIEF.md`) to node size and/or glow intensity rather than dropping the percentages
— reveal the exact number in the hover/info panel. On hover: node grows, its connection line
brightens, a small info panel appears with the skill name and (for the four core skills) its
percentage.

### Services — magnetic 3D cards
`GlassCard` base, hover state: mouse-following 3D tilt (**3–6° max**, subtle — this is a cap,
not a target), a soft glow that follows the cursor within the card, contents (icon vs. text)
shifting at very slightly different depths for a parallax feel, icon rotates/scales on hover.
Combine with the magnetic cursor pull from the global cursor spec where the card itself
counts as a "magnetic" element. `:focus-visible` gets an equivalent static glow/border state
— tilt and cursor-spotlight have no keyboard analog, so the focus state needs to communicate
"interactive and focused" on its own.

### Experience — animated timeline
A vertical line that **grows as the user scrolls** (GSAP ScrollTrigger scrub tied to
scroll progress through the section, not a fixed-duration draw), with a node per entry from
`CONTENT_BRIEF.md`. The active node (the one currently in/near viewport) glows. Education
entries render in the same timeline, distinguished with a small type badge (see
`PHASE_PLAN.md` Phase 8).

### Projects — reveal + hover follow
On scroll into view: project image starts slightly zoomed with a dark overlay, overlay fades
out, title slides in, tech tags stagger in after. On hover (desktop only): the image shifts
slightly toward the cursor position within the card bounds (a small parallax-style follow,
not a full drag). Click → `/projects/[slug]` detail page (per `PHASE_PLAN.md` Phase 9).
**Skipped, deliberately:** a separate text-list-of-titles-with-a-cursor-following-thumbnail
pattern (common on agency sites with a plain link list). It's a strong effect, but this
portfolio already shows project images directly in the card grid — adding a second, parallel
"preview" mechanism for the same images would be redundant rather than additive. If you'd
rather replace the card grid with that text-list-and-preview pattern entirely, that's a
straightforward alternative — flag it as a scope change in `PROGRESS.md` if you want it.

### Contact — interactive terminal
Themed as a terminal:
```
$ connect --with AbdulQadir

Name: _
Email: _
Message: _

[ SEND ]
```
with a typing-animation feel on the prompt line and monospace type throughout. Underneath,
it is a real, standard, accessible form — see `CLAUDE.md` §4. The terminal aesthetic is the
skin, not the accessibility model.

### Navbar
Transparent over the hero. On scroll: transitions to a glassy, blurred, bordered bar with a
smooth height reduction (compacts as you scroll), an active-section indicator, and an
animated underline on the current nav item. Framer Motion is enough here — this is a state
transition (transparent → glass), not a scroll-scrubbed timeline.

### Section-transition macro-layer
The layer that stitches every section boundary above into one continuous experience rather
than sections simply stacking:
- **Hero → About:** the scroll-driven hero transform above (a large gradient blob/glow can
  travel across the screen as part of this same scrubbed timeline)
- **About → Skills:** the ambient background grid becomes more visible/defined
- **Skills → Projects:** the ecosystem's connecting-line visual language morphs into the
  project cards' layout (a shared visual grammar between the two sections, not necessarily a
  literal shape-morph animation)
- **Projects → Contact:** background gradually darkens

Build this as its own pass (`PHASE_PLAN.md` Phase 12) once every individual section already
works on its own — it's a layer on top of finished sections, not a replacement for their own
entrance animations. Every transform in this layer is GSAP ScrollTrigger-scrubbed, and every
one collapses to a plain cross-fade under reduced motion — no pinning, no blob travel, no
morph, just content in the right order with an instant or fade transition.

### Easter egg
One, subtle, optional, low-stakes: typing `sudo hire-me` anywhere on the page (a simple
`keydown` buffer, no dependency needed) triggers a small on-brand reveal —
```
> Access granted.
> Let's build something amazing.
```
Not gated behind reduced-motion (it's user-initiated and tiny), not referenced anywhere in
the UI, not central to any phase's acceptance criteria — build it last, and only once
everything else is solid.

### Reduced motion, universally
One shared `useReducedMotion` hook, checked by every effect above **including GSAP
timelines** — the fallback is never "skip the section," it's "same content, instant or
fade-only transition, no parallax, no pinning, no magnetic pull, no cursor-follow."
