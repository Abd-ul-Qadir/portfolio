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

      /* -- Hero → About: About rises into place as the hero transforms away ---------- */
      // Paired with the hero shrinking and fading on its own pinned timeline, this reads as
      // one view handing over to the next rather than the page merely scrolling. It is a
      // separate ScrollTrigger on purpose: it belongs to About's own entry, and the hero's
      // timeline is pinned, so folding this into it would tie About's position to the pin.
      const aboutInner = document.querySelector<HTMLElement>("#about [data-section-inner]");
      if (aboutInner) {
        const tween = gsap.fromTo(
          aboutInner,
          { yPercent: 14, opacity: 0, scale: 0.985 },
          {
            yPercent: 0,
            opacity: 1,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: document.querySelector("#about") as HTMLElement,
              // Deliberately *inside* the viewport rather than "top bottom". The hero is
              // pinned, and its pin spacer means a range starting at the viewport bottom is
              // consumed while About is still parked off-screen — the tween finishes before
              // it is ever visible, so it looks like nothing happens.
              start: "top 88%",
              end: "top 38%",
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
