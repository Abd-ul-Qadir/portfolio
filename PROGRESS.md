# Progress Tracker

> **Claude Code: read this file fully before doing anything else.** Update it before you
> stop working, every time — see `CLAUDE.md` §0 for the exact rule. This file is the only
> thing that survives a context reset; treat every edit to it as important as an edit to code.

Last updated: 2026-09-07
Repo status: published at `https://github.com/Abd-ul-Qadir/portfolio`; `main` tracks `origin/main`.
Phases 0–14 are committed except the Vercel deploy, which is blocked on Abdul's account.
Real image assets wired in. The constellation has since been
replaced by an interactive neural field. The contact form is now real and sends email via
Resend — it needs `RESEND_API_KEY` set before it can deliver. See the newest session-log entry.

---

## Current phase

> **Phase 14 substantially complete — the build is finished and shippable.** Everything in
> Phase 14 is done except **deploying to Vercel**, which needs Abdul's account, and the
> final Lighthouse run against the production URL that depends on it. See Blockers.
>
> **Re-verified 2026-08-29, and Performance now passes.** Lighthouse on a quiet machine:
> **Performance 95-98 / Accessibility 100 / Best Practices 100 / SEO 100**, against a bar of 90.
> The 87-88 recorded on 2026-08-27 was machine contention, not the code — see that session's log
> for the interleaved A/B against `HEAD` that establishes it. **Read the load caveat there before
> re-measuring:** identical code scored 58 at 65% CPU and 98 at 12% CPU in the same sitting.
>
> **Plus one setup step, updated 2026-08-27:** the contact form is live and **sending** —
> `RESEND_API_KEY` is set in `.env.local` and a test message was delivered end-to-end. Because
> `.env.local` is gitignored, the same variable must be added to the Vercel project's environment
> variables at deploy time, or the deployed form falls back to the 503 path.

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

### Session 4 (cont. 24) — 2026-09-07 — Navbar wordmark enlarged

The navbar wordmark is slightly larger at 136×25 rendered pixels, up from 124×23. Its width
remains a named Tailwind design token and stays below the source artwork's native 156×29 size,
so the change does not add a larger asset request, alter navbar height, or introduce layout
shift. The same fixed size is used at every breakpoint and still leaves the compact menu and
desktop navigation row their existing space.

### Session 4 (cont. 23) — 2026-09-07 — Loader hydration regression fixed

Abdul reported that the revised loader reached about 21% and then revealed the hero. His browser
log established the exact cause: the pre-hydration timer had changed React-owned bar text in the
SSR shell, so hydration failed and React rebuilt the loader while its animation still referenced
the discarded DOM. The raw `<script>` also produced React's "script tag while rendering" error.

The gate now uses Next.js 16.3's supported `next/script` `beforeInteractive` path from `<head>`.
The SSR-only `loader-pending` class covers the hero before that queued script executes, with CSS
media-query skips for compact and reduced-motion visits plus a `<noscript>` escape hatch. The
pre-hydration ticker records progress in a browser-owned global without mutating React's markup;
`useLayoutEffect` picks up that value without resetting the display. The show/skip decision also
lives outside the hydrated DOM so React cannot discard it. Completion now animates visibly to
100%, holds there for 180 ms, fades, and only then unmounts the shell.

A clean development-browser trace showed 0 → 28 → 52 → 73 → 95 → 100, with no hydration,
script, or runtime errors (only the expected React DevTools and HMR messages). A production trace
also reached and held 100% before removal, with an empty console. At 390 px and under reduced
motion the shell existed only as SSR markup and was never visually displayed. ESLint, strict
TypeScript, and the 12-route production build pass.

### Session 4 (cont. 22) — 2026-09-07 — Loader is first-paint and load-aware

The boot loader no longer mounts after hydration on top of an already-visible hero. Its shell
is now emitted before the page content in the initial HTML, while a tiny synchronous script at
the start of `<body>` decides before first paint whether the visit should show it. The existing
rules remain intact: it plays once per browser session on desktop, and is skipped for compact
viewports and reduced motion. The shell is hidden by default, so storage/script failures cannot
trap visitors behind an overlay; a 15-second safety release provides a second fallback.

Duration is now coupled to real readiness instead of a fixed animation timer. A lightweight
pre-hydration ticker advances the visible bar while JavaScript is still downloading, GSAP takes
over without resetting it, and 100% is reserved for `window.load`, `document.fonts.ready`, and
two completed paint frames. Local production verification confirmed that the loader covered the
hero on the first observable desktop frame, completed in about 1.5 seconds on the fast path, and
remained visible for about 7.9 seconds under a 50 KB/s + 300 ms latency throttle. Reduced-motion
and 390 px visits skipped it without blocking content. Lint, TypeScript, and the production build
pass across all 12 routes.

### Session 4 (cont. 21) — 2026-09-07 — Personal GitHub publication

The personal PAT was authenticated through GitHub CLI as `Abd-ul-Qadir` and stored in the
Windows keyring. The existing empty public repository `Abd-ul-Qadir/portfolio` is now `origin`,
and `main` has been pushed with upstream tracking. Repository-local Git identity now uses
`Abdul Qadir <96332025+Abd-ul-Qadir@users.noreply.github.com>`, tying commits unambiguously to
the personal account without exposing an email address. The repository-specific GitHub
credential helper resolves to `gh auth git-credential`, while the workstation's global company
Git identity and credential helper remain unchanged. Future portfolio updates can use plain
`git push`; `.env.local` and its Resend key were not published.

### Session 4 (cont. 20) — 2026-09-06 — Personal GitHub push preparation

Abdul asked to publish the portfolio to his personal GitHub without attributing the company
account currently used elsewhere on the workstation. No remote existed and GitHub CLI was not
authenticated. The repository had inherited the global company email `icpsportal1@gmail.com`, so
repository-local Git identity is now explicitly `Abdul Qadir <abdulqadir12511@gmail.com>` with
credential username `Abd-ul-Qadir`; global/company configuration was not changed.

All current portfolio work was staged. `.env.local` remains ignored, `.env.example` contains no
values, and a redacted staged-content scan found no GitHub, OpenAI or Resend credential. Lint,
TypeScript and the production build pass across all 12 generated pages. The commit is ready, but
publishing remains pending personal PAT authentication and creation/configuration of the personal
GitHub remote. The PAT must be entered directly into GitHub CLI and stored by the OS credential
manager—never placed in chat, the repository, a remote URL or Git config.

### Session 4 (cont. 19) — 2026-09-06 — Navbar wordmark cache bust

The transparent wordmark still appeared with its former black matte after a hard reload. The
asset itself was verified to contain a variable alpha channel; the stale result came from Next's
image optimizer continuing to serve the cached response for the unchanged source URL. The file
was renamed from `wordmark.png` to `wordmark-transparent.png` and the navbar reference updated,
forcing a new optimization URL and browser request. The old filename no longer exists.

### Session 4 (cont. 18) — 2026-09-06 — Transparent navbar wordmark

Abdul asked to remove the dark rectangular background from the raster “ABDUL QADIR” navbar
wordmark so it sits cleanly on the blurred glass. The image-generation edit path was used first,
but both generated candidates were rejected: they altered the exact lettering, enlarged the
canvas, and one baked in a checkerboard. The final asset therefore uses a deterministic
luminance-to-alpha extraction from the original pixels, preserving the 156×29 lettering and
distressed glitch texture while converting the dark matte into real transparency.

`public/brand/wordmark.png` remains at the same URL and dimensions, so no component or layout
change was needed. The optimized PNG fell from 7,190 to 2,606 bytes. A real Chrome check on the
scrolled/blurred navbar confirmed it loads at the intended 124×23 rendered size; the result was
visually inspected and the optimized response transferred 1,364 bytes.

### Session 4 (cont. 17) — 2026-09-06 — Mobile Lighthouse cost diagnosis

Abdul asked why mobile Performance is 74 despite hiding the hero portrait and disabling hover
behavior. This was a read-only diagnosis; no product code was changed. The portrait is CSS-hidden,
but its `priority` preload still fetched a 12.7 KB `portrait2-cutout` response at 390px. More
importantly, touch mode disables pointer influence but still mounts the neural engine: the browser
reported one canvas with 80 nodes, while the code retains ambient packets, the scroll story,
Resize/Intersection observers, a scroll listener and a 30 FPS draw loop.

The highest-priority issue is still the hero typewriter. It begins with an incomplete visible
string and Lighthouse selected that role line as LCP, attributing 3.69 seconds to element render
delay. Recommended order: render the first role statically on compact viewports; completely skip
the neural engine on touch/compact devices in favor of the existing static field styling (or at
least use a static frame); stop preloading the desktop-only hero image; then split/gate Lenis,
GSAP, Framer Motion and pointer-only enhancements so their implementation chunks are not shipped
merely to return a static mobile fallback. The About portrait's 16 KB image-delivery opportunity
is secondary. Re-run mobile Lighthouse after each isolated change rather than changing all paths
at once.

### Session 4 (cont. 16) — 2026-09-06 — Local production Lighthouse audit

Ran Lighthouse 13.4.1 against a fresh `next start` production server on localhost. No source code
was changed during the audit. The desktop preset scored **Performance 97 / Accessibility 100 /
Best Practices 100 / SEO 100**, with FCP 0.4s, LCP 1.0s, TBT 70ms, CLS 0.008 and Speed Index
1.4s.

The standard mobile audit was repeated and returned the same **Performance 74 / Accessibility
100 / Best Practices 100 / SEO 100** both times. Its representative metrics were FCP 2.4s, LCP
4.0–4.1s, TBT 300–310ms, CLS 0 and Speed Index 5.0s. The LCP element was the animated role line
under the hero name; 3.69s of its LCP was element render delay. The main reported opportunity was
about 45 KiB of unused JavaScript (estimated 290ms), followed by a 150ms render-blocking CSS
estimate and 16 KiB of image-delivery savings for the About portrait. At the load check the
workstation had 31 Chrome and 40 Node processes despite only 12.2% average CPU, so the historical
warning about absolute local mobile scores still applies. Desktop remains above the 90 target;
mobile currently does not. The production server and temporary JSON reports were removed after
recording the results.

### Session 4 (cont. 15) — 2026-09-06 — Footer utility row always visible

Abdul reported that the copyright and Back to top control appeared to be removed after the footer
was shortened. Both remained in the markup, but their scroll-reveal marker could keep the final
row hidden until it crossed the observer threshold. That marker and its delay were removed, so
the utility row is now always visible while the main footer columns retain their entrances.

### Session 4 (cont. 14) — 2026-09-06 — Shorter footer stack placement

Abdul found the footer too tall after the full-width “Built with” rail was added. The stack now
sits beneath the three social links in the footer's third column, using space that was previously
empty beside the longer identity/contact column. The badges were tightened slightly but retain
their four inline marks and full labels. Removing the separate row reduces the desktop footer
panel to 604px tall while keeping its information hierarchy intact.

Lint, TypeScript and the production build pass. Real Chrome checks at 1440×900 and 390×844
confirmed the stack is structurally inside the social column, all four badges render in two rows,
and neither viewport has horizontal overflow. The desktop result was also inspected visually.

### Session 4 (cont. 13) — 2026-09-06 — Optimized page-wide scroll entrances

Abdul reported that the neural background moved while the foreground content simply appeared as
he scrolled. The neural-field implementation and configuration were left untouched. A single
`ScrollRevealController` now observes 33 deliberately marked content groups across About,
Skills, Services, Experience, Projects, Contact and Footer. Section headings rise in consistently;
supporting blocks use restrained rise, side or scale entrances; nearby cards receive capped
stagger delays; and every element reveals only once.

This is intentionally one native `IntersectionObserver` plus CSS opacity/`translate3d`/scale
transitions—no new package, scroll listener, animation loop or per-item React state. Content is
visible in SSR/no-JS and unsupported-browser paths because hiding only activates after the
controller is ready. Reduced motion skips the controller and leaves everything immediately
visible. The old Framer-based `Reveal` wrapper became unused and was removed; Skills and Services
also returned to Server Components because they no longer need entrance-animation hooks. Rich
existing effects (project-card sequencing, timeline rail, portrait interface and contact orbs)
remain in place, while credential cards now correctly wait for viewport entry.

Lint, TypeScript and the production build pass. Real Chrome checks at 1440×900 and 390×844
confirmed a below-fold timeline item begins at opacity 0 with a translated/scaled transform,
settles to opacity 1 and identity transform after scroll, and creates no horizontal overflow.
The reduced-motion run stayed fully visible throughout. All three checks confirmed the neural
canvas remains mounted.

### Session 4 (cont. 12) — 2026-09-06 — Unused content cleanup

Audited the source components, public assets and shared content for dead references. Removed the
unused `spokenLanguages` import/export and corrected the Skills component documentation, which
still described a third language-badge layer that is no longer rendered. No files were deleted:
every source file is imported or is a Next.js route, and the apparently indirect portrait source
and reveal-mask assets are required by the committed cut-out pipeline or Tailwind mask styling.
Lint now completes with zero warnings or errors; TypeScript and the production build pass.

### Session 4 (cont. 11) — 2026-09-06 — Engineer title consistency

The web and mobile hero roles now read “Full Stack Web Engineer” and “Full Stack Mobile App
Engineer.” This replaces “Developer” with “Engineer” for a more consistent professional identity
alongside the primary “Full Stack AI Engineer” title.

### Session 4 (cont. 10) — 2026-09-06 — Hero role headline updated

The rotating role line beneath Abdul's name now cycles through four requested titles: Full Stack
AI Engineer, Full Stack Web Developer, Full Stack Mobile App Developer, and Agentic AI Builder.
Capitalization was normalized for presentation. The first title remains the reduced-motion
fallback and the primary role reused by metadata, the loader, footer and system interface.

### Session 4 (cont. 9) — 2026-09-06 — Focused footer stack with inline brand marks

Abdul deferred the longer SEO/AEO work and asked for the portfolio's technology stack in the
footer, then narrowed the request to the main technologies only and asked for logos. The footer
now lists Next.js, Tailwind CSS, GSAP and Framer Motion as four compact branded badges. Their
marks are inline, `currentColor` SVGs, so the treatment adds no image requests, icon package,
client component, hydration or runtime JavaScript.

Three.js is deliberately absent: it is not present in `package.json`, and the neural-field engine
in `lib/neural-field.ts` is explicitly a hand-rolled 2D Canvas implementation. Lint completes
with the one pre-existing `spokenLanguages` warning and no errors; TypeScript and the production
build pass. Real Chrome checks at 1440×900 and 390×844 confirmed all four labels and SVG marks
render, the badges stay inside their container, and neither viewport has horizontal overflow.
They form one row on desktop and two clean rows on mobile.

### Session 4 (cont. 8) — 2026-09-06 — Technical SEO and personal-entity audit

Abdul requested an actionable roadmap for making the portfolio and public profiles more visible
for name-plus-role searches and Google AI features. This was a read-only audit; no site or profile
changes were made. Current official Google, Schema.org, GitHub and LinkedIn guidance was checked.

