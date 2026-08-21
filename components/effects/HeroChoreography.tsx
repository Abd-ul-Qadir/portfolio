"use client";

import { useRef, type ReactNode } from "react";

import { gsap, useGSAP } from "@/lib/gsap";

interface HeroChoreographyProps {
  /** The hero's copy, CTAs and portrait. This is what transforms as you scroll. */
  children: ReactNode;
}

/**
 * Layout offset of `el` within `ancestor`, summed up the `offsetParent` chain.
 *
 * Deliberately not `getBoundingClientRect()`: that reflects the element's *current* transform,
 * so reading it while the tween is mid-flight makes the target chase the thing being animated.
 * `offsetLeft`/`offsetTop` are pure layout and ignore transforms entirely.
 */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let left = 0;
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { left, top };
}

/** Where the portrait parks, in pixels from the pinned section's top-left. Clears the navbar. */
const CORNER = { x: 28, y: 96 };
/** How small the hero block is once it reaches the corner. */
const CORNER_SCALE = 0.3;

/**
 * The flagship Hero → About moment (`DESIGN_SYSTEM.md`, "Scroll-driven hero transform"), plus
 * the Hero → About half of the Phase 12 section-transition macro-layer.
 *
 * The hero pins and everything below is scrubbed **directly to scroll position**, on ONE
 * timeline sharing ONE ScrollTrigger (`PHASE_PLAN.md` forbids a second, competing timeline for
 * this boundary). The choreography, in order:
 *
 * 1. **The portrait travels into the top-left corner**, shrinking as it goes. It is measured
 *    with `offsetLeft`/`offsetTop` rather than `getBoundingClientRect()`, because the rect
 *    already includes whatever transform the tween has applied — reading it mid-flight makes
 *    the target chase itself. Values are function-based and paired with `invalidateOnRefresh`,
 *    so a resize recomputes the corner instead of animating to a stale one.
 * 2. **The copy fades out** and drifts up. It no longer scales into the corner: the portrait
 *    now owns that spot, and sending both there stacked them on top of each other.
 * 3. **The neon ball makes a round trip** — out to the right across the first half of the
 *    scrub, then back to where it started across the second. Two tweens on the same timeline
 *    at positions 0 and 0.5.
 *
 * Built with GSAP ScrollTrigger, not Framer Motion's `useScroll`/`useTransform`: `CLAUDE.md`
 * §2 assigns anything pinned or scrubbed to GSAP. The Lenis↔ScrollTrigger wiring it depends on
 * lives in `lib/gsap.ts`.
 *
 * **Gating is `gsap.matchMedia()`**, which scopes the animation and reverts it cleanly when a
 * condition stops matching:
 * - `prefers-reduced-motion: reduce` → no pin, no scrub, no corner travel, no ball.
 * - Below 640px → also no pin. `CLAUDE.md` §4 names pinning as the most common source of jank
 *   on mobile Safari. Logged in PROGRESS.md's decision log.
 *
 * This component exists so `Hero` itself can stay a Server Component: the hero copy is the
 * page's LCP element and is passed in as `children`, already server-rendered.
 */
export function HeroChoreography({ children }: HeroChoreographyProps) {
  const root = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const blob = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        "(min-width: 640px) and (prefers-reduced-motion: no-preference)",
        () => {
          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              // Long enough for a three-beat sequence to read, short enough that a recruiter
              // skimming to Projects isn't held hostage.
              end: "+=100%",
              pin: true,
              // `pinSpacing` keeps the following section from jumping up under the pin,
              // which is what causes the classic layout shift here.
              pinSpacing: true,
              scrub: true,
              invalidateOnRefresh: true,
              // Pinned triggers must refresh FIRST. Anything below the pin computes its
              // start/end against document positions that only exist once the pin spacer
              // does; without this, About's entrance was completing while it was still far
              // below the fold, so it had already finished by the time you could see it.
              refreshPriority: 1,
            },
          });

          // 1. The WHOLE hero block — copy and portrait together — shrinks into the
          //    top-left corner. Moving them separately made them stack on the same spot;
          //    they travel as one unit.
          if (inner.current) {
            const el = inner.current;
            gsap.set(el, { transformOrigin: "top left" });
            timeline.to(
              el,
              {
                x: () => CORNER.x - offsetWithin(el, root.current!).left,
                y: () => CORNER.y - offsetWithin(el, root.current!).top,
                scale: CORNER_SCALE,
                opacity: 0.35,
                duration: 0.5,
              },
              0,
            );
          }

          // 2. The neon ball travels out to the right while the hero shrinks away...
          timeline.fromTo(
            blob.current,
            { xPercent: -30, yPercent: 10, opacity: 0 },
            { xPercent: 120, yPercent: -10, opacity: 0.85, duration: 0.5 },
            0,
          );

          // 3. ...then returns to where it started. About follows it in — see
          //    `SectionTransitions`, which times About's arrival to this return leg.
          timeline.to(
            blob.current,
            { xPercent: -30, yPercent: 10, opacity: 0.5, duration: 0.5 },
            0.5,
          );

          return () => {
            timeline.kill();
          };
        },
      );

      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      {/* The travelling glow. Decorative, and it starts fully transparent, so it simply never
          appears under reduced motion or on mobile where the timeline is not created. */}
      <div
        ref={blob}
        aria-hidden
        data-hero-blob
        className="transition-blob pointer-events-none absolute left-1/4 top-1/3 bg-accent-violet opacity-0"
      />

      <div ref={inner} className="relative w-full origin-top-left will-change-transform">
        {children}
      </div>
    </section>
  );
}
