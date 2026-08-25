"use client";

import { gsap, useGSAP } from "@/lib/gsap";

/**
 * The cinematic section choreography: each section's content flies in from one direction,
 * settles to rest while it is the thing being read, then leaves in another — every bit of it
 * scrubbed directly to scroll position, so stopping halfway shows the halfway state and
 * scrolling back up reverses it exactly.
 *
 * ---
 *
 * ## The one rule that keeps this readable
 *
 * There is a **settled zone**: enter finishes while the section is still rising into view, and
 * exit does not begin until it is genuinely on its way out. In between, the content sits at an
 * identity transform and does not move at all.
 *
 * That is deliberate and it is the difference between cinematic and unusable. Text that
 * translates while you are trying to read it is both hard to read and a well-known
 * motion-sickness trigger — `PHASE_PLAN.md` Phase 11 says as much when it argues against
 * scroll-jacking every boundary. The brief here asks for a section to "appear → become the
 * focus → exit", and *become the focus* means holding still.
 *
 * ## What it transforms, and what it deliberately does not
 *
 * It animates each section's inner `[data-section-inner]` container — **never the `<section>`
 * itself**. That matters for three separate reasons:
 *
 * 1. The neural field's scroll story measures each section with `start: "top top"`, and the
 *    navbar scroll-spy observes the sections directly. Moving the section would move the
 *    triggers that describe it.
 * 2. `#about`-style anchor links jump to the section box; a transformed section lands off-target.
 * 3. `CredentialLightbox` is `position: fixed` and lives inside `<section>` (as a sibling of the
 *    container). **Any transform on an ancestor makes a fixed element position against that
 *    ancestor instead of the viewport**, which would break the modal. Transforming only the
 *    container leaves it alone.
 *
 * ## Hero is not in the table
 *
 * The hero already has its flagship pinned transform (`HeroChoreography`) which scales it away
 * into the top-left corner. That *is* its exit, so About is choreographed to enter from the
 * opposite corner and the two read as one handover.
 *
 * ## Depth
 *
 * `transformPerspective` is set on the container itself rather than a `perspective` CSS class
 * on the parent, so the whole effect stays inside this component with no CSS to keep in sync.
 * Rotation is kept small (≤10°) — past that, text on the receding edge starts to shimmer.
 *
 * Blur is not used. The brief allows it "if performant", and a full-width filter blur animated
 * every frame is the one effect here that would certainly cost frames.
 *
 * Transform and scale are genuinely free — they are compositor work. **Opacity is not**, unless
 * the element is promoted first; see the `will-change` note below, which is the difference
 * between this layer costing 50% more frame time during scroll and costing nothing at all.
 */

/** A movement, in percent of the container's own size and degrees. */
interface Pose {
  x: number;
  y: number;
  rotY: number;
  rotX: number;
  scale: number;
}

interface Move {
  id: string;
  /** Where the content comes from as the section arrives. */
  from: Pose;
  /** Where it goes as the section leaves. `null` for the last section, which must stay put. */
  to: Pose | null;
}

const pose = (x: number, y: number, rotY: number, rotX: number, scale: number): Pose => ({
  x,
  y,
  rotY,
  rotX,
  scale,
});

/**
 * The choreography.
 *
 * Directions alternate rather than repeat, and each section's entrance answers the previous
 * one's exit — content leaving to the left is followed by content arriving from the right, so
 * the eye is handed across rather than bounced. The hero exits into the top-left corner, so
 * About enters from the bottom-right.
 *
 * **Contact has no exit.** It is the last section and the footer follows it; animating it away
 * would end the page on empty space.
 */
const MOVES: readonly Move[] = [
  // hero exits top-left (its own timeline) -> About arrives from the bottom-right.
  { id: "about", from: pose(14, 6, -10, 1.5, 0.93), to: pose(-13, -4, 8, -1.5, 0.9) },
  // About left -> Skills arrives from the bottom-left, leaves to the top-right.
  { id: "skills", from: pose(-14, 8, 10, 2, 0.93), to: pose(12, -6, -8, -2, 0.9) },
  // Skills top-right -> Services arrives from the right, leaves to the top-left.
  { id: "services", from: pose(15, 4, -9, 1.5, 0.94), to: pose(-11, -6, 7, -2, 0.91) },
  // Services top-left -> Experience arrives from the left, leaves to the right.
  { id: "experience", from: pose(-15, 3, 9, 1, 0.94), to: pose(13, -4, -8, -1.5, 0.9) },
  // Experience right -> Projects arrives from the bottom-right, leaves to the top-left.
  { id: "projects", from: pose(13, 8, -8, 2, 0.93), to: pose(-12, -5, 7, -2, 0.91) },
  // Projects top-left -> Contact rises into place and stays. The story resolves here.
  { id: "contact", from: pose(-6, 10, 4, 2, 0.94), to: null },
];