The portfolio already has server-rendered copy, descriptive route metadata, canonicals, robots
rules, a sitemap and individual project URLs. The highest-priority gaps are the still-unconfirmed
production domain, no `ProfilePage`/`Person` JSON-LD, no X/Twitter identity link, all project
`repoUrl` values still null, and inconsistent Instagram URLs between the portfolio and the public
GitHub profile. The GitHub profile's crawlable snapshot also shows Popular repositories rather
than a profile README or curated pins. A `site:abdulqadir.dev` check returned no indexed results,
and broad name/role searches surfaced several unrelated people, making identity disambiguation
the central problem rather than keyword coverage alone.

The roadmap delivered to Abdul prioritizes one permanent canonical domain, consistent identity
facts and reciprocal profile links, `ProfilePage` + `Person` markup matching visible content,
strong project READMEs/case studies, public profile cleanup, first-hand technical articles, and
Search Console measurement. It explicitly avoids guarantees: Google says AI Overviews require no
special markup and neither indexing, ranking, rich results nor AI-feature selection is promised;
LinkedIn's About field is a corroborating public source, not a direct Knowledge Graph feed.

### Session 4 (cont. 7) — 2026-09-06 — Robotic portrait powers the nearby neural field

Abdul suggested matching the background neural network to the robotic portrait while its hover
reveal is active, and gave latitude to choose the treatment. The result is intentionally local:
the resting copper/gold mesh remains unchanged, preserving the portfolio's identity and keeping
the copy side warm. While the pointer reveals the robotic portrait, only the field's already
active circuitry eases from mineral teal into steel blue (`#4D8FE8`) and electric cyan
(`#63DBFF`), matching the portrait's metal channels and illuminated optics.

`HeroPortraitReveal` emits one small event on entry and one on exit. Only the site-wide neural
field listens; local decorative fields do not. The engine eases one scalar palette mix inside
its existing simulation tick and reuses the existing batched edge, packet, node, spark and cursor
tendril passes. There is no new animation loop, React state, per-pointer event allocation, canvas,
filter, shadow blur, or dependency. A second 64px cached glow sprite is generated once, following
the field's established no-runtime-blur approach. Touch and reduced-motion sessions remain on the
normal portrait path and attach no reveal listener.

**Verification:** an optimized production build and `tsc --noEmit` pass. Lint has 0 errors and
the same existing `spokenLanguages` warning. A 1440x900 production Chrome render of the activated
state was inspected: the cool signal stays concentrated around the portrait-side pointer response,
the warm mesh remains intact elsewhere, and horizontal overflow is 0. Temporary browser profiles
and screenshots were removed after inspection.

### Session 4 (cont. 6) — 2026-09-06 — Circular track runners replace oval axes

Abdul asked to remove the ecosystem's oval gyroscope axes and make the filled bars travel around
the remaining circular tracks. Both SVG ellipses and the associated `ecosystem-axis` animation
were removed. The long copper/gold/teal segment now circles the primary carrier every 14s, while
the short inner copper segment counter-rotates every 18s. The hub bezel retains its slower 22s
rotation, giving the circular layers distinct but restrained movement.

The two runners animate their SVG groups with CSS transforms around the shared viewBox centre;
they do not animate `stroke-dashoffset`, add requestAnimationFrame work, or introduce a dependency.
They continue to pause with the full assembly on hover/focus, and `prefers-reduced-motion` makes
both static while removing their `will-change` promotion.

**Verified:** optimized production build and `tsc --noEmit` pass; lint has 0 errors and the same
existing `spokenLanguages` warning. The production CSS contains both 14s/18s runner animations
and the reduced-motion layer cleanup; `git diff --check` passes.

### Session 4 (cont. 5) — 2026-09-06 — Ecosystem upgraded to an animated gyroscope

Abdul asked to improve the ecosystem design again and add animation without sacrificing
optimization. The ring now has more dimensional structure while retaining the existing orbital
interaction:

- two shallow equatorial SVG paths turn the flat dial into a gyroscope-like assembly;
- the optical well is deeper, the hub has a segmented copper/teal/gold bezel, and a quiet outer
  calibration boundary gives the core a more deliberate instrument feel;
- a desktop-only `Core / 04` micro-label is derived from the node count instead of duplicated
  content;
- the 56s main orbit, 56s counter-rotating labels, 34s gyroscope plane, and 22s hub bezel pause
  together on pointer hover or keyboard focus, making the moving targets easier to inspect.

The added motion is CSS-transform-only and consists of one SVG group plus the small masked hub
bezel. It introduces no animation library, requestAnimationFrame loop, timer, listener, filter,
backdrop blur, or dependency. Idle connection-paint animations remain at zero; only an active
hover/focus connection runs. `prefers-reduced-motion` removes every ecosystem animation and the
temporary `will-change` promotion.

**Production verification (`next start`, real Chrome):** the ecosystem measures 576x576 on
desktop and 342x342 on mobile with 0 horizontal overflow. All coupled motion pauses during real
pointer interaction. Under reduced motion, all checked animation names resolve to `none`, their
durations to `0s`, and the browser reports 0 active animation objects. Desktop and mobile renders
were inspected. Optimized build and `tsc --noEmit` pass; lint has 0 errors and the same existing
`spokenLanguages` warning. Temporary browser profiles were removed and the shared CDP helper was
restored byte-for-byte to its repository hash.

### Session 4 (cont. 4) — 2026-09-06 — Ecosystem rotor redesigned and idle paint reduced

Abdul asked for a stronger rotating-ring design without losing optimization. The ecosystem now
reads as one calibrated instrument instead of three faint dashed circles:

- a static radial optical well separates the foreground rotor from the dense neural field;
- a continuous carrier track establishes the orbit, with one asymmetric copper/gold/teal arc
  and a fine teal precision-dot pass making its rotation legible;
- the outer bezel combines a quiet boundary with compact gold calibration ticks;
- the inner telemetry ring uses one short copper segment to give the hub depth;
- all patterns use SVG `pathLength=100`, so their rhythm is identical at both responsive radii.

The additional detail is eight cheap SVG circle primitives inside the **existing single rotor**;
no new animation, timer, filter, blur, event listener or dependency was added. The shared rotation
was slowed from 48s to 56s and promoted as one compositor layer. The four connection signals that
previously animated `stroke-dashoffset` forever are now absent at rest; hover or keyboard focus
starts traffic only on the active connection. This materially reduces idle paint while making the
interaction more intentional.

The component also moved its touched colors from the compatibility aliases to the new semantic
`accent-copper`, `accent-gold` and `accent-teal` tokens.

**Production verification (`next start`, real Chrome):** desktop rotor 576x576 and mobile rotor
342x342, with 0 horizontal overflow. Idle synapse animation count is 0; the active path responds;
the rotor computes to `ecosystem-spin` at 56s. Under reduced motion it computes to `none` / 0s,
with 0 synapse animations. Desktop and mobile screenshots were inspected and removed. Optimized
build and `tsc --noEmit` pass; lint has 0 errors and the same pre-existing `spokenLanguages`
warning. The shared CDP helper was restored to its exact repository hash.

### Session 4 (cont. 3) — 2026-09-06 — Purple AI-default palette replaced

Abdul called out the violet/cyan theme as the generic palette AI tools produce by default and
asked for a different identity. The portfolio now uses a **carbon, burnished copper, warm gold,
and mineral teal** system instead:

- carbon-black `#090B0A` and warm surface `#111511` replace the blue-black base;
- copper `#E8793E` is the main brand and interaction accent;
- gold `#F2B84B` bridges gradients without turning them into a rainbow;
- mineral teal `#42C7A5` marks live signals, activation and the cool end of gradients;
- warm ivory replaces clinical white, with coral and leaf green reserved for state feedback.

This is a real system-level change, not a filter over the page. `lib/tokens.ts` drives Tailwind,
CSS variables, the canvas neural field, the animated hero/section-title gradients, cursor, cards,
glows and the generated Open Graph image. The neural field now rests in copper/gold and activates
in teal, so the largest visual surface no longer carries hidden purple remnants.

Semantic `accent-copper` / `gold` / `teal` / `coral` / `green` tokens were added. The old
violet/indigo/cyan token identifiers remain as compatibility aliases to those new values for now;
that preserves the existing dirty component tree and produces no duplicate visual palette. New
code should use the semantic names. `docs/DESIGN_SYSTEM.md` records both the new direction and
this temporary compatibility rule.

**Accessibility and verification:** primary text measures 17.48:1 on the page background;
secondary text 7.94:1; the small-text copper tint 9.86:1; the base copper 6.80:1; and teal 9.35:1.
All also clear AA on the raised surface. A production Chrome render confirmed the new palette in
the hero, portrait composition, navigation, neural field and CTAs. Optimized build and
`tsc --noEmit` pass; lint has 0 errors and the same pre-existing `spokenLanguages` warning.
Temporary screenshots were removed after inspection.

### Session 4 (cont. 2) — 2026-09-06 — Moving gradients on the hero name and section titles

Abdul asked for visible gradient motion in his name and the section titles. The hero now applies
one slow white → violet → cyan colour wave across the complete `Abdul Qadir` lockup instead of a
short highlight on only the surname. The signature rail and terminal-node entrance remain intact.

Every `SectionHeading` accent phrase now receives a more pronounced violet → cyan → white moving
gradient, scoped through the shared component so all six sections stay consistent. The stable
white lead-in preserves headline readability while the important trailing phrase carries motion.

This remains CSS-only: no new client component, dependency, event listener or animation library
work was added. The animated area is restricted to the glyphs, uses a slow 5.2–5.8 second cycle,
and becomes a static gradient under `prefers-reduced-motion`.

**Verified:** optimized production build and `tsc --noEmit` pass; lint has 0 errors and only the
pre-existing `spokenLanguages` warning. The production stylesheet contains the shared
`display-gradient-flow` keyframes and both scoped component rules; `git diff --check` passes.

### Session 4 (cont.) — 2026-09-06 — Navbar decluttered; hero signature and section-title system

Abdul said the navbar still felt crowded and asked for a cooler animated name plus stronger
section titles, while preserving the optimization work. This pass simplifies the hierarchy
instead of compressing the same number of elements into smaller type.

**Navbar.** The redundant role tagline and all `01`–`06` indices are gone from the always-visible
desktop row. The six plain section labels retain the active pill/underline, and a quiet divider
now separates navigation from the résumé action. The full row starts at `xl` (1280px); narrower
laptops and tablets use the existing two-column disclosure. The numbered navigation remains
inside that disclosure, where the extra wayfinding helps rather than competes. At the 1138px
width from Abdul's screenshot the resting header is now only the wordmark and menu button; the
opened menu uses the whole bounded shell and gives every destination room.

**Hero name.** `Abdul Qadir` is now a signature lockup: the real, server-rendered heading stays
visible throughout, while a violet-to-cyan signal rail draws once beneath it, resolves into a
lit terminal node, and a short highlight crosses the gradient surname. The effects are CSS-only,
finite, and do not wait for hydration. Under `prefers-reduced-motion`, the complete rail and node
render immediately with **zero animation objects**.

**Shared section titles.** `SectionHeading` now has a fine cyan/violet vertical rail, corner tick,
live eyebrow row and fading signal line. The treatment is implemented once in the shared Server
Component, so About, Skills, Services, Experience, Projects and Contact all receive the same
hierarchy without client JavaScript, new dependencies or duplicated styles.

**Production verification (`next start`, real Chrome):**

| check | result |
|---|---|
| responsive widths | 390 / 1138 / 1440, **0 horizontal overflow** at all three |
| crowded-width behavior | 1138: desktop row hidden, menu control visible; opened panel 1096x225 |
| wide navigation | 1440: 6 section links, no indices, no role tagline |
| hero signature | heading visible; rail reaches final `scaleX(1)` state |
| section-title primitive | rail and signal gradients computed at mobile and desktop widths |
| reduced motion | media query true; name subtree has 0 animation objects; heading opacity 1 |
| quality gates | optimized build and `tsc --noEmit` pass; lint 0 errors, one pre-existing `spokenLanguages` warning |

Temporary browser probes/screenshots were removed, and `scripts/cdp.mjs` was restored to its
exact repository hash after the sandbox-only test adjustment.

**Next up:** unchanged — deploy to Vercel, add `RESEND_API_KEY` there, set/confirm the real
production domain, and run the final Lighthouse check against that URL.

### Session 4 — 2026-09-06 — Navbar and footer redesign, with a smaller runtime footprint

Abdul asked to improve the navbar and footer while keeping the site optimized. Both now read as
parts of the same AI-system interface rather than a utility bar at the top and three plain text
columns at the bottom. No dependency was added, no content was invented, and the existing dirty
working tree was preserved.

**Navbar — a bounded instrument panel.** The hero state remains visually transparent with the
existing masked readability veil. After 24px of scroll, the navigation now resolves into a
floating, rounded glass shell rather than putting `backdrop-filter` across the full viewport
width. That is both the visual improvement and the optimization: the browser blurs only the
`max-w-6xl` panel. The shell has a token-derived directional tint, a restrained inset highlight,
and neutral elevation; it compacts from 78px total header height to 70px.

Navigation items now carry generated `01`–`06` indices, a quiet pill-shaped active surface, and
the existing Framer Motion underline. The supplied wordmark remains in `next/image`; at `xl` it
gains the real `identity.roles[0]` beside a small live-status node. No new text literal can drift
from content. The full desktop controls now start at `lg`, not `md`: six destinations plus the
résumé CTA were too dense for a 768px tablet. At 768px the compact disclosure is used instead.

The mobile menu is now a two-column system grid with the same indices and active treatment,
followed by the full-width résumé action. At 390px it measures **364x213px**, stays inside the
viewport, and opens/closes from the existing native button. Escape behavior and scroll-spy logic
are unchanged.

**Footer — a server-rendered closing console.** The footer is still a Server Component and adds
no hydration. It is now one structured panel with:

- a strong identity column sourced entirely from `identity`;
- the two visible direct-contact values sourced from `directContacts`;
- all six section destinations as indexed navigation cells;
- GitHub, LinkedIn and Instagram rows using the existing inline brand marks;
- a clearer back-to-top control and a restrained `AQ` watermark.

The panel intentionally has **no `backdrop-filter`**. Its legibility over the neural field comes
from token-derived static gradients, so the footer does not add another large blur region. The
top signal bus also no longer runs forever: its base line is static and the travelling packet is
authored `paused` at time 0, starting only while the footer is hovered or has keyboard focus.
Under reduced motion that animation is absent entirely.

**Production verification (`next start`, real Chrome):**

| check | result |
|---|---|
| responsive widths | 390 / 768 / 1424, **0 horizontal overflow** at all three |
| tablet breakpoint | 768: desktop controls `display:none`, mobile control `display:flex` |
| scrolled nav | glass class present; `blur(18px) saturate(1.35)` on the bounded shell; 9999px radius |
| mobile disclosure | real Tab to menu button + activation; `aria-expanded=true`; panel 364x213 |
| footer destinations | 6 section links / 3 social links / 2 direct contacts |
| footer keyboard surface | 12 native focusable anchors, all covered by the global focus-visible treatment |
| footer idle animation | `bus-signal` present but **paused at currentTime 0** |
| reduced motion | media query confirmed true; `bus-signal` has no animation object |
| visual render | desktop footer 709px tall; mobile footer reflows to one clean column |
| quality gates | `npm run build` pass; `tsc --noEmit` pass; lint 0 errors, one pre-existing `spokenLanguages` warning |

