"use client";

import { useEffect, useRef } from "react";

import { ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import {
  NeuralField as Engine,
  STORY_SECTIONS,
  type NeuralFieldConfig,
} from "@/lib/neural-field";
import { cn } from "@/lib/utils";

const ROBOTIC_REVEAL_EVENT = "portfolio:robotic-reveal";

export type { NeuralFieldConfig };

interface NeuralFieldProps extends NeuralFieldConfig {
  className?: string;
  /**
   * Drive the field's stage story from scroll position. Only the site-wide field sets this —
   * the About portrait's own field is a local decoration and stays in its resting layout.
   */
  story?: boolean;
}

/**
 * React shell around the neural-field engine in `lib/neural-field.ts`.
 *
 * Everything this component owns is lifecycle — mounting, sizing, pausing, teardown. The
 * simulation itself lives outside React entirely, so no parent re-render can reach the
 * animation loop, and an inline config object on the caller cannot re-seed the field.
 *
 * Lifecycle rules it enforces for every consumer (`CLAUDE.md` §4):
 * - under `prefers-reduced-motion` it paints **one static frame and never starts a loop**, and
 *   never attaches a pointer listener,
 * - the loop stops when the tab is hidden **and** when the canvas scrolls out of view,
 * - the engine is destroyed and every listener removed on unmount.
 */
export default function NeuralField({ className, story, ...config }: NeuralFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  // Config is read once when the engine is built. Holding it in a ref that is updated in its
  // own effect (never during render) means a parent re-rendering with an equivalent inline
  // object does not tear down and re-seed the whole field.
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let engine: Engine;
    try {
      engine = new Engine(canvas, configRef.current);
    } catch {
      // No 2D context (very old or hardened browser): the field is pure decoration, so
      // rendering nothing is the correct outcome, not an error.
      return;
    }

    let onScreen = true;
    const sync = () => {
      if (reducedMotion) return;
      if (onScreen && !document.hidden) engine.start();
      else engine.stop();
    };

    if (!engine.resize()) {
      // Zero-sized at mount (a display:none ancestor, or a not-yet-laid-out grid cell). The
      // ResizeObserver below will call back with real dimensions.
      canvas.dataset.nodes = "0";
    }
    if (reducedMotion) engine.renderStatic();

    /* -- sizing ------------------------------------------------------------ */
    // The canvas is `position: fixed` for the site-wide field and `absolute` inside a card for
    // the portrait one, so its viewport rect is cached and refreshed rather than measured on
    // every pointer sample — the old field called `getBoundingClientRect()` inside
    // `pointermove`, which is a forced layout read on every mouse event.
    let rect = canvas.getBoundingClientRect();
    const refreshRect = () => {
      rect = canvas.getBoundingClientRect();
    };

    const resizeObserver = new ResizeObserver(() => {
      if (engine.resize()) {
        refreshRect();
        if (reducedMotion) engine.renderStatic();
      }
    });
    resizeObserver.observe(canvas);

    /* -- pause when unseen -------------------------------------------------- */
    const viewportObserver = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { rootMargin: "150px" },
    );
    viewportObserver.observe(canvas);

    const onVisibility = () => sync();
    document.addEventListener("visibilitychange", onVisibility);

    /* -- pointer and scroll -------------------------------------------------- */
    let lastMove = 0;
    const onPointerMove = (event: PointerEvent) => {
      const now = event.timeStamp || performance.now();
      const dt = lastMove ? Math.min((now - lastMove) / 1000, 0.1) : 0;
      lastMove = now;
      engine.setPointer(event.clientX - rect.left, event.clientY - rect.top, dt);
    };
    const onPointerLeave = () => {
      lastMove = 0;
      engine.clearPointer();
    };
    const onRoboticReveal = (event: Event) => {
      const detail = (event as CustomEvent<{ active?: boolean }>).detail;
      engine.setRoboticReveal(detail?.active === true);
    };

    let scrollQueued = false;
    const onScroll = () => {
      if (scrollQueued) return;
      scrollQueued = true;
      // rAF-throttled: `getBoundingClientRect()` on every scroll event of a Lenis-smoothed
      // page is a lot of layout reads for a value that only needs to be right once per frame.
      window.requestAnimationFrame(() => {
        scrollQueued = false;
        refreshRect();
        engine.setScroll(window.scrollY);
      });
    };

    /* -- the scroll story ----------------------------------------------------- */
    /**
     * One ScrollTrigger per section boundary, each scrubbed, reporting a fractional stage
     * position into the engine. Section-aligned rather than a single trigger over the whole
     * page, because the sections have very different heights — a flat `scrollY / maxScroll`
     * mapping would race through the short ones and crawl through the tall ones, and the scene
     * would stop agreeing with the content it is meant to be describing.
     *
     * GSAP ScrollTrigger rather than a scroll listener because this is scrubbed work
     * (`CLAUDE.md` §2), and it inherits the Lenis wiring from `lib/gsap.ts`.
     */
    const storyTriggers: ScrollTrigger[] = [];
    const buildStory = () => {
      const sections = STORY_SECTIONS.map((id) => document.getElementById(id));
      for (let i = 0; i < sections.length - 1; i += 1) {
        const current = sections[i];
        const next = sections[i + 1];
        if (!current || !next) continue;
        storyTriggers.push(
          ScrollTrigger.create({
            trigger: current,
            start: "top top",
            endTrigger: next,
            end: "top top",
            scrub: true,
            // The hero pins, which changes the offsets of everything below it. Without this
            // these triggers would measure against a layout that has no pin spacer in it yet.
            refreshPriority: -1,
            onUpdate: (self) => engine.setStory(i + self.progress),
          }),
        );
      }
    };

    if (!reducedMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("pointerleave", onPointerLeave);
      window.addEventListener("scroll", onScroll, { passive: true });
      if (story) {
        // Only the site-wide field follows the hero portrait. Local decorative fields retain
        // their own palette and never pay for this listener. The touch configuration sets the
        // influence radius to zero and has no portrait reveal, so it skips the listener too.
        if ((configRef.current.influenceRadius ?? 0) > 0) {
          window.addEventListener(ROBOTIC_REVEAL_EVENT, onRoboticReveal);
        }
        // Deferred a frame: this component is dynamically imported, so the sections it needs
        // to measure may not be laid out at the moment it mounts.
        requestAnimationFrame(() => {
          buildStory();
          ScrollTrigger.refresh();
        });
      }
      sync();
    }

    return () => {
      storyTriggers.forEach((trigger) => trigger.kill());
      resizeObserver.disconnect();
      viewportObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener(ROBOTIC_REVEAL_EVENT, onRoboticReveal);
      engine.destroy();
    };
    // `story` is constant per call site in practice, but it genuinely changes what this effect
    // builds, so it belongs in the dependency list rather than being suppressed.
  }, [reducedMotion, story]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      data-neural-field
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}
