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

      /* -- Hero → About: About arrives from the bottom corner, following the ball ------ */
      // Timed to the hero pin's *second half* — the leg where the neon ball is travelling
      // back to the left — so About follows it in rather than racing it. The hero pin
      // carries `refreshPriority: 1`, which is what makes these positions correct: without
      // it this trigger measured against a layout with no pin spacer and finished while
      // About was still far below the fold.
      const aboutInner = document.querySelector<HTMLElement>("#about [data-section-inner]");
      const aboutSection = document.querySelector<HTMLElement>("#about");
      if (aboutInner && aboutSection) {
        const tween = gsap.fromTo(
          aboutInner,
          // Diagonally from the bottom-right, opposing the hero's exit to the top-left.
          { xPercent: 12, yPercent: 26, opacity: 0, scale: 0.96 },
          {
            xPercent: 0,
            yPercent: 0,
            opacity: 1,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: aboutSection,
              start: "top bottom",
              end: "top 55%",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
      }

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
            opacity: 1,
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