The first production build attempt could not reach Google Fonts from the filesystem sandbox;
rerunning with the required network permission passed all 12 generated pages. Temporary browser
probes/screenshots were removed after verification and the shared CDP helper was restored
byte-for-byte.

**Next up:** unchanged — deploy to Vercel, add `RESEND_API_KEY` there, set/confirm the real
production domain, and run the final Lighthouse check against that URL.

### Session 3 (cont.) — 2026-08-29 — Phase 13 / 14 re-run. **Performance now passes: 95-98.**

Re-ran both phases after this session's content work. **Phase 13 passes. Phase 14 passes on every
criterion that can be checked locally**, including Performance, which failed the last audit.

**⚠ One real bug found — the OG card had gone stale, silently.**
`app/opengraph-image.tsx` carried the strapline as a **hardcoded string**: *"Building scalable,
high-performance web applications powered by AI."* When the tagline was broadened earlier today,
the social card kept advertising the exact positioning the change was meant to retire — and
nothing caught it, because a literal cannot drift *detectably*. This is what `CLAUDE.md` §3's
"never hardcode copy in a component" rule is for. It now derives from `identity.tagline` (first
sentence only — the tagline closes on a CTA that does not belong on a preview card).

**Phase 13 — PASSES.**

| criterion | result |
|---|---|
| Distinct title + description per route | 6/6 distinct (4 project pages, `/`, 404) |
| `sitemap.xml` | 5 URLs incl. the new `calorie-counter-ai`; `/api/contact` correctly absent |
| `robots.txt`, OG image, favicon | present — OG 1200x630 PNG, icon 2.4 KiB |
| Canonical + `og:` tags | present on `/` |
| **Lighthouse SEO** | **100** (bar: 95) |

*Unchanged blocker:* `siteUrl` is still `abdulqadir.dev`; sitemap, canonicals and OG URLs all
derive from it. **Set it before deploying.**

**Phase 14 — PASSES except the deploy.**

| criterion | result |
|---|---|
| SSR completeness | all 7 sections + all content in the server HTML with JS off |
| Keyboard pass | **59 focus stops, all `:focus-visible`, all with a focus ring, all scrolled into view** |
| Reduced motion | **0 running animations at every scroll position**; 0 of 4 service cards, 4 project cards, 12 timeline entries, 40 skill items, 37 headings left invisible |
| Easter egg | `sudo hire-me` reveals both lines, announced via live region; **0 occurrences in the shipped HTML**, referenced nowhere outside `EasterEgg.tsx` |
| Accessibility / Best Practices / SEO | **100 / 100 / 100** |
| **Performance** | **95, 97, 98** on a quiet machine — **passes the >=90 bar** |
| Deploy | still blocked on Abdul's Vercel account |

**How Performance was settled, because the first numbers said the opposite.** The first three runs
gave **58 / 68 / 70** — worse than the 87-88 that already failed the last audit. That was the
machine, not the code, and it was proved rather than assumed:

- The first runs happened at **65% CPU with 44 Chrome and 21 node processes and two other dev
  servers up**. Later runs at **12% CPU** gave **98 / 97 / 95** on byte-identical code. TBT moved
  **472ms -> 44ms** across that same code. That 8x swing is the whole story.
- **Interleaved A/B against `HEAD` (60b6bf9, pre-session)** in one sitting, five pairs:

  | pair | baseline | current |
  |---|---|---|
  | 1 | 56 | 67 |
  | 2 | 66 | 69 |
  | 3 | 64 | **97** |
  | 4 | 89 | 96 |
  | 5 | 74 | 83 |

  **Current wins all five.** The load-insensitive metric is the clearest: **LCP baseline
  ~2.1s vs current ~1.0-1.3s**, and **total payload 2002 KiB -> 516 KiB**. That 4x is this
  session's mask-stencil fix landing — `HEAD` still ships the 1 MB PNG as a CSS mask.

**Method note for the next person.** Building a worktree at `HEAD` to A/B against needs a real
`npm ci` in it: Turbopack rejects a junctioned `node_modules` outright ("Symlink [project]/
node_modules is invalid, it points out of the filesystem root"), on the same drive as well as
across drives. And remove such a junction with `cmd //c rmdir`, never `rm -rf` — the latter
recurses into the *target* and would delete the real `node_modules`.

**Two probe mistakes worth not repeating**, both of which produced alarming false failures:
`element.focus()` does **not** match `:focus-visible` (48 of 58 elements looked ring-less; real
Tab keypresses showed 0), and counting *off-screen* elements at `opacity: 0` flags every
`whileInView` that has correctly not fired yet (70 false positives).

### Session 3 (cont.) — 2026-08-29 — Services rebuilt around Abdul's four offers

Abdul restated what he sells: **AI-powered web apps, mobile apps, AI agents, AI automations, AI
SaaS, ERP and CRM** — and gave four cards with their stacks.

**The four cards now are** web apps / cross-platform mobile apps / AI agents & automations /
AI SaaS, ERP & CRM. That retires the old fourth card, "AI/ML Powered Apps": *integrating trained
models for predictive analytics* is a technique, not something a client buys, and it overlapped
the other three rather than standing beside them. The replacement is the business-platform work
that is already in `experience` (the ICPS ERP, the Pyora CRM), so it is an offer he can evidence.

**AI became the through-line rather than one card's subject.** Every card names a model layer,
because that is the positioning: not "web development, and separately some AI".

**New: a `stack` field on `Service`, rendered as `Badge`s at the foot of each card** — the same
component project cards use, so a technology looks identical wherever it appears. Two decisions
worth keeping:

- **Slash notation, not one badge per technology.** `Django / Flask / FastAPI` as a single badge.
  Spelling all nine out turned the 1-column bento cells into a wall of chips that buried the
  description above them.
- **The row is pinned to the card foot with `mt-auto` inside a wrapper.** The bento gives cards
  different heights; without it each stack row floats wherever its own copy ends and the grid
  reads ragged. Measured after: stack rows land at an identical offset within each row pair
  (453/453 and 419/419 at 1424px).

**Two layout bugs found and fixed by looking at it, not by reasoning about it:**

1. **The icon tile stretched to the full card width.** Making the card `flex flex-col` (needed
   for `mt-auto`) turned that `inline-flex` span into a flex item, and a flex item defaults to
   `align-self: stretch` — a 50px tile silently became a 717px bar. `self-start` fixes it. Worth
   remembering: *any* `inline-flex`/`inline-block` child of a card becomes stretch-aligned the
   moment that card is made a flex column.
2. **`Android & iOS` was a badge in the mobile card's stack.** It is a platform, not a
   technology, and the bullet above already said it. It also cost layout: as a narrow cell that
   card wrapped to three badge rows, making it the tallest in its row and leaving a hollow band
   in the wide card beside it.

**Also updated, because the brief's opening line is a positioning statement:** `identity.tagline`
and the first sentence of `identity.bio` both said "web applications" only, which undersold four
fifths of the work. Both now name the full range. Verified the longer tagline does not push the
hero CTAs below the fold — 3 lines at 1424px (CTA bottom 589 of 805), 4 lines at 390px (563 of
844).

Verified: no horizontal overflow at 390 / 768 / 1424; all four cards keyboard-focusable and
`aria-labelledby` their own titles; stack rows are real `<ul>`/`<li>`; reduced motion settles to
**0 running animations** (40 with motion on). `build`, `lint`, `tsc --noEmit` clean apart from
the pre-existing `spokenLanguages` warning.

**Icon set changed:** `code-2` / `rocket` / `share-2` retired (nothing else referenced them),
`globe` / `workflow` / `layout-dashboard` added. `Workflow` rather than `Bot` for the agents
card — a node graph matches the site's own neural-field language, where a cartoon robot face
would have cheapened it.

### Session 3 (cont.) — 2026-08-29 — New robotic portrait wired into the hero reveal

Abdul replaced the hero's AI-portrait source: `public/robotic_portrait.jpeg` is gone, and
`public/portrait-robotic.jpg` (832x1248) takes its place. He also deleted both derived files, so
the hero was requesting a **404** for `/robotic-portrait-cutout.png` until this was done.

**The pipeline did the work; only the source path changed.** `scripts/cutout.py` now reads
`public/portrait-robotic.jpg`, and re-running it regenerated `robotic-portrait-cutout.png` and
`portrait-reveal-mask.png`. Subject coverage came back at **59.2%** — byte-identical to the
previous run, as it must be: the matte is keyed from `portrait2.jpeg`, which did not change.

**Registration was checked before regenerating, because the whole effect depends on it.** The
robotic layer is keyed with the *photo's* matte and layered at identical geometry, so a source
whose pose has drifted would slide the robot's features against the photograph's. A 50/50 blend
of the two crops showed hair, jaw, collar, lapels and tie all landing within a couple of pixels.
The script raises if the dimensions differ, but nothing can catch a drifted pose automatically —
**blend the two crops by eye before accepting any future replacement.**

Where the new figure *does* differ is the body: its shoulders are much broader and its arms are
posed up with the hands crossed at the chest. Neither matters. `HERO_CROP`'s bottom edge (925 of
1248) sits above the hands, and the shared matte clips the broad shoulders to the human
silhouette — the containment the script's docstring already argues for, now doing real work.

Verified on a production build at 1424x805:

| check | result |
|---|---|
| Both layers load, same natural size | 740x791 each ✓ |
| Reveal driven onto the face | Chrome plating, lit eyes and circuitry land exactly on the photo's features |
| Reveal driven onto the shoulder edge | No backdrop leak; the silhouette dissolves into the page as the photo does |
| Reduced motion | Reveal not mounted, and `robotic-portrait-cutout` **never requested** |
| Optimised payload | 66 KiB WebP (raw PNG is 1.0 MB; it never ships) |
| `build` / `lint` / `tsc --noEmit` | Clean — only the pre-existing `spokenLanguages` warning |

### Session 3 (cont.) — 2026-08-29 — Ecosystem, second pass: spheres, a well, a bezel, a tighter box

A further design pass on the ecosystem, again with no new JavaScript.

| change | why |
|---|---|
| **`.skill-node-sheen`** on every node | The discs were flat coloured circles. A radial highlight lit from the upper left plus an inset floor shadow makes them read as **spheres**. Same three-layer construction the contact orbs use — fill, highlight, content — so the reflection sits above the body and below the number. |
| **`.ecosystem-hub`** | The hub was `glass-surface`: a flat 4% film, which made the axis the least substantial thing in its own composition. It is now a **well** — radial gradient, inner top light, floor shadow — so the orbit reads as anchored into something. |
| **Tick bezel** | The outer band was dead space. A graduated tick ring turns it into instrumentation. **One `<circle>`, not 48 tick elements**: a wide stroke with a mostly-gap dash pattern renders as evenly spaced ticks for the cost of a single path. That was the whole point — denser composition, same cost. |
| **Tighter box** | `ORBIT_RADIUS` 0.4 → 0.43 and the container `max-w-2xl` → `max-w-xl`. Nothing got smaller: nodes and hub are sized in `rem`, so only the empty space moved. |

**⚠ The tighter box exposed a real bug on mobile, and it predates this pass.**

**A node is wider than its circle** — the label underneath is what defines its footprint. On a
phone the stage is roughly the viewport width, so the outermost labels ran past both edges and
were **silently clipped by the section's `overflow-hidden`**: measured `left: -5`, `right: 395`
in a 390px viewport. Nothing errored and `documentOverflows` was `false`, because the clip hid it.

Fixed with `orbitRadiusFor(width)` — 0.33 under a 420px container, 0.43 above — plus a narrower
label (`w-24 sm:w-36`). Driven off the **measured container width, not a CSS breakpoint**, because
the SVG geometry is computed in JS and has to agree with the width the element actually got. On
desktop the same spill is harmless and left alone: the stage is `max-w-xl` inside a much wider
container, so labels simply extend into the space around it.

Verified: nodes fully inside the viewport at 390 (253–349), 768 and 1440.

**Cost: none measurable.** Interleaved A/B toggling all 12 added elements — gauges, tracks,
sheens, bezel — gave **identical frame counts (13 vs 13)** and a 5.6 ms median-gap difference,
which is noise. Everything added is static paint; nothing animates that did not already.