/** Mobile keeps the choreography but flattens it — no rotation, and much shorter travel. */
const MOBILE_SCALE = 0.42;

const flatten = (p: Pose): Pose => ({
  x: p.x * MOBILE_SCALE,
  y: p.y * MOBILE_SCALE,
  rotY: 0,
  rotX: 0,
  scale: 1 - (1 - p.scale) * 0.5,
});

export function SectionChoreography() {
  useGSAP(() => {
    const media = gsap.matchMedia();

    const build = (compact: boolean) => () => {
      const triggers: ScrollTrigger[] = [];

      for (const move of MOVES) {
        const section = document.getElementById(move.id);
        const inner = section?.querySelector<HTMLElement>("[data-section-inner]");
        if (!section || !inner) continue;

        const from = compact ? flatten(move.from) : move.from;
        const to = move.to ? (compact ? flatten(move.to) : move.to) : null;

        // Perspective on the element itself, never on the `<section>`: CSS `perspective`
        // creates a containing block for fixed descendants exactly like `transform` does, and
        // `CredentialLightbox` is a fixed element inside the Projects section.
        //
        // **`will-change` is load-bearing, not a superstition — it was measured.**
        //
        // Animating `opacity` on these containers cost ~50% more frame time during scroll
        // (median 33 ms -> 50 ms, long frames 23 -> 31). The transforms were free; opacity was
        // the entire regression. These subtrees are full-width and several viewports tall, and
        // changing the opacity of one forces the whole subtree to be re-rasterised into an
        // offscreen buffer every frame. Declaring the intent up front lets the compositor keep
        // it on its own layer and apply opacity there instead, which measured **identical to
        // having no choreography at all**.
        //
        // The trade is GPU memory for six large layers, which is why this is scoped to exactly
        // the elements that animate rather than applied broadly. `clearProps` in the teardown
        // below removes it again on a breakpoint change.
        gsap.set(inner, { transformPerspective: 1000, willChange: "transform, opacity" });

        // Direct children get a fraction of the parent's movement, staggered. Because the
        // timeline is scrubbed, `stagger` spreads them across scroll *progress* rather than
        // time — which is what produces "heading first, then the paragraph, then the buttons"
        // as you scroll, and reverses cleanly on the way back up.
        const kids = Array.from(inner.children).filter(
          (el): el is HTMLElement => el instanceof HTMLElement,
        );

        /* -- enter ------------------------------------------------------------- */
        const enter = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
            end: "top 42%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        enter.fromTo(
          inner,
          {
            xPercent: from.x,
            yPercent: from.y,
            rotationY: from.rotY,
            rotationX: from.rotX,
            scale: from.scale,
            opacity: 0,
          },
          {
            xPercent: 0,
            yPercent: 0,
            rotationY: 0,
            rotationX: 0,
            scale: 1,
            opacity: 1,
            ease: "none",
          },
          0,
        );

        if (kids.length > 1) {
          enter.fromTo(
            kids,
            { xPercent: from.x * 0.3, yPercent: from.y * 0.3 },
            {
              xPercent: 0,
              yPercent: 0,
              ease: "none",
              stagger: { each: 0.08, from: "start" },
            },
            0,
          );
        }

        if (enter.scrollTrigger) triggers.push(enter.scrollTrigger);

        /* -- exit -------------------------------------------------------------- */
        if (!to) continue;

        const exit = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            // Does not start until the section's bottom is well up the viewport, so the
            // settled reading zone is never encroached on.
            start: "bottom 62%",
            end: "bottom 4%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        exit.to(
          inner,
          {
            xPercent: to.x,
            yPercent: to.y,
            rotationY: to.rotY,
            rotationX: to.rotX,
            scale: to.scale,
            // Not all the way to 0: the section is still nominally on screen at the end of
            // this range, and content that has vanished entirely reads as a bug rather than as
            // a departure.
            opacity: 0.12,
            ease: "none",
          },
          0,
        );

        if (kids.length > 1) {
          exit.to(
            kids,
            {
              xPercent: to.x * 0.3,
              yPercent: to.y * 0.3,
              ease: "none",
              stagger: { each: 0.08, from: "start" },
            },
            0,
          );
        }

        if (exit.scrollTrigger) triggers.push(exit.scrollTrigger);
      }

      return () => {
        triggers.forEach((trigger) => trigger.kill());
        // Clear the inline transforms the timelines left behind, so a breakpoint change hands
        // over to the other variant from a clean slate rather than compounding onto it.
        gsap.set("[data-section-inner]", { clearProps: "all" });
      };
    };

    // Reduced motion is absent from both queries, so under it nothing here is ever created and
    // every section renders at its natural position with no inline styles at all.
    media.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", build(false));
    media.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", build(true));

    return () => media.revert();
  }, []);

  // Renders nothing: this is a behaviour layer over sections that already exist, found by
  // `data-section-inner` rather than by wrapping them.
  return null;
}
