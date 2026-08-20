"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

/**
 * GSAP registration, done exactly once for the whole app.
 *
 * `CLAUDE.md` §2 calls this file out as the wiring everything scroll-driven depends on: the
 * Phase 8 timeline growth, the Phase 11 hero transform and the Phase 12 macro-layer all
 * assume Lenis and ScrollTrigger agree on the scroll position. Get this wrong and every one
 * of them jitters.
 *
 * Import `gsap` and `ScrollTrigger` from here — never from `gsap` directly — so no component
 * can forget to register the plugin.
 */

let registered = false;

if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
  registered = true;
}

/**
 * Wires a Lenis instance into GSAP, per Lenis's documented GSAP integration.
 *
 * Lenis drives native scroll (it does not use a fake scroller), so ScrollTrigger needs no
 * `scrollerProxy` here — it only needs to be told to update on every Lenis scroll event, and
 * Lenis needs to be driven from GSAP's ticker instead of its own `requestAnimationFrame` so
 * the two never run in separate frames and fight.
 *
 * Returns a cleanup function that undoes both.
 */
export function connectLenisToScrollTrigger(lenis: Lenis) {
  const update = () => ScrollTrigger.update();
  lenis.on("scroll", update);

  const raf = (time: number) => {
    // GSAP's ticker reports seconds; Lenis expects milliseconds.
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(raf);

  // Lag smoothing would let GSAP skip time after a slow frame, which desynchronises the
  // scrubbed timelines from Lenis's own position.
  gsap.ticker.lagSmoothing(0);

  return () => {
    lenis.off("scroll", update);
    gsap.ticker.remove(raf);
    gsap.ticker.lagSmoothing(500, 33);
  };
}

export { gsap, ScrollTrigger, useGSAP };