**Read the load before believing any absolute number here:** that measurement ran at **93% CPU
with 52 Chrome processes** (Abdul's own browsing). The A/B is still valid because both arms ran
under the same load — which is exactly why this file now insists on A/B over single readings.

**Accessibility held:** the number stays inside the `aria-hidden` subtree, so the four buttons'
accessible names are still the clean skill labels; all focusable; reduced motion settles to **0
running animations and 0 transitions**. `build`, `lint`, `tsc --noEmit` clean.

### Session 3 (cont.) — 2026-08-27 — Ecosystem redesigned into instrumentation

Abdul asked to improve the ecosystem's design without giving up the performance work.

**What was wrong.** Proficiency was encoded *only* as node diameter and halo strength, and the
actual figure lived in a hover panel. So at rest the section was four softly-glowing purple discs
carrying no readable information — decorative rather than instrumented — around a hub that was a
plain glass circle with small text in it.

**What it is now:**

| element | change |
|---|---|
| **Node** | a **gauge arc** reading the real proficiency, with the **number inside the disc** at rest |
| **Hub** | two concentric rings (one solid, one dashed) plus the site's `status-node` pulse, so the axis reads as a core rather than a text bubble |
| **Orbit** | ring opacity 0.28 → 0.5, plus a second tighter ring for depth |

The gauge reuses the **exact masking technique `.circuit-trace` already uses** — paint a conic
gradient over the border box, punch out the content box — with `--pct` set inline per node. It is
a static paint: no `@property` registration, no JS, no per-frame work. A `.skill-ring-track`
behind it gives the arc something to read against.

**Accessibility held.** The number sits inside the existing `aria-hidden` subtree, so the four
buttons' accessible names are still just `React.js`, `Python, Django & FastAPI`, `HTML, CSS & JS`,
`Agentic AI` — not "95 React.js". The `aria-live` panel still announces the figure on focus.
Lighthouse Accessibility **100, zero failures**, on every run.

---

**⚠ A performance scare that turned out to be the machine, and how it was settled.**

After the redesign Lighthouse read **72–80** where it had read 93–96 an hour earlier. Three
consecutive runs in the 70s is a pattern, not noise, and a masked conic-gradient inside a
*continuously rotating* element is a genuinely plausible cause — masked layers can be forced to
re-rasterise every frame. Worth taking seriously rather than dismissing.

**Settled by A/B rather than by argument:** a probe build with `display: none` on `.skill-ring`
and `.skill-ring-track` only, everything else identical.

| | Lighthouse perf | TBT |
|---|---|---|
| rings **off** | 80 / 77 / 79 | 290–340 ms |
| rings **on** | 79 / 72 / 73 | 300–390 ms |

Overlapping. **The rings are not the cause.** The frame-gap A/B agreed — identical frame counts
with and without them.

**The real cause was measurement environment.** `Win32_Process` showed **47 Chrome processes and
22 Node processes at 47% CPU**. Two were orphaned headless instances from this session's own
Lighthouse runs and were killed; **the other 39 are Abdul's own browser and were deliberately left
alone.** The 93–96 figures were taken during a quiet moment; the 70s were not.

**The lesson, and it generalises:** absolute Lighthouse scores on this machine are close to
meaningless — this session has now seen 43 to 97 on materially identical code. What *is* valid is
an A/B where both arms are measured under the same load, which is why the probe build settled the
question and repeated single runs never could. Check process count before believing a score.

**Verified:** 4 gauges and 4 tracks render with the right `--pct` values (95 / 90 / 80 / 80); all
four nodes keyboard-focusable with clean accessible names; reduced motion settles to **0 running
animations and 0 transitions**; probe fully reverted (the one remaining `display: "none"` in the
config is the pre-existing `.scan-line` reduced-motion rule); `build`, `lint`, `tsc --noEmit`
clean.

### Session 3 (cont.) — 2026-08-27 — Section spacing halved, CognoRise restored, Calorie Counter card wired

**1. The gaps between sections were 320px, and that is why the page looked empty.**
`py-section` applies the same padding top *and* bottom, so **adjacent sections stack two of
them** — at `clamp(6rem, 12vw, 10rem)` that was 160px + 160px = **320px of dead space between
every section**, more than a third of a 900px viewport showing nothing.

Now `clamp(4rem, 7.5vw, 7rem)`: **216px combined at 1440** (was 320) and **128px on a phone**
(was 192). Page height 11,087 → 10,671. The token carries a note to reason about the *doubled*
figure next time it is touched.

Hero → About stays larger (370px, was 422) and that is correct: the hero is `min-h-screen` with
vertically centred content, so its own empty lower half is part of that measurement, not padding.

**2. CognoRise InfoTech is back.** It was removed when Experience was synced to the CV; Abdul
confirmed the CV omits it for space rather than as a correction to his history. The site is
longer-form than a one-page CV, so it carries it. Original `CONTENT_BRIEF.md` content, unchanged,
placed after OctaNet — both start in 2024 and the timeline's sort is stable, so array order
decides, and OctaNet (April–May) is the later of the two. **The open question from two entries ago
is now closed.**

**3. Calorie Counter AI has its card image** (`/projects/calorie-counter-ai-card.jpeg`, 450x450).
No `IMAGE PENDING` placeholders remain anywhere on the site.

**⚠ Naming discrepancy, unresolved:** the card graphic is titled **"NutriAI"**, while the CV — and
therefore `content/data.ts` — calls the project **"Calorie Counter AI"**. The alt text describes
the artwork truthfully (it says NutriAI, because that is what is in the image), so the two names
currently sit side by side on the card. **Abdul should pick one.** Still outstanding for this
project: a hero image and a date. `liveUrl` stays null by design — he confirmed it is not live.

**Verified:** all six timeline entries render in the right order with the right arrangements; all
four project cards load real images (`natural` sizes non-zero, no placeholders); no horizontal
overflow; `build`, `lint`, `tsc --noEmit` clean.

### Session 3 (cont.) — 2026-08-27 — Runtime jank fixed: the field was fill-rate bound, not CPU bound

Abdul: the site feels slow and laggy. That is a **runtime** complaint, so Lighthouse was the wrong
first place to look — I measured the running page.

**The diagnosis, and it is the opposite of what the code looks like.**

| measurement | before |
|---|---|
| rAF ticks/sec, background field **on** | **20 / 20 / 23** |
| rAF ticks/sec, field **hidden** | **36 / 40 / 48** |
| field's **JavaScript** cost per frame | **0.79 ms** — cheap |
| field canvas backing store | **2160x1350 = 2.9 megapixels**, repainted 60x/sec |

Hiding one canvas roughly doubled the frame rate while its JS cost under a millisecond. **The
bottleneck was rasterisation, not script.** `lib/neural-field.ts` is already well optimised where
it counts — spatial hash for link-finding, alpha-bucketed edge batching, a cached sprite instead
of `ctx.shadowBlur` — so there was no algorithmic fat to cut. The lever is **how many pixels it
fills, and how often**. The engine's own `__neuralDebug` comment says exactly this: it measures
"JavaScript and command-recording time only… the only way to tell 'the simulation is too
expensive' from 'this machine is rasterising in software'."

**Three changes, all invisible — Abdul's explicit constraint was that mesh density stays.**

1. **`maxDpr` 1.5 → 1** on the site-wide field. Backing store **2.9 MP → 1.3 MP: 2.25x fewer
   pixels per frame.** The layer is 1px lines and soft cached sprites on near-black; there is no
   fine detail for the extra ratio to resolve.
2. **`drawHz: 30`** — a new config. `frame()` now always `step()`s but gates `draw()`. The
   simulation keeps full-rate timing; only the repaint is throttled. **The cap lifts while the
   pointer is moving** (`POINTER_FRESH_MS`), so cursor reaction stays at 60fps and only ambient
   drift is throttled — which is precisely the state the page is in while scrolling or reading.
   `pActive` alone was not enough for this: it stays true for a pointer resting motionless, so
   the engine now records `lastPointerAt`.
3. **`maxBackingPixels: 2_600_000`** — a new config, clamping *area*, which `maxDpr` alone does
   not: a 2560-wide monitor at DPR 1 is still 3.7 MP and grows quadratically with window size.
4. `maxPackets` 110 → 60. Each packet is a dot plus a tail stroke.

Both new options default to **off**, so no other call site changed behaviour.

**Measured after (same machine, same session, interleaved A/B):**

| | before | after |
|---|---|---|
| rAF ticks/sec, field on | 20 / 20 / 23 | **28 / 44 / 40** |
| field's JS per frame | 0.79 ms | **0.30 ms** |
| worst frame | 3.73 ms | **1.43 ms** |
| backing store | 2.92 MP | **1.30 MP** |
| scroll frame gap, p95 | 166 ms | **133 ms** |
| Lighthouse desktop (4 runs) | 87 / 88 / 91 / **62** | **96 / 94 / 96 / 93** |
| TBT | 210 ms | **80–160 ms** |
| LCP | 1.2 s | **1.1 s** |

Accessibility, Best Practices and SEO stayed at **100** throughout.

**Verified unchanged:** the field still reacts to the cursor (green-channel rise over lit canvas
pixels **+17.4**, against +19.1 before — statistically the same); reduced motion still settles to
**0 running animations and 0 transitions**; a screenshot at DPR 1 is indistinguishable from the
DPR 1.5 one at the same density and brightness. `build`, `lint`, `tsc --noEmit` clean.

**⚠ Tier 2 was planned and then deliberately NOT done, because the measurement killed it.**
The plan assumed ~1 MB of JavaScript worth deferring. That figure was **uncompressed, across all
routes**. What the homepage actually downloads is **279 KiB compressed across 14 files** — a
reasonable payload for React + GSAP + ScrollTrigger + Lenis + Framer Motion. Deferring below-fold
sections would have shaved a little hydration work off a page now scoring 93–96, while risking
SEO and layout stability on SSR'd content. **Not worth it.** If performance work resumes, the
remaining cost is Script Evaluation (837 ms, mostly the React framework chunk), not payload —
and that is not something deferring section components meaningfully moves.

### Session 3 (cont.) — 2026-08-27 — Skills synced to the CV; Calorie Counter confirmed not live

**Skills now uses the CV's own five categories, plus one for tooling.** The previous grouping
(backend / frontend / data-ai-ml / databases / tools) came from `CONTENT_BRIEF.md`; it both missed
a lot and split technologies differently from how Abdul presents them to employers.

| group | source |
|---|---|
| Languages | CV verbatim — Python, Java, C++, C#, SQL, JavaScript, HTML/CSS |
| Frameworks | CV verbatim — Django, FastAPI, Flask, React, React Native, Next.js |
| Databases | CV verbatim — PostgreSQL, Oracle, MySQL, SQLite |
| Libraries | CV verbatim — Pandas, NumPy, Matplotlib, Scikit-learn, Seaborn, PyTorch, Tkinter |
| Agentic AI | CV verbatim — n8n, Make, OpenAI API, Gemini API, Pinecone |
| Tools & platforms | **the one group the CV does not name**, but every item is still drawn from it — Firebase/Supabase from project stacks, Gradio + Hugging Face from Customer Segmentation, Pyzk from Pyora, Hostinger VPS from ICPS — plus Git, which the site already listed and the CV does not contradict |

**Newly on the site:** Java, C++, C#, SQL, Next.js, MySQL, SQLite, NumPy, Matplotlib, Seaborn,
Make, OpenAI API, Pinecone, Supabase, Hostinger VPS.

**A judgement call worth knowing about:** the modelling techniques — KMeans, PCA, RFM analysis,
Linear Regression, EfficientNet — are **deliberately not repeated** in Skills. They live in the
individual project stacks, which is exactly where the CV puts them, and they already render as
tags on those cards. Listing them twice would pad the section rather than inform it. Easy to add
back as a seventh group if Abdul disagrees, though six is also what the layout wants: `Skills.tsx`
tiles these three-up on `lg`, so six fills two clean rows with no orphan.

**`coreSkills` is untouched** — the four scored skills that drive the ecosystem and the About
capability panel. The CV gives no proficiencies, so there was nothing to sync.

**Calorie Counter AI: `liveUrl` is now settled, not pending.** Abdul confirmed the mobile app is
not live, so there is nothing to link to and the "Live Preview" button stays hidden by design.
**Still pending from him: card image, hero image and a date.** Until they arrive the card shows
the `IMAGE PENDING` placeholder at exactly the real asset's size and the detail page omits the
Date row.

**Still open:** whether **CognoRise InfoTech** was intentionally dropped from the CV or just cut
for space — it is currently removed from the site to match. See the previous entry.

**Verified:** six groups render three-up with the right items in each, no horizontal overflow;
`build`, `lint`, `tsc --noEmit` clean.

### Session 3 (cont.) — 2026-08-27 — Experience and Projects synced to the CV

Abdul supplied `Resume (2).pdf` and asked for Experience and Projects to match it.
**The CV is now the source of truth for those two arrays, not `CONTENT_BRIEF.md`** — it is newer
and it is the document he sends to employers.

**Experience: four entries became three.**

| CV entry | change |
|---|---|
| **ICPS Pvt. Ltd.** — Full-Stack Web Developer, July 2026 – Present, Onsite | **new** — ERP system in React/Django/PostgreSQL |
| **Pyora Solutions** — Full-Stack Web Developer, July 2025 – July 2026, Hybrid | rewritten: one role, three bullets (Pyzk attendance, POS, CRM) |
| **OctaNet Services** — Python Developer Intern, April 2024 – May 2024 | kept, title and bullet updated to the CV's wording |

**⚠ Two entries the site had are now gone, and both are deletions of real history — confirm with
Abdul before treating them as settled:**
1. **CognoRise InfoTech** (Python Development Intern, March–April 2024) — **the CV does not list
   it at all.** Removed to match. If it was simply cut from the CV for space rather than
   dropped from his history, it needs restoring here.
2. **The separate Pyora internship** (June–Sept 2024) — the CV folds it into the single
   July 2025 – July 2026 role and carries the Pyzk attendance work as a bullet of that role.

**Projects: three became four.** `Calorie Counter AI` (React Native, Gemini API, JavaScript,
Supabase) added and listed first, matching the CV's order. Pest Eye's pitch, `type` and stack were
rewritten — the CV describes a **React Native mobile app *and* a ReactJS web app**, and names
PyTorch/EfficientNet, where the site said web-only. Customer Segmentation and Netflix had their
stacks expanded to the CV's full lists.

**`Project.date` is now nullable.** The CV gives no year for Calorie Counter AI, so rather than
invent one the field is `null` and the detail page drops the row entirely — an empty "Date" row
reads as a bug. `MediaFrame` already handles null images, so the card shows a labelled
`IMAGE PENDING` placeholder occupying exactly the space the real asset will.

**[TODO] Calorie Counter AI** — card image supplied 2026-08-27. Still needs a **hero image** and
a **date**, plus a decision on the name: the card art says **"NutriAI"**, the CV says "Calorie
Counter AI". **Not** a live link — he confirmed the mobile app is not live, so the button stays
hidden by design rather than waiting on anything.

**Not touched, and worth a decision:** the CV's Technical Skills are broader than `skillGroups`
in `content/data.ts` — it adds **Java, C#, Next.js, MySQL, SQLite, NumPy, Matplotlib, Seaborn,
Make, OpenAI API and Pinecone**. Abdul asked for Experience and Projects only, so Skills was left
alone. Syncing it is a small, separate change if he wants it.

**Verified:** all three work entries and both education entries render in the timeline in the
right order with the right arrangements; four project cards render, Calorie Counter first;
`/projects/calorie-counter-ai` builds as a static route and its detail page shows **no Date row
and no dead Live/Repo buttons**; `/projects/pest-eye` still shows its date, live link and the new
stack. `build`, `lint`, `tsc --noEmit` clean.

### Session 3 (cont.) — 2026-08-27 — About composition rebuilt: three panels down to one

Abdul: *"you ruined the design of about i designed now its not looking good."* Fair. The system
interface he briefed was the right idea; my execution of it was cluttered.

**What was wrong, measured rather than felt.** The portrait was **255x319** inside a 435px column,
losing to three boxed panels around it — "Active role" (188px wide), "Record" (188px), and the
capability meters — all set in **10-11px mono**. Five competing frames in half a section, type too
small to be comfortable, and "Projects 3 / Credentials 11 / BSCS" reading as a debug readout of
numbers that are weak signal *and* already have whole sections of their own.

**What replaced it: three elements, not five.**

| element | treatment |
|---|---|
| Portrait | **397x497** — the anchor, not a thumbnail |
| Role + location | a **caption line**, not a boxed card — same words, one less frame |
| Core capability | the **one** framed panel, at `text-sm` instead of 11px mono |

The "Record" panel is gone entirely. The visual column also widened —
`about-reversed` from `1.15fr / 0.85fr` to `1.05fr / 0.95fr` — because the cramping was partly the
column, not just the contents.

**The panel's overlap is governed by the stage's bottom padding**, since it is anchored to the
stage's foot. At `pb-24` it hung ~100px below the portrait and read as falling off the bottom;
`pb-16` makes it cross the portrait's lower-left corner instead. Noted in the component, because
it is not obvious from the markup.

**Verified:** Lighthouse **a11y 100 (zero failures) / best-practices 100 / SEO 100 / performance
91**; mobile 390 keeps the stage at 342px with the panel fully inside and no horizontal overflow;
reduced motion settles to **0 running animations, 0 transitions, 0 elements stuck invisible**;
`build`, `lint`, `tsc --noEmit` clean.

**A measurement note worth keeping.** A first reduced-motion count returned **11 running
animations** — all CSS *transitions* (`border-color`, `backdrop-filter`), not keyframes. They were
the navbar's glass transition caught in flight by a scroll walk that sampled too early. With a 2s
settle it is 0. **`getAnimations()` includes transitions; give the page time to settle before
counting, or a passing page will look broken.**

**Performance is still high-variance on this machine:** 91 here, 87/88 earlier, one 62 outlier —
all on identical code. Treat the deployed measurement as the real one.

### Session 3 (cont.) — 2026-08-27 — Phase 13 / 14 re-audit after a session of heavy change

Abdul asked whether Phases 13 and 14 still hold after everything this session touched. They did
not, in three ways — all regressions introduced by my own work, all now fixed and re-measured.

**Phase 13 — PASSES.** `not-found.tsx` with its own metadata; distinct titles everywhere (root
layout supplies `/`'s default plus a `%s` template, project pages use `generateMetadata`, 404 has
its own); OG image, `sitemap.ts`, `robots.ts`, favicon all present; `/api/contact` correctly absent
from the sitemap. **Lighthouse SEO 100**, against a bar of 95.
*Unchanged pre-existing blocker:* `siteUrl` is still the placeholder `abdulqadir.dev`, and the
sitemap, canonical tags and OG URLs all derive from it. **Set it before deploying.**

**⚠ Regression 1 — Accessibility fell 100 → 90.** Two real bugs, both mine, both in code written
this session:

- **`definition-list` + `dlitem`:** the Core capability panel nested `dt`/`dd` two `div` levels
  deep inside its `<dl>`. The spec (and axe) allow `dl > div > dt/dd`, but the terms must be the
  wrapper's *direct* children. Restructured, with the meter as a second `dd` rather than a loose
  `div` for the same reason.
- **`color-contrast`:** `ScrollRevealText`'s dimmed words measured **2.39:1**
  (`text-secondary` at `opacity: 0.45` over `bg-base`). At 20px this needs 4.5:1, not the 3:1
  large-text allowance. Raised the floor to `0.75` (~4.8:1). The reveal still reads because the
  bigger visual change is the colour travelling to `text-primary`, not the opacity — there is a
  comment on it now saying **do not lower this**.

**Accessibility is back to 100 with zero failing audits.**

**⚠ Regression 2 — the "zero arbitrary values / zero raw colour" standard.** Phase 14 recorded it;
`CLAUDE.md` §2 requires it. Measured against `HEAD`: **arbitrary Tailwind classes 0 → 21**, raw
`rgba()` in `tailwind.config.ts` **4 → 14**. Restored by adding named `meta` / `micro` font sizes,
a `grid-cols-system` token, reusing the existing `aspect-portrait`, and folding the repeated glass
literals into `white()` / `shade()` helpers beside `baseAt()`.
**Nine arbitrary values remain and are deliberate** — `w-[42vw]`, `sm:w-[82%]`, `h-[88%]`,
`max-w-[30rem]`, `max-w-[860px]`, `min-[1400px]:`, etc. Those are one-off layout geometry, not
design tokens; naming them would make the code worse, not better.

**⚠ Regression 3 — a 1 MB image was being downloaded to be used as a stencil.**
`.portrait-reveal` clipped the hero reveal with `mask-image: url('/robotic-portrait-cutout.png')`.
A CSS mask samples **only the alpha channel**, so the colour data was never used — but the browser
fetched the full-colour PNG **raw, outside `next/image`**. Lighthouse measured **980 KiB of wasted
payload**, the page's largest single download.

`scripts/cutout.py` now also emits `public/portrait-reveal-mask.png`: same matte, same crop, black
RGB, half resolution (a stencil is scaled by `mask-size: contain` anyway). **1,104,991 bytes →
9,215 bytes — 120x smaller.** Verified the reveal still clips correctly: mask and images both
resolve to `contain` / `100% 100%`, and the reveal element's rect matches the image's exactly.

Measured effect: **LCP 1.8s → 1.2s**, **total transfer ~1.5 MB → 501 KiB**, wasted image bytes
**980 KiB → 21 KiB**.

**Phase 14 — everything passes except Performance, plus the deploy.**

| criterion | result |
|---|---|
| canvas / cursor / loader behind `next/dynamic({ ssr: false })` | unchanged and still true; the components added this session are DOM+CSS and SSR-safe |
| full keyboard pass | **40 focus stops, 0 missing `:focus-visible`, 0 missing a focus ring** |
| full reduced-motion pass | **0 running animations page-wide, 0 elements stuck invisible**, cursor unmounted |
| easter egg | `sudo hire-me` still reveals both lines; `grep` confirms it is referenced nowhere outside `EasterEgg.tsx` |
| Accessibility / Best Practices / SEO | **100 / 100 / 100** |
| Performance | **87–88 desktop median — below the ≥90 bar.** See below. |
| deploy | still blocked on Abdul's Vercel account |

**On the Performance number, read this before acting on it.** It is the one criterion not met
locally. What is left is JS bootup — main-thread 3.3s, two long tasks of 235ms and 179ms, TBT
~210ms — not payload, which is now fixed. Three things to weigh:
1. **Repeat runs on this machine spread enormously.** Three consecutive runs of *identical* code
   gave 88, **62**, 87. This file already records a ±18 point spread from machine load alone.
2. **The measurement was taken while a `next dev` server was also running** on :3000, competing
   for the same CPU.
3. **Phase 14 asks for the score against the deployed URL**, not `next start` on localhost —
   Vercel adds Brotli and a CDN that localhost does not.

So: do not treat 87 as final, and do not chase it with speculative optimisation. **Re-measure on
the deployed site**, and if it is still under 90 there, the next real lever is deferring or
trimming client JS — that is where the time actually goes.

### Session 3 (cont.) — 2026-08-27 — Contact form goes live, and orbs become socials-only

**⚠ A real Resend API key was pasted into `.env.example`, which is a *tracked* file.**

`.gitignore` carries an explicit `!.env.example` negation so the template can be committed — so
the key was one `git add` away from being published to a public repo. It was **not** committed:
`.env.example` was still untracked, so the key never entered git history and was never pushed.

Fixed by moving it to `.env.local` (covered by `.env*`, confirmed with `git check-ignore`) and
restoring the template to a bare `RESEND_API_KEY=`. The pasted value also had a stray space after
the `=`, which was dropped on the way across.

**The rule this is a reminder of:** `.env.example` is documentation and is committed. Real
credentials go in `.env.local` and nowhere else in the repo.

**The form now actually sends.** With the key in place, a POST to `/api/contact` returned
`{"ok":true}` and Resend accepted the message — the first genuine end-to-end delivery. Everything
in the route had been verified except this last hop. **The remaining step is Vercel:** the same
variable has to be set in the project's environment variables at deploy time, or the deployed form
falls back to the 503 path.

---

**Orbs are now socials-only; email and phone are printed in full.** Abdul: *"show github linkedin
instagram in orb node but show email and number so user can see"*.

The reasoning is sound and worth recording, because it is the opposite of what the previous brief
asked for: **an orb hides what it points at behind an icon.** That is right for a profile you
click through to, and wrong for an address or a number — those are things a visitor needs to read,
copy, or dial, and burying the two most direct ways of reaching Abdul under a glyph made them the
two hardest to use.

So: `contactNodes` is now built straight from `identity.socials` (GitHub, LinkedIn, Instagram) and
a new `directContacts` filters `contact.methods` down to email and phone, which render as their
real values on `mailto:` / `tel:` anchors. Both still derive from `identity` — no address or
number is written twice anywhere.

`InstagramMark` joins `BrandMarks.tsx` for the same reason the other two are there: lucide v1
ships no brand glyphs and `CLAUDE.md` §2 makes lucide the only icon dependency.

The two direct lines continue the orbs' stagger rather than starting a second one — they are
simply the fourth and fifth nodes to settle.

**Verified (production build, real headless Chrome):**

| check | result |
|---|---|
| end-to-end send | `POST /api/contact` → **`{"ok":true}`**, accepted by Resend with the live key |
| key safety | `.env.local` confirmed ignored by `git check-ignore`; `.env.example` back to a placeholder; key absent from git history (never committed) |
| orbs | 3 — GitHub, LinkedIn, Instagram — real hrefs from `identity.socials`, all `target="_blank"` |
| direct contacts | email and phone rendered as **visible values** (`abdulqadir12511@gmail.com`, `+92 324 542 24298`) on working `mailto:` / `tel:` anchors, each with an `sr-only` label so a screen reader hears "Email: …" rather than a bare string |
| reduced motion | all orbs at opacity 1, `transform: none`, **0 running animations page-wide** |
| mobile 390 | orbs on **one row**, direct lines stacked on two, everything inside the viewport, no horizontal overflow |
| `build`, `lint`, `tsc --noEmit` | clean (still only the pre-existing `spokenLanguages` warning) |

**Follow-up the same session — the email/phone row became a liquid-glass bar.** Abdul: *"make
email and phone number bar liquid blur"*. `.liquid-bar` is a heavier, wetter glass than
`.glass-surface`: `blur(22px) saturate(140%)`, a diagonal gradient so the surface has a
direction, and a one-pixel inner highlight along the top edge — the meniscus is what stops it
reading as a flat tint. It is a pill on `sm` and up with a hairline between the two values, and
becomes a `rounded-3xl` stacked panel below that, where a pill would force the phone number to
wrap. Measured: 496x54 as a row at 1440, 282x99 stacked at 390, inside the viewport at both.

**Only the standard `backdrop-filter` is declared** — no hand-written `-webkit-` twin. Writing
both lets the production minifier dedupe them down to the prefixed property alone, which Chrome
honours and Firefox does not; that bug flattened every glass surface on the site once already.

### Session 3 (cont.) — 2026-08-27 — Contact: terminal shrinks to the form, links become orbs

Abdul asked to keep the form inside a compact terminal window and replace the large terminal that
listed GitHub / LinkedIn / email / phone with four floating orbs.

**What the section was.** One large terminal holding a `$ connect --with` prompt, three full-width
rows for email/phone/LinkedIn, a résumé row, and *then* the form. The secondary path (the links)
was the loudest thing in the section, and the shell chrome had stopped being a frame and become
the design.

**What it is now.** The terminal wraps the form and nothing else — capped at `max-w-2xl` and
centred, chrome reduced to three dots and a title, no prompt line and no fake command. Below it,
four glass orbs; below those, the résumé as a quiet text link.

**The fourth link had to be found, not invented.** `contact.methods` only holds email, phone and
LinkedIn — **GitHub lives in `identity.socials`**. So `contactNodes` in `content/data.ts` is
*derived*: GitHub from the social, the other three looked up from `contact.methods` by id, in the
order the section presents them. Each entry is skipped rather than faked if its source disappears,
so a removed method means one fewer orb, never a dead link. Verified live: the four hrefs are
`github.com/Abd-ul-Qadir`, the real LinkedIn profile, `mailto:abdulqadir12511@gmail.com` and
`tel:+9232454224298`, with the two profiles opening in a new tab and `mailto:`/`tel:` staying in
place.

**Brand marks: `components/ui/BrandMarks.tsx`.** `lucide-react` v1 ships no GitHub or LinkedIn
glyph, and `CLAUDE.md` §2 makes lucide the sole icon dependency. The decision log had already
settled what to do when these were genuinely needed — inline SVG, not a second icon package — so
that is what this is.

**The orbs are three layers on purpose.** The anchor owns size, perspective and tilt; the
*surface* is the sphere (a gradient lit from the top-left plus an inner highlight, so it reads
convex rather than as a flat disc); the *sheen* is the reflection, which only appears on hover.
Splitting them lets the reflection sit above the glass and below the glyph, which is the order
real glass has. The tilt is written per-orb from that orb's own `pointermove` — no global
listener, no rAF loop, no React state, and clearing the properties on leave lets the CSS
transition ease it home.

**One tidy-up the change exposed:** `ContactForm`'s root still carried
`mt-8 border-t border-border-subtle pt-8`, which existed to separate it from the list of links
above it. With the list gone that left a stray divider and a band of empty space at the top of the
terminal. Removed from both the form and its success panel.

**⚠ CORRECTION, again, to the hover-testing note.** The entry below says the earlier "hover does
not register" finding was caused by `--viewport`'s touch emulation. That is *half* right —
`--viewport` does disable pointer effects, and dropping it does restore `(hover: hover)`,
`(pointer: fine)` and the custom cursor. But CSS **`:hover` still does not apply** from
`Input.dispatchMouseEvent` even in desktop mode: an orb parked under a `--mouse` sweep reported
`matches(":hover") === false` with its sheen still at 0.

**So the standing rule is:** JS pointer *listeners* can be driven synthetically (that is how the
About interaction and the hero reveal were verified), but CSS `:hover` cannot be simulated here at
all. Verify hover-styled declarations through the **`:focus-visible` / `:focus-within` path**,
which for these orbs is the same declaration list.

**A second false alarm, recorded because the fix would have been wrong.** The tilt appeared not to
reset on leave. It does — React derives `onPointerLeave` from `pointerout`, so a bare dispatched
`pointerleave` is an event React never observes. Dispatching `pointerout` with an outside
`relatedTarget`, which is what a real pointer produces, clears it correctly. **Do not "fix"
`onPointerLeave` handlers based on a dispatched `pointerleave`.**

**Verified (production build, real headless Chrome):**

| check | result |
|---|---|
| orb targets | 4 orbs, real hrefs, profiles `_blank`, `mailto:`/`tel:` in place |
| accessible names | "GitHub — View work", "LinkedIn — Connect", "Email — Send a message", "Phone — Call or text" (one name per link; the visible label and hint are `aria-hidden` duplicates) |
| entrance stagger | mid-flight opacities **0.99 / 0.93 / 0.73 / 0.12** — one by one, in the briefed order |
| focus state | lift `translateZ ≈ 13.1px`, sheen opacity ~1, border → `border-hover`, hint fades in — and **all three other orbs stay at 0** |
| tilt | `--tilt-x/y` written on pointer move, **cleared on a real leave** |
| reduced motion | all four orbs at opacity 1, orb `transform: none`, **0 running animations page-wide** |
| mobile 390 | **2×2**, 72px orbs, all inside the viewport, no horizontal overflow, form 292px wide |
| form intact | labels, `aria-invalid`, `aria-describedby`, focus-to-first-error, live region, error clearing, sending state, success panel, POST to `/api/contact` with honeypot — all unchanged |
| API route | still answers (503 without `RESEND_API_KEY`, as designed) |
| `build`, `lint`, `tsc --noEmit` | clean (still only the pre-existing `spokenLanguages` warning) |

**Scroll choreography untouched.** `SectionTransitions` scrubs the Projects → Contact darkening off
`#contact`, and the field's story reads `data-section-inner`; both attributes are exactly where
they were. Nothing in this change goes near the pinned/reel system.

### Session 3 (cont.) — 2026-08-27 — About becomes an AI system interface (and the neural portrait is deleted)

Abdul's follow-up brief **rules out the neural portrait built earlier the same session**: no
network, no constellation, no particle field in About, because the hero owns the human/robot
interaction and the background owns the neural field. What he wants instead is an *instrument
panel* — "viewing the engineer as an intelligent system".

**So `lib/neural-portrait.ts`, `components/effects/NeuralPortrait.tsx` and
`NeuralPortraitMount.tsx` were deleted, not left lying around.** They were about two hours old.
Keeping unused engine code because it was expensive to write is how a codebase rots; the reasoning
that produced it is preserved in the entry below, which is the part worth keeping.
`PortraitParallax.tsx` also went — the composition owns its own pointer handling now.

**What replaced it: `components/effects/SystemInterface.tsx`.** The portrait anchors a
two-column micro-layout of three glass modules, every value derived from `content/data.ts`:

| module | source | shown |
|---|---|---|
| Active role | `identity.roles[0]`, `identity.location` | Full Stack AI Engineer · Pakistan |
| Record | `projects.length`, `certifications.length + awards.length`, `education[0]` | 3 · 11 · BSCS 2021–2025 |
| Core capability | `coreSkills.slice(0, 3)` | React.js 95, Python/Django/FastAPI 90, HTML/CSS/JS 80 |

Nothing is typed in by hand and nothing is invented — change the content and the panel changes.

**The depth technique, which is the whole reason this costs nothing.** The stage owns
`perspective`; the layer inside owns `preserve-3d` plus a single rotation driven by two custom
properties; each module carries a *static* `translateZ`. Because the children sit at different
depths inside one rotating 3D space, **one animated transform produces differential parallax
across all of them** — no per-module maths, no rAF loop, no React state. The pointer handler
writes two strings to one element, rAF-throttled. Measured: layers at z 0 / 74 / 116 shift
1.1 / 4.3 / 6.1 px at half deflection.

**⚠ A bug I wrote and caught before it shipped, worth knowing about generally: Framer Motion
overwrites `transform` on the element it animates.** The first version put `translateZ` in the
`style` of the same `motion.div` that animated `opacity/y/scale`. It *looks* correct — until the
entrance finishes and FM's own transform replaces it, silently flattening the composition to 2D
with no error anywhere. The fix is the `DepthLayer` wrapper: depth on the outer element, entrance
on the motion element inside. **Never put a static transform on a Framer Motion element that
animates transform properties.**

**Two design corrections I only caught by rendering and looking:**

1. **The first arrangement buried his face.** Three panels floated over the portrait; ACTIVE ROLE
   sat across his cheek and RECORD across his chin. The portrait is supposed to be the thing the
   system is reading, so the modules moved into their own column and only the capability panel
   crosses the portrait — across the *torso*, never the face.
2. **CORE CAPABILITY was clipping the BSCS row.** Fixed from measurements, not by eye: the panel's
   top landed at 252 against a column ending at 268. Removing the bordered wrapper on the BSCS row
   and taking the stage's foot from `pb-16` to `pb-24` puts it at 282 against 259 — 23px clear,
   still crossing ~39px of torso.

**Layout: the copy column now comes first in the DOM** (`lg:grid-cols-about-reversed` + `order`),
so reading order and the stacked mobile order are heading → text → visual, which is the hierarchy
the brief asks for. The bio, the Focus/Backend/Frontend list and both badges are **byte-identical**
— only their column moved.

**Verified (production build, real headless Chrome):**

| check | result |
|---|---|
| entrance stagger | at 630 ms the three modules read **0.8 / 0.32 / 0** — arriving one by one, settled by ~900 ms |
| differential parallax | z 0 / 74 / 116 → **1.12 / 4.25 / 6.10 px** shift, `--sx`/`--sy` written on pointer move |
| idle cost | all three sheens `opacity: 0`, `animation-play-state: paused` — a resting composition animates nothing but the drift |
| float drift | `module-float` running on all three with **distinct delays** (-2.4s / -1.2s / -4.8s), not merely declared |
| keyframes emitted | `module-float` and `module-sheen` present **exactly once** each in the built CSS (see the 2026-08-26 entry — this project silently dropped keyframes before) |
| reduced motion | modules at full opacity, bars at their real 95/90/80% with no animation, **pointer vars never written**, **0 running animations page-wide** |
| mobile 390 | clean single-column stack — portrait 0–428, then 459–546, 564–685, 718–862. No overlap, nothing covering text |
| no collisions | Record ends 259, capability starts 282 |
| `build`, `lint`, `tsc --noEmit` | clean (still only the pre-existing `spokenLanguages` warning) |

**Not verified:** a real frame-rate number, for the reason in the entry below — rAF is throttled
in this headless window. The composition has no animation loop at all (one CSS drift per module,
one transform written on pointer move), so the structural risk is very low, but it is not a
measurement.

### Session 3 (cont.) — 2026-08-27 — About: the AI Neural Portrait, and a correction to the hover caveat

Abdul asked for a new visual for the **existing** About section: an "AI Neural Portrait" — his
photo at the centre of a procedurally generated neural network that assembles around it — with
his copy untouched, and explicitly *not* another constellation.

**Stack decision, taken deliberately.** The brief said "use React Three Fiber / Three.js if
appropriate" *and* "do not create unnecessary additional Three.js canvases; reuse existing
Three.js/R3F infrastructure". This project ships **no Three.js at all**, and `CLAUDE.md` §2 makes
native `<canvas>` the default with WebGL a scoped upgrade rather than a reach. So "reuse the
existing infrastructure" resolves to the `NeuralField` engine/shell/mount pattern, and that is
what this follows. Depth is real in the model — every node carries a `z` driving its size,
brightness and parallax — and projected by hand. No dependency was added.

**Three new files, mirroring the field's separation of concerns:**

- `lib/neural-portrait.ts` — the engine. Simulation lives entirely outside React.
- `components/effects/NeuralPortrait.tsx` — lifecycle shell only.
- `components/effects/NeuralPortraitMount.tsx` — `ssr: false` import, viewport deferral, mobile
  simplification.
- `components/effects/PortraitParallax.tsx` — the portrait's own cursor tilt, ref-driven.

**What actually makes it not-a-constellation, structurally rather than cosmetically.** The field
scatters nodes at random and links whatever falls within a radius — that reads as stars: even,
isotropic, no centre. This engine has *neither* random placement nor proximity linking. Nodes sit
on concentric **shells**, evenly spaced by angle with bounded deterministic jitter, and every link
is one of three kinds: `ring` (angular neighbours), `radial` (to the nearest node on the shell
*inside*, which is what makes it read as network layers), and `core` (innermost shell to the
portrait's rim). The result has an unmistakable centre and an unmistakable direction of flow.

**The old portrait-tied `NeuralFieldMount` inside the card was removed.** It was a second instance
of the hero's own engine, clipped to a rectangle — precisely the "smaller repeat of the
background" the brief rules out. Keeping both would have been noise.

**Two things I got wrong first and had to see on screen to catch:**

1. **The network was invisible.** Drawn over the site-wide field at similar density and
   brightness, a designed structure just reads as more background mesh. `.ecosystem-scrim` (the
   Skills fix for the same problem) tops out at 56% of the page colour and was *not* enough here;
   `.neural-portrait-scrim` sinks the field to 88% locally. That, plus a contrast lift on the
   links and nodes, is what makes it a distinct object.
2. **The portrait was a flat grey disc.** The source photo has a light studio backdrop; cropped to
   a circle on a near-black page it looked pasted on — the same problem `scripts/cutout.py` grades
   away for the hero. Fixed with `.portrait-well`, a vignette that is fully transparent across the
   middle 34% so **the face is untouched** and only the backdrop is carried down to the page.

**Geometry is a matched pair and must be changed together:** the DOM circle is 62% of the stage,
the canvas overflows the stage by 12% (6% below `sm`), and `portraitRadius` / `shellRadii` in the
engine are derived from those two numbers. The comments in both files say so.

---

**⚠ CORRECTION to the caveat in the entry two above.** That entry claims simulated pointer hover
"does not register at all in this headless setup". **That was wrong, and the reason is
`scripts/cdp.mjs --viewport`:** the flag sets `mobile: true` *and* enables touch emulation, so the
browser reports `(hover: none)` / `(pointer: coarse)` / `maxTouchPoints: 5`. Every pointer effect
on the site is correctly disabled in that mode — including the custom cursor, which is simply not
mounted. Hover was never broken; I was testing in touch mode.

**The rule going forward:** run `cdp.mjs` **without `--viewport`** to exercise pointer behaviour,
and **with** it to exercise the touch/mobile branch. Both are useful; they are not interchangeable.

That correction let me close the loose end from the hero work: **the hero portrait reveal is
verified.** `--ro` goes 0 → 0.319 with the radius tracking the cursor and decaying after leave,
the reveal element's rect matches the image's exactly, and its mask resolves to `contain` /
`100% 100%` — identical to the images' `object-contain object-right-bottom`. Containment is
structural, as intended.

---

**Verified (production build, real headless Chrome):**

| check | result |
|---|---|
| assembly is progressive | ink 0 before in view, then 4% → 13% → 39% → 64% → 97% of final, settling ~1.9s |
| assembly waits for view | nothing drawn at all until the canvas is 35% on screen |
| interaction | mean green channel over lit pixels 132.8 → **166.2** with the pointer on the network, decaying back after it leaves (green separates activation-cyan from structural violet/indigo) |
| portrait parallax | `none` → `perspective(900px) rotateX(0deg) rotateY(-0.863deg)`, clears on leave |
| reduced motion | network rendered **statically** (2751 ink), pointer changes it by **0 pixels**, no tilt, **0 running animations page-wide** |
| per-frame cost | **0.017 ms**, by wrapping rAF callbacks and timing them, 4x interleaved A/B (0.596 vs 0.579 ms mean) |
| mobile 390 | canvas 383px inside a 390px viewport, two shells, 4 packets, bio still visible, no horizontal overflow |
| tablet 768 | canvas 536px, contained, no overflow |
| `build`, `lint`, `tsc --noEmit` | clean (still only the pre-existing `spokenLanguages` warning) |

**On the frame-rate measurement, read this before quoting a number:** rAF is *throttled* in this
headless window — raw frame intervals came back at 200 ms, then 66.7/83.3 ms with `--viewport`,
which are scheduling artefacts, not cost. The 0.017 ms figure above measures the callback work
itself and is the trustworthy one. A real fps reading still needs a real browser.

**Also unmeasured:** the pointer branch's own cost. `--viewport` (the only mode where rendering
ran) puts the engine in touch mode, where `influenceRadius: 0` skips the per-node distance work.
That is 27 distance calculations per frame, so the risk is negligible, but it is not measured.

**Content untouched**, as asked: the bio, the Focus/Backend/Frontend list and both badges are
byte-identical. Only the portrait's frame changed.

### Session 3 (cont.) — 2026-08-27 — Hero portrait: cropped to head-and-chest, enlarged, anchored flush right

Abdul sent a reference frame and asked for the hero portrait cropped to that height, then bigger,
then flush to the section's right edge. **Fair criticism landed mid-task — he had to ask for each
step instead of getting a composed result.** Recording that here because the lesson is not about
this portrait: when a request is about how something *looks*, render it, look at it, and judge it,
rather than making the smallest literal change and handing back the next decision.

**1. The crop.** `HERO_CROP` in `scripts/cutout.py`, applied inside `emit()` so both files
necessarily share it — the robotic layer is revealed through a mask that assumes pixel-identical
geometry, so cropping them at separate call sites could silently drift. Final box
`(0, 40, 828, 925)` of the 832x1248 source: head-and-chest, ~6% headroom.

The right bound is the **subject's silhouette edge, not the frame's**. Measured, not guessed: the
photo's alpha runs to column 827 and the robotic variant's to 823, so 828 trims the key's ~4
transparent columns without touching either silhouette. Those columns matter because the hero now
anchors this image flush to the section's right edge, where they would read as a gap.

**2. The size — and the thing that was actually capping it.** The portrait sat in the grid's
0.85fr column, which is ~450px at 1440. No amount of `max-w-*` could beat that, which is why it
kept reading as a small inset picture. It is now **positioned against the section** (`absolute
bottom-0 right-0`, full height) with the grid keeping an empty cell as a spacer so the copy still
cannot run under it. Rendered subject width went 449 → 741 at 1440.

**3. Width steps with the viewport: `42vw → 46vw (xl) → 52vw (≥1400px)`, capped at 860px.** A flat
52vw looked right at 1440 and *wrong* at 1024, where it took over half the screen and crowded the
CTAs — the copy column does not shrink proportionally, because the tagline keeps its `max-w-xl`.
Verified there is a clear channel between the tagline and the subject at every desktop width.

**Three things had to move together, and the code says so in three places:** the images'
`object-position`, `.portrait-reveal`'s `maskPosition` in `tailwind.config.ts`, and `HERO_CROP`.
The mask is what clips the robotic reveal to the silhouette; if its position disagrees with the
images' `object-position`, the clip slides off the subject by exactly that gap and the rim/scan
layers paint outside the body. Both are `right bottom` again after a detour through `bottom`.

**A dead end worth not repeating.** First attempt sized the box to the asset's own ratio (a new
`aspect-hero-portrait` token) so `object-contain` would not letterbox. That *shrank the box*,
which unanchored the portrait from the hero baseline and left it floating in mid-air with a gap
beneath. The 4:5 box is taller than the cropped asset on purpose: `object-contain
object-right-bottom` pins the image to its bottom edge, so the baseline is preserved and the crop
alone enlarges the head. The token was reverted. **Do not "fix" the box to match the asset ratio.**

