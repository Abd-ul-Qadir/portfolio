"use client";

import { Fragment, useRef } from "react";

import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

interface ScrollRevealTextProps {
  text: string;
  className?: string;
}

/**
 * Progressive, scroll-*scrubbed* text reveal: words start at `text-secondary` and brighten to
 * `text-primary` as they cross into the viewport.
 *
 * Genuinely tied to scroll position rather than fired once on entry — scrolling back up dims
 * the words again, which is exactly what `PHASE_PLAN.md` Phase 6 requires and what a
 * `whileInView` animation cannot do. That scrub is why this is GSAP ScrollTrigger and not
 * Framer Motion (`CLAUDE.md` §2).
 *
 * Under reduced motion no ScrollTrigger is created at all and every word renders at full
 * brightness immediately.
 */
export function ScrollRevealText({ text, className }: ScrollRevealTextProps) {
  const container = useRef<HTMLParagraphElement>(null);
  const reducedMotion = useReducedMotion();
  const words = text.split(" ");

  useGSAP(
    () => {
      if (reducedMotion) return;

      const wordElements = container.current?.querySelectorAll<HTMLElement>("[data-word]");
      if (!wordElements || wordElements.length === 0) return;

      gsap.fromTo(
        wordElements,
        { color: "var(--text-secondary)", opacity: 0.45 },
        {
          color: "var(--text-primary)",
          opacity: 1,
          ease: "none",
          stagger: 1,
          scrollTrigger: {
            trigger: container.current,
            // Starts as the paragraph enters the lower half of the viewport and completes
            // once it has travelled to the upper third — the reading band.
            start: "top 80%",
            end: "bottom 55%",
            scrub: true,
          },
        },
      );

      return () => {
        ScrollTrigger.getAll()
          .filter((trigger) => trigger.trigger === container.current)
          .forEach((trigger) => trigger.kill());
      };
    },
    { scope: container, dependencies: [reducedMotion, text] },
  );

  return (
    <p
      ref={container}
      className={cn(
        "text-lg leading-relaxed sm:text-xl",
        // Reduced motion (and the pre-hydration paint) get fully readable text, never a
        // paragraph stuck at 45% opacity waiting for a scroll that may never come.
        reducedMotion ? "text-text-primary" : "text-text-secondary",
        className,
      )}
    >
      {/* One span per word so each can be brightened independently. The space is rendered
          *between* spans rather than inside them - a trailing space inside an `inline-block`
          collapses, which would run every word together. */}
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span data-word className="inline-block">
            {word}
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </p>
  );
}
