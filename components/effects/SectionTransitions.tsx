"use client";

import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";

/**
 * The Phase 12 section-transition macro-layer: the boundaries between finished sections,
 * stitched into one continuous scroll rather than sections merely stacking.
 *
 * This owns three of the four boundaries. The fourth — **Hero → About** — deliberately lives
 * in `HeroChoreography`, folded into the pinned timeline built in Phase 11, because
 * `PHASE_PLAN.md` requires it to share that timeline rather than compete with it.
 *
 * Everything here is **GSAP ScrollTrigger with `scrub`**, tied directly to scroll position,
 * and the whole layer is gated behind `gsap.matchMedia("(prefers-reduced-motion:
 * no-preference)")`. Under reduced motion none of it is created at all, and every element it
 * touches is authored at its resting state — the dot grid at its normal faint opacity, the
 * card connectors already drawn, the darkening layer fully transparent — so the page is
 * simply the same content in the same order with no pinning, blob travel or morph.
 *
 * It renders only the darkening layer; everything else it animates already exists in a
 * section and is found by `data-*` attribute.
 */
export function SectionTransitions() {
  const darken = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const triggers: ScrollTrigger[] = [];

      /* -- About → Skills: the ambient dot grid becomes more defined ----------------- */
      const grid = document.querySelector<HTMLElement>("[data-transition-dotgrid]");
      const skills = document.querySelector<HTMLElement>("#skills");
      if (grid && skills) {
        const tween = gsap.fromTo(
          grid,
          { opacity: 0.25 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: skills,
              start: "top bottom",
              end: "top 40%",
              scrub: true,
            },
          },
        );
        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
      }

      /* -- Skills → Projects: the ecosystem's connecting lines carry into the grid ---- */
      // Each project card carries a connector (node + line) echoing the skill ecosystem's
      // hub-and-spoke language. They draw in, staggered, as the grid is approached — a
      // shared visual grammar rather than a literal shape morph.
      const connectors = gsap.utils.toArray<HTMLElement>("[data-card-connector]");
      const projectGrid = document.querySelector<HTMLElement>("[data-project-grid]");
      if (connectors.length > 0 && projectGrid) {
        const tween = gsap.fromTo(
          connectors,
          { scaleY: 0, opacity: 0 },
          {
            scaleY: 1,
            opacity: 1,
            ease: "none",
            stagger: 0.15,
            scrollTrigger: {
              trigger: projectGrid,
              start: "top bottom",
              end: "top 55%",
              scrub: true,
            },
          },
        );
        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
      }

      /* -- Projects → Contact: the background gradually darkens ---------------------- */
      const contact = document.querySelector<HTMLElement>("#contact");
      if (darken.current && contact) {
        const tween = gsap.fromTo(
          darken.current,
          { opacity: 0 },
          {
            // Kept low deliberately. This layer sits at `-z-10`, directly above the neural
            // field at `-z-20`, so its opacity is subtracted straight from the field's
            // visibility. At the 0.72 it used to scrub to, the bottom of the page read as
            // having no field at all — Abdul reported exactly that. Phase 12 asks the
            // background to "gradually darken" toward Contact, and 0.22 still does that
            // perceptibly while leaving the network clearly visible all the way down.
            opacity: 0.22,
            ease: "none",
            scrollTrigger: {
              trigger: contact,
              start: "top bottom",
              end: "top 30%",
              scrub: true,
            },
          },
        );
        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
      }

      return () => {
        triggers.forEach((trigger) => trigger.kill());
      };
    });

    return () => media.revert();
  }, []);

  return (
    <div
      ref={darken}
      aria-hidden
      data-darken-layer
      // Behind the content but above the body's own background, so raising its opacity
      // genuinely darkens the page rather than tinting the content.
      className="pointer-events-none fixed inset-0 -z-10 bg-bg-deep opacity-0"
    />
  );
}