`.hero-portrait`'s bottom feather also moved 76% → 88%: at 76% it was tuned for a near-full-length
asset with torso to spare, and against the tight crop it started around the tie knot and ate most
of the chest.

**Verified (production build, real headless Chrome):**

| check | result |
|---|---|
| both cut-outs regenerated | subject coverage **59.2%**, matching the recorded reference |
| flush right | **0px gap** from the viewport's right edge at 1024 / 1280 / 1440 / 1920 |
| subject size at 1440 | 741px wide, up from 449 |
| copy clearance | tagline ends before the subject begins at 1024 (28px) and 1280 (19px); at 1440+ the head sits above the tagline band, confirmed by screenshot |
| horizontal overflow | none at 390 / 768 / 1024 / 1280 / 1440 / 1920 |
| below `lg` | portrait and its spacer both `display: none`, heading still renders |
| `build`, `lint`, `tsc --noEmit` | clean (still only the pre-existing `spokenLanguages` warning) |

**Not verified:** the cursor reveal itself. Simulated hover does not register in this headless
setup (see the caveat in the previous entry), so the robotic layer's alignment rests on the
mask/`object-position` pairing being correct by construction rather than on a measurement.
**Abdul should move the cursor over the portrait once and confirm the robot stays inside the
silhouette.**

### Session 3 (cont.) — 2026-08-27 — Hero cut-outs regenerated, and a résumé download button in the navbar

Two requests. Abdul deleted `public/portrait2-cutout.png` and `public/robotic-portrait-cutout.png`
and asked for them back, and asked for a "beautiful download resume button in hero or navbar".

**The cut-outs cost one command, which is the whole point of `scripts/cutout.py` being
committed.** `python scripts/cutout.py <preview_dir>` rebuilt both from the surviving sources
(`public/portrait2.jpeg`, `public/robotic_portrait.jpeg`). The run reported **subject coverage
59.2%** — *exactly* the figure this file already recorded as the stable reference, which is what
confirms the matte came back identical rather than merely plausible. Both files serve 200 from a
production build and the hero decodes the cut-out at its expected size.

This is the second time that script has paid for itself. **Do not delete it, and do not
re-derive a cut-out by hand.**

---

**The résumé button went in the navbar, not the hero.** Abdul said "hero or navbar", so this was
a judgement call: the hero already carries two CTAs (View Projects / Get In Touch) whose entrance
stagger and scroll transform are tuned, and a third would both crowd that row and mean the
résumé disappears the moment you scroll. In the navbar it is *persistently* reachable, which is
what a résumé link is for. Easy to move if Abdul wants it in both.

`components/ui/ResumeButton.tsx`, used twice by `Navbar` — desktop bar and mobile menu.

**Built from the site's existing vocabulary rather than as a new effect:** the border charge is
the same `.circuit-card` / `.circuit-trace` pair the service and credential cards already use, so
the one always-visible CTA reads as part of the running system. It costs nothing at rest — the
trace is authored `opacity: 0` / `animation-play-state: paused` and only the parent's
`:hover` / `:focus-visible` starts it.

**A second field, `identity.resumeDownloadUrl`.** `resumeUrl` (the Drive *preview* page) stays
where it is, feeding the Contact panel row — that one is for reading. The button needs the file,
so it points at Drive's `uc?export=download` endpoint. Verified against the live URL: it answers
`Content-Disposition: attachment; filename="Resume.pdf"`, 155 KB, **no virus-scan interstitial**
(Drive only interposes that for large files). Because the response is an attachment the browser
downloads *without navigating away*, so the button deliberately carries **no `target="_blank"`**
— a new tab would just be left behind empty. It also carries no `download` attribute, which
browsers ignore cross-origin anyway.

`Button`'s link branch gained an optional `onClick`, so the mobile menu can close itself when the
download starts. Navigation stays the link's job, so middle-click and Cmd-click still work.

**⚠ A cascade trap worth keeping: `motion-reduce:` cannot override a `group-*` variant.**

The icon drops 2px on hover. The reduced-motion off-switch was written the obvious way,
`motion-reduce:transform-none` — and it did nothing: under reduced motion the icon still jumped.
`group-hover:translate-y-0.5` compiles to **two** class selectors (`.group:hover .group-hover\:…`)
and `motion-reduce:transform-none` to **one**, so the group variant wins the cascade no matter
what the media query says. Being inside `@media (prefers-reduced-motion: reduce)` does not raise
specificity.

The fix is to gate the rule rather than fight it: `motion-safe:group-hover:translate-y-0.5`, so
under reduced motion the declaration does not exist at all. **Any `motion-reduce:` override of a
`group-*` / `peer-*` variant in this codebase is silently dead — use `motion-safe:` on the
variant instead.** Verified both ways: `transform: none` reduced, `matrix(1,0,0,1,0,2)` normal.

---

**Verified (production build at `next start`, real headless Chrome):**

| check | result |
|---|---|
| cut-outs regenerated | subject coverage **59.2%**, matching the recorded reference; both files serve `200`; hero decodes the portrait |
| button href | the `uc?export=download` URL, **no `target`** |
| trace at rest | `opacity: 0`, `animation-play-state: paused`, **0 running animations** |
| trace on focus | opacity 1, running, `--trace-angle` advancing 16.0° → 66.7° in 600 ms (≈ 360°/4.4 s, matching the authored 4.5 s), and **no other trace on the page woke up** |
| icon nudge | `translateY(2px)` on focus, normal motion |
| keyboard | wordmark → 6 nav links → Résumé, `:focus-visible` at every stop |
| reduced motion | edge still lights (`opacity: 1`) but `animation: none`, icon `transform: none`, **0 running animations page-wide** |
| mobile 390px | no résumé link visible until the menu opens; then full-width (342 px in a 390 px viewport), closes the menu on tap; no horizontal overflow |
| `build`, `lint`, `tsc --noEmit` | clean (still the one pre-existing `spokenLanguages` warning from Abdul's own `Skills.tsx` edit) |

**Measurement caveat — SUPERSEDED, see the newest entry.** This originally recorded that
simulated hover "does not register at all in this headless setup". The real cause was
`scripts/cdp.mjs --viewport`, which enables touch emulation and therefore *correctly* disables
every pointer effect on the site. Run without `--viewport` to test hover; the trace's
`:focus-visible` verification below stands on its own either way.

### Session 3 — 2026-08-27 — The three missing links, and a real contact form that emails Abdul

Abdul supplied the last outstanding links and asked for a working contact form: *"want to add
contact form where they can contact me. when user submits form send notificaion on my mail."*

**The links, all three now wired in `content/data.ts`:**

| field | value |
|---|---|
| `identity.resumeUrl` | the Google Drive share link (opens Drive's preview page, so every consumer treats it as an external link, not a download) |
| Pest Eye `liveUrl` | `https://pesteyee.netlify.app/` |
| Netflix Stock Price Predictor `liveUrl` | `https://netflix-stock-price-predictor-p9li.onrender.com/` |

**Still `[TODO]`: the two repo links.** Abdul gave live URLs only. `repoUrl` stays `null` for
both, and Phase 9's rule still holds — the button is hidden rather than dead.

The résumé had no consumer anywhere (the field had been `null` since Phase 1), so it needed a
home. It went into the Contact panel as a dashed-border row under the three contact methods,
**not** as a fourth `contact.methods` entry: a CV is not a way of contacting someone, it just
belongs in the same reach-out moment. It renders only when `resumeUrl` is non-null.

---

**The contact form — `CONTENT_BRIEF.md`'s last open question, finally answered.** The brief
ended by asking whether the contact section ships a working form or just the three direct
links. Abdul chose the form, delivered by email. `contact.formEnabled` is now `true`.

Three new files, and the split between them is the design:

- **`lib/contact-form.ts`** — the field shape, the length limits and `validateContactForm`,
  imported by *both* sides. The client runs it so the user gets an instant error instead of a
  round trip; the server runs the same function because anything can POST to the route
  directly. One module is what stops the two from drifting into disagreeing about what a valid
  message is.
- **`app/api/contact/route.ts`** — validate, then honeypot, then rate limit, and only then
  send. Sending is deliberately last, so junk costs nothing but CPU.
- **`components/sections/ContactForm.tsx`** — the terminal skin over a genuine form.

**Why a route handler rather than a client-side POST to a form service:** the Resend API key is
a send-anything credential and has to stay server-side. It also keeps validation, rate limiting
and the email's shape ours to control.

**The links stay above the form and were not touched.** They are plain anchors that work with
JavaScript off, with a missing API key, and with Resend down. The form is the convenience
layered on top — nobody who needs to reach Abdul depends on the part that can fail.

**Details worth not re-deriving:**

- **The honeypot answers `200 ok`.** Telling a bot it was caught teaches it to try again
  differently; letting it believe it succeeded keeps it posting into a void. Nothing is sent.
- **Every value is HTML-escaped into the email body**, and CR/LF is stripped from the subject
  line — that is header injection, and the form is a public endpoint.
- **Rate limit is 5/hour/IP, in-process, and is explicitly *not* a security boundary.**
  Serverless instances do not share memory, so a cold instance starts empty. It raises the cost
  of casual abuse; if real abuse appears the fix is a shared store, not a bigger Map.
- **A missing `RESEND_API_KEY` is treated as misconfiguration, not user error:** loud
  `console.error` for whoever deployed it, `503`, and the visitor is handed the direct email
  address. The form never silently swallows a message it could not deliver.

---

**⚠ A verification trap, logged because I fell into it and nearly "fixed" working code.**

First browser check reported every invalid field row still painting its *subtle* border, not
the pink one — `data-invalid="true"` was on the element, `matches()` confirmed the selector hit,
and the rule was present in the loaded stylesheet. It looked exactly like a specificity bug.

It was a **300 ms `transition: border-color` on `.terminal-field`, sampled at 300 ms.**
`getComputedStyle` during a transition returns the interpolated value, not the target. Sampling
at 50/200/400/800 ms showed it resolving cleanly to `rgb(236, 72, 153)`.

The rule now: **when a computed style disagrees with a rule you can see matching, check for a
transition on that property before touching the CSS.** This file has now recorded two separate
phantom regressions caused by measuring at the wrong moment (the other being frame rate) — both
times the code was already correct.

---

**Verified (production build at `next start`, real headless Chrome via `scripts/cdp.mjs`):**

| check | result |
|---|---|
| route: empty body / bad email / short message | `400` with per-field errors, all three fields |
| route: honeypot filled | `200 {"ok":true}`, nothing sent |
| route: malformed JSON | `400` |
| route: valid, no API key | `503`, body names the direct email address |
| route: valid, bogus API key | `502` — Resend's rejection is **handled, not thrown** |
| rate limit | 5 valid POSTs pass, the 6th returns `429` |
| labels | all three are real `<label for>` pairs; `type="email"`, `autoComplete` set |
| invalid submit | `aria-invalid="true"`, `aria-describedby` resolves to the error text, focus moves to the first bad field, polite live region announces the summary |
| error clears | fixing one field clears only that field's error; the others stay |
| keyboard | résumé link → name → email → message → submit → mailto, `:focus-visible` at every stop, honeypot never reached |
| sending state | button disabled and relabelled, all three fields disabled, status "Sending your message…" |
| success state | form replaced by a `role="status"` confirmation + "Send another message" |
| reduced motion | **0 running animations page-wide** while sending (25 in the control run) |
| responsive | 390 / 768 / 1440 — no horizontal overflow at any width, error text wraps inside the viewport |
| `build`, `lint`, `tsc --noEmit` | clean (the one warning is still the pre-existing unused `spokenLanguages` from Abdul's own edit to `Skills.tsx`) |

**The one path that could not be tested here: a genuinely successful send.** It needs Abdul's
real Resend key. Everything up to and including Resend's own rejection of a bad key is
verified; the success *UI* was exercised with a stubbed `fetch`.

**Next up / needs Abdul:**

1. **Create a Resend account at https://resend.com and generate an API key.** Sign up with
   **abdulqadir12511@gmail.com** — while the sender is Resend's shared `onboarding@resend.dev`,
   Resend only delivers to the account owner's address.
2. Put it in `.env.local` as `RESEND_API_KEY=...` (see `.env.example`), restart the dev server,
   and send one real message end to end.
3. Add the same variable to the Vercel project when the deploy happens.
4. Still outstanding from before: the Vercel deploy itself, the Lighthouse re-run against the
   deployed URL, the two repo links, and the navbar wordmark SVG.

### Session 2 (cont.) — 2026-08-26 — A signal language across the whole page, and a dead-keyframes bug

Abdul: "add beautiful ai related animations to whole page."

**The idea, rather than a pile of effects.** The page already had one strong AI vocabulary — the
neural field's nodes, synapses and travelling packets — but it lived entirely in the background,
and the content sat on top of it like a document laid over a screensaver. So rather than invent a
new visual language, this pass **extends the field's own vocabulary into the content layer**, so
the sections read as parts of the same running system:

| effect | where | reads as |
|---|---|---|
| `.circuit-trace` | every interactive card (4 services + 11 credentials) | a charge running the card's edge, on hover **and** on focus |
| `.status-node` | every section eyebrow | a live node with a ping ring — "the system is on" |
| `.text-gradient-scan` | every gradient accent word, hero name included | a light passing through the letters |
| `.timeline-packet` | the Experience rail | the field's synapse traffic, on the one line in the content layer that genuinely *is* a connection |
| `.scan-line` | project card images | an analysis pass over the image, on hover/focus |
| `.signal-bus` | the footer's top edge | the system still running after the content ends |

**All of it is CSS.** No new component is a client component (`CircuitTrace` is server-rendered),
no per-frame JS was added, nothing new for React to re-render, and every class carries its own
`prefers-reduced-motion` off-switch. The two hover effects are authored `paused` and started by
the parent's `:hover`/`:focus-within`, so an untouched grid of fifteen cards animates nothing at
all.

`.circuit-trace` is the one with real technique in it: a conic gradient masked down to a 1px ring
(paint the border box, punch out the content box), turned by a **registered** `@property
--trace-angle`. Registration is what makes it work — an unregistered custom property has no type,
so the browser can only interpolate it discretely and it would snap from 0deg to 360deg at the
halfway mark instead of sweeping.

---

**⚠ THE FIND, and it is much bigger than this session's own work: Tailwind was silently dropping
most of this project's `@keyframes`.**

Tailwind only emits an `@keyframes` block when it finds an `animate-*` utility referencing it in
the source. A keyframe consumed **only** by a component class in `addComponents` — which is how
almost every animation in this project is written — never reaches the stylesheet at all.

It fails in the worst possible way: `animation-name` still computes to the right value, so
`getComputedStyle` reports the animation as present and correct. Only
`element.getAnimations().length === 0` gives it away, and the element simply renders in its
static state, which looks entirely reasonable.

**Measured on the committed build, before any fix: only 5 of 13 keyframes existed.** Two of the
eight missing ones were load-bearing:

- **`rise-in` — the hero's entrance stagger.** The site's first impression. Every element still
  rendered, just with no entrance at all.
- **`cursor-core-spin` — the cursor core's counter-rotating arcs.** Built last session,
  documented as "what reads as *processing* rather than a spinner", and never once rotated.

Both were verified dead in Chrome (`animationName: "rise-in"`, `animations: 0`).

**Fix:** the keyframes object is hoisted to a top-level `const keyframes` and the plugin's
`addBase` emits **every** entry as a real `@keyframes` at-rule, whatever consumes it. Confirmed in
the built CSS: **15 keyframes, each exactly once**, no duplicates.

*Worth keeping:* the reason this survived so long is that a missing keyframe degrades into a
perfectly plausible static state. Nothing errors, nothing looks broken, and a screenshot cannot
tell the difference. `getAnimations()` is the only reliable check — `getComputedStyle` will lie to
you here.

---

**⚠ A verification trap that nearly cost a good effect, recorded because I fell into it.**

First frame-rate reading with the new animations: **33.2 ms median (30fps)**, against 16.7 ms with
them cancelled. A bisect then "confirmed" the culprit precisely — cancelling the seven
`gradient-scan` instances took it 32.8 → 17.1 ms, and cancelling one at a time showed a *single*
scanning heading costing the entire frame budget. A tidy, plausible story: `background-clip: text`
repainting per frame over a full-viewport canvas.

**All of it was ambient machine load.** The tell was in the bisect output and I nearly missed it:
the last step cancelled *more* animations and the frame time went **back up** to 33.1 ms. Load
does that. Causation does not.

The correct measurement is **alternating A/B in one page session** — pause and resume the same
animations repeatedly and compare interleaved samples, so drift cannot align with the change.
Result: **ten alternating samples, all exactly 16.7 ms**, scanning or paused. Repeated for all 22
new animations together: **16.82 ms running vs 16.70 ms paused** — 0.12 ms apart, both at the
vsync floor.

The effect was free the whole time. A before/after pair, however clean it looks, cannot separate a
regression from a busy machine; only interleaving can. This is the second time this file has
recorded a phantom 33 ms regression, so the rule is now: **never accept a frame-rate result from a
single before/after pair.**

---

**Verified (production build, real GPU):**

| check | result |
|---|---|
| keyframes emitted | **15, each exactly once** (was 5 of 13) |
| `rise-in` / `cursor-core-spin` | dead before, running after |
| perf, all 22 new animations | **16.82 ms vs 16.70 ms paused** — locked 60fps, 10-sample alternating A/B |
| idle cost of the 15 card traces | `opacity: 0`, `animation-play-state: paused`, all of them |
| trace on hover | opacity 1, running, `--trace-angle` advancing 138.7° → 180.1° in 500 ms (= 360°/4.5 s exactly), **every other trace still paused** |
| keyboard parity | focusing a service card, a credential card and a project link each lights the trace/scan, same as hover |
| timeline packets | both running, staggered, travelling 186 px/700 ms, clipped to the rail |
| gradient scan | 7 accent phrases, all running, position advancing |
| reduced motion | **0 running animations page-wide**; scan lines `display: none`, packets `opacity: 0`, and the status node still renders as a lit dot rather than vanishing |
| mobile 390px | no horizontal scroll, 6 status nodes at 8px, eyebrows still one line, packets running, traces idle |

`build`, `lint`, `tsc --noEmit` clean (the one warning is still the pre-existing unused
`spokenLanguages` from Abdul's own edit to `Skills.tsx`).

**Deviation logged.** `DESIGN_SYSTEM.md` does not specify any of these six effects; they are
Abdul's direct request. They were deliberately built *from* the existing vocabulary — the field's
cyan activation colour, its node/ping shapes, its packet behaviour — rather than as new ideas, so
the doc's language still governs them even though the doc does not list them.

**Not done:** Lighthouse still not re-run (see the Vercel note below). The frame-rate evidence
above is strong, but Lighthouse measures things a frame counter does not.

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

### Session 2 (cont.) — 2026-08-26 — Orbs removed site-wide; Experience copy made legible

**1. Every "neon ball" is gone.** They came from three places, and only the first was obvious:
- `RadialOrbs` in `SiteBackground` — three drifting blurred discs across the whole page.
  Component deleted, along with the `.ambient-orb*` classes and the `orb-drift` keyframes.
- The violet bloom behind the hero portrait (`.ambient-orb-hero`).
- **`SectionHeading`** — a 224px `blur-3xl` violet disc behind *every* section heading. This is
  the one that put a ball in the bento grid, Projects and Contact, and a source grep for
  "orb" would never have found it. What found it was a DOM sweep for *any* element with a
  blur filter and a large border-radius, run after the first two were removed — the shape, not
  the name.

`DESIGN_SYSTEM.md` #11 asks for a diffused glow behind headings. The neural field now supplies
far more ambient light than that item was written for, so stacking blurred discs on top only
muddied the background. Logged in the decision log.

**Verified:** a full-page sweep finds **0** blurred large-radius elements, down from 5+.

**2. The Experience descriptions were rendering perfectly.** `opacity: 1`, `visibility: visible`,
correct colour, real dimensions, no hiding ancestor — the probe confirmed all of it. What made
them "not visible" was the **field's mesh running straight through the glyphs**; that section is
the page's longest run of body copy, so it suffered most. This is exactly the readability trade
flagged when `intensity` went to 1.75.

Fixed with a new `.text-on-field` utility — a halo in the page's own background colour, which
separates text from whatever is behind it **without dimming the field or covering it with a
scrim**. That distinction matters: the last scrim added for a similar reason (`.ecosystem-scrim`)
ended up hiding the field's cursor interaction, which was worse than the problem it solved. A
text-shadow costs the background nothing.

Applied to the timeline's title, organisation and bullets. **It is reusable** — any body copy
that ends up fighting the field should take this class rather than the field being dimmed.

### Session 2 (cont.) — 2026-08-26 — The processing core moved off the canvas onto the cursor

Abdul: "the cyan circle around cursor isnt visible on cards/images."

**Cause, and it is the same one that produced two earlier wrong fixes.** The core — the cyan
ring, the counter-rotating arcs and the centre point — was drawn by the neural field, and the
field is the page background at `-z-20`. Everything it paints is behind content, so the core
vanished behind every card and every image. That is also why the cursor appeared to "change" over
the portrait earlier: what changed was that the core underneath it disappeared.

**Fix: the core is part of the cursor, so it now lives with the cursor.** Rings and arcs are
rendered as DOM in `Cursor.tsx` on the cursor layer (`z-cursor: 50`), where nothing can occlude
them. Built from **borders, not canvas or SVG** — a circle whose border is transparent on all but
one or two sides *is* an arc, and rotating it is transform-only, so the compositor carries it.
Two arcs counter-rotate, which is what reads as "processing" rather than "a spinner".

The canvas keeps the soft glow, the tendrils and the velocity trail. Those are field behaviour —
they describe the network reacting *around* the pointer and are only meaningful where the field
is visible — so leaving them at `-z-20` is correct, not a compromise.

**Verified:** the core renders over `article.glass-surface` in Services and over the hero
portrait, on a layer computing `z-index: 50`.

*This is the third and last symptom of one root cause.* The cursor's identity was distributed
across two layers that could not both be on top: a DOM ring plus a canvas core. Anything drawn on
the background canvas cannot belong to the pointer.

### Session 2 (cont.) — 2026-08-26 — The native cursor was never fully hidden

Abdul kept calling it "the arrow", and that was the literal answer: **the OS pointer was still
visible**, drawn on top of the custom cursor. Three rounds of cursor work went past it because
**CDP screenshots do not capture the OS cursor** — every screenshot I took looked correct, while
his did not. When a user's screenshot and a scripted one disagree, that gap *is* the finding.

**Cause.** `globals.css` hid the native cursor with `body { cursor: none }`. `cursor` inherits,
but any element carrying its own value wins — and the UA stylesheet gives every `a:link`
`cursor: pointer`. So the arrow reappeared over **every link and button**. Measured before the
fix: nav links and CTAs computed `pointer` while everything else computed `none`.

**Fix:** `body, body *`. Author styles beat UA styles regardless of specificity, so no
`!important` is needed. One Tailwind `cursor-default` on the lightbox backdrop was also removed —
a class (0,1,0) out-specifies `body *` (0,0,2) and would have punched a hole in the rule.

**Verified:** with motion enabled, **0 of 729 elements** and **0 of 45 interactive elements**
compute a native cursor. Under reduced motion `body` is back to `cursor: auto` and all 45 get
their native cursors again — correct, because `CursorMount` does not mount the custom cursor
there.

*Abdul's hypothesis was "move the cursor to the top layer".* Worth recording why that could not
have worked: the custom cursor was already top of the z-scale (`z-cursor: 50`), and the OS
pointer is **not a DOM layer at all** — no z-index can sit above it. `cursor: none` is the only
lever.

### Session 2 (cont.) — 2026-08-26 — Hero portrait colour-graded onto the dark page

Abdul: the normal hero photo "is much brighter and doesnt look good on dark background".

**Measured before choosing a fix, and the obvious reading was wrong.** The subject's mean
luminance is only 66 — it is not a bright image overall. The problem is the top end: **p99 was
236 and 5% of the subject sat above 200**, against a page at luminance 9. The shirt and lit skin
were blowing out, which is what made the cut-out read as pasted on rather than lit by the scene.
Pulling the whole image down would have muddied the face and missed the cause.

So `scripts/cutout.py` gained a `grade()` step that **compresses highlights and leaves midtones
nearly alone**: a Reinhard-style rolloff above a 0.45 knee, a small exposure trim, a little
desaturation, and a slight cool bias toward the page's blue-violet. Chosen by rendering four
knee settings side by side on the real background — 0.35 was visibly flattening the face.

**Result: p99 236 → 154, nothing above 200 at all, mean 66 → 54**, face fully legible.

**The robotic variant is deliberately left ungraded** and the call is worth keeping: it is meant
to read as lit from within, it is only ever seen inside the reveal, and dimming it would defeat
the effect. Grading the photo actually *increased* the contrast between the two, so the AI
version now pops harder than before. About is untouched — it uses the raw photo with its
background, per Abdul.

### Session 2 (cont.) — 2026-08-26 — The cursor gets a fixed appearance (third attempt, correct one)

Two wrong fixes preceded this, both from misreading the same report. What Abdul's screenshots
finally made clear is the **mechanism**: the cursor never had a fixed appearance at all.

`mix-blend-mode: difference` *derives* the cursor's colour from whatever is beneath it. Over the
page that meant differencing the white inner dot against the neural field's cyan processing core,
which is what produced the familiar white ring with a warm red-orange dot — the look he kept
pointing at. Over the hero portrait the **image occludes that core**, so the identical cursor
differenced against bright chrome instead and its dot went dark and all but vanished. The cursor
was changing identity depending on what it passed over, and the portrait simply made it obvious.

So neither "make it legible over the image" (attempt 1) nor "leave it alone" (attempt 2) was the
answer. **The cursor needed to stop deriving its colour from the backdrop at all.**

- `mix-blend-difference` is gone; `.cursor-layer` carries two drop-shadows instead, which follow
  the ring's and the dot's own shapes and keep both readable over a bright image without
  altering their colour.
- New `cursor-dot` token, `#DD2C11` — *the colour the blend used to compute*
  (`|255-34|, |255-211|, |255-238|` against the cyan core), now stated outright rather than being
  an artefact that only appeared where the core happened to be visible.

**Verified identical over the portrait and over the page:** `blend: normal`,
ring `rgb(245,246,250)`, dot `rgb(221,44,17)` in both.

**Deviation logged:** `DESIGN_SYSTEM.md` specifies `mix-blend-mode` for the cursor "for
legibility over any background". That is now done with drop-shadows instead, because the blend
achieved legibility only by sacrificing a consistent identity — and on a site whose one bright
surface is a portrait the reader's pointer lives on, that trade was the wrong way round.

### Session 2 (cont.) — 2026-08-26 — Cursor left alone over the portrait (a change, then reverted)

Abdul asked for "the same cursor design on image". I offered three readings; he picked "cursor
looks wrong over the image", so `data-cursor-plain` was added — the cursor dropped its
`mix-blend-mode: difference` over the hero portrait and painted a fixed light ring with a dark
halo instead.

**That was the wrong fix and it is reverted** (`d2d2ea3`). His follow-up, with a screenshot of
the cursor he wants: *"same cursor design when i hover over the image dont change it."* The point
was never that the cursor should be made legible by different means over the portrait — it was
that it must not **change at all**. Dropping the blend and adding a halo is itself a change of
design, so the fix was an instance of the problem.

**The cursor now behaves identically everywhere**, `mix-blend-difference` included, and the
`data-cursor-plain` mechanism is gone rather than left as dead code (recoverable at `d2d2ea3` if
a genuinely bright surface ever needs it).

*Worth remembering:* the difference blend is why the cursor's white inner dot reads red-orange
over the field's cyan core — `|255-34|, |255-211|, |255-238|` = `(221, 44, 17)`. That is the
design working as specified, not a bug, and it is visible in the screenshot Abdul attached as the
look he wants kept.

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

- **2026-09-07 — the desktop loader is readiness-driven rather than a fixed ~1.3 seconds.**
  Abdul explicitly asked for it to reflect connection speed. The initial progress is staged
  toward a ceiling because browsers do not expose a reliable byte-total for an entire Next.js
  page, but it can reach 100% only after the load event, fonts, and two paint frames. The gate uses
  `next/script` with `beforeInteractive`; because Next.js 16.3 queues inline scripts until its
  bootstrap runs, the static `loader-pending` class displays the SSR shell immediately and avoids
  a hero flash. Pre-hydration code must store progress outside React-owned markup and let
  `Loader` adopt it during `useLayoutEffect`, or React will correctly report a hydration mismatch.
- **2026-08-27 — `resend` added as a dependency (`CLAUDE.md` §2 requires logging this).** It is
  not a UI/animation/particle package, so it does not compete with anything in §2; it is the
  mail transport for the contact form, and it is the provider `CONTENT_BRIEF.md` itself named.
  Chosen over Web3Forms/Formspree because the API key stays server-side in a route handler
  instead of shipping to the browser, and over Gmail SMTP + Nodemailer because Gmail SMTP is
  unreliable from serverless functions. It is confined to `app/api/contact/route.ts` — no
  client component imports it, so it adds nothing to the client bundle.
- **2026-08-27 — form error states reuse `accent-pink`; no new "danger" token was invented.**
  `DESIGN_SYSTEM.md` has no error colour. Rather than guess one (`CLAUDE.md` §1 forbids that),
  the invalid state uses the existing `accent-pink`, which measures ~5.6:1 on `bg-base` and so
  passes AA for the error text. Colour is never the only signal: the row also carries written
  text wired up with `aria-describedby`, and the control carries `aria-invalid`.

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
- **The hero portrait cut-outs are derived, not supplied — but regenerating them is one
  command.** `python scripts/cutout.py` rebuilds both `portrait2-cutout.png` and
  `robotic-portrait-cutout.png` from the committed sources. Re-run successfully on 2026-08-27
  after Abdul deleted both, reproducing the reference **59.2% subject coverage** exactly. A real
  background-removed export would still beat any derived key, if one is ever available.
- ~~**Loader still appears ~600ms after first paint** when motion is enabled.~~ **Resolved
  2026-09-07:** the SSR shell and synchronous first-body gate now cover the hero from the first
  observable frame, and completion follows actual browser/font readiness.
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
- **Links — mostly resolved 2026-08-27.** ~~Résumé/CV link~~ (Google Drive share link, wired
  into `identity.resumeUrl` and rendered as a row in the Contact panel) and ~~live links for
  **Pest Eye** and **Netflix Stock Price Predictor**~~ are all supplied and wired.
  **Still outstanding: the `repoUrl` for those same two projects** — Abdul gave live URLs only.
  Both stay `null`, so the repo button is hidden rather than dead, per Phase 9's rule. All five
  certification links were already resolved — four Coursera verify URLs, and n8n opens a
  lightbox as it has no public URL.
- ~~**Open content question:** working contact form or just the three direct links?~~
  **Answered 2026-08-27: both.** The three links are unchanged and the form ships below them,
  posting to `/api/contact` and delivered by Resend. See the Session 3 log entry.
  **`RESEND_API_KEY` is set locally as of 2026-08-27** and a real message was delivered
  end-to-end (`{"ok":true}` from Resend). It lives in `.env.local`, which is gitignored — **it is
  therefore not in the repo and will not travel to Vercel by itself.** The one remaining step is
  adding the same variable to the Vercel project's environment variables at deploy time.
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

**Re-measured 2026-08-27**, after this session's About / Contact / Hero rework, on a local
production build (`next build` + `next start`), Lighthouse CLI, desktop preset, three runs:

| Category       | 2026-08-27 (desktop) | vs 2026-08-21 |
|----------------|----------------------|---------------|
| Performance    | **93–96** after the 2026-08-27 raster fix (was 87–91) | recovered |
| Accessibility  | **100**              | held (after fixing two regressions — see the session log) |
| Best Practices | **100**              | held |
| SEO            | **100**              | held |

Desktop: LCP 1.2s, TBT ~210ms, CLS 0.008, total transfer 501 KiB.

**The drop is bootup time, not payload** — payload got substantially *better* this session
(1.5 MB → 501 KiB, after the 1 MB CSS-mask PNG was replaced with a 9 KB stencil). The remaining
cost is client JS execution. Measure it on the deployed URL before acting on it: three runs of
identical code here gave 88 / 62 / 87, and a `next dev` server was competing for CPU throughout.

**Read the mobile number carefully before acting on it:**
- Lighthouse's default preset applies **4× CPU throttling and slow-4G**, on top of a dev
  machine that was simultaneously running Abdul's own browser (32 Chrome processes) and Node
  builds. Repeat runs of *identical code* scored 73, 78, 79, 80, 87 and 91 — a ±18 point
  spread from machine load alone. **Never draw a conclusion from a single run.**
- This is `next start` on localhost: no CDN, no Brotli, no edge caching. A real Vercel
  deployment should measure better.
- **Re-run against the deployed URL before treating the mobile figure as final** — that is the
  measurement Phase 14 actually asks for, and it is the one still outstanding.
