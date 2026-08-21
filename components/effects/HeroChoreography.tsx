"use client";

import { useRef, type ReactNode } from "react";

import { gsap, useGSAP } from "@/lib/gsap";

interface HeroChoreographyProps {
  /** The hero's copy, CTAs and portrait. This is what transforms as you scroll. */
  children: ReactNode;
}

/**
 * The flagship Hero → About moment (`DESIGN_SYSTEM.md`, "Scroll-driven hero transform"), plus
 * the Hero → About half of the Phase 12 section-transition macro-layer.
 *
 * The hero pins, and its content is scrubbed **directly to scroll position** — starting large
 * and centred, then scaling down and translating into the top-left corner as About takes
 * visual focus. Built with GSAP ScrollTrigger, not Framer Motion's `useScroll`/`useTransform`:
 * `CLAUDE.md` §2 assigns anything pinned or scrubbed to GSAP, and Phase 11's acceptance
 * criteria call this out specifically. The Lenis↔ScrollTrigger wiring it depends on lives in
 * `lib/gsap.ts` and was verified in Phase 3.
 *
 * **Phase 12 note:** the travelling gradient blob is a second tween on **this same timeline**,
 * sharing its one ScrollTrigger — `PHASE_PLAN.md` is explicit that it must not be a second,
 * competing timeline. Add anything else that belongs to this boundary here too.
 *
 * **Gating is done with `gsap.matchMedia()`**, which both scopes the animation and reverts it
 * cleanly when a condition stops matching:
 * - `prefers-reduced-motion: reduce` → no pin, no scrub, no blob travel. The hero is a plain
 *   section and the page scrolls normally.
 * - Below 640px → also no pin. `CLAUDE.md` §4 names pinning as the most common source of
 *   jank on mobile Safari, and a fade-based fallback is an expected simplification. Logged in
 *   PROGRESS.md's decision log.
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
          // ONE timeline, ONE ScrollTrigger, driving both the hero transform and the blob.
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              // Pin for most of a viewport height: long enough for the transform to read,
              // short enough that a recruiter skimming to Projects isn't held hostage.
              end: "+=85%",
              pin: true,
              // `pinSpacing` keeps the following section from jumping up under the pin,
              // which is what causes the classic layout shift here.
              pinSpacing: true,
              scrub: true,
              // Recalculate against the real, post-font-load layout.
              invalidateOnRefresh: true,
            },
          });

          timeline.to(
            inner.current,
            {
              // `origin-top-left` on the element means scaling alone already draws the content
              // toward the hero's top-left corner. An extra negative `xPercent` on top of that
              // pushed it clean off the left edge — the copy must end up *in* the corner, not
              // outside the viewport. So: scale down, lift slightly, and fade.
              scale: 0.46,
              yPercent: -12,
              opacity: 0.18,
              ease: "none",
            },
            0,
          );

          // Phase 12, Hero → About: a soft gradient blob travels across the screen as the
          // hero gives way, carrying the eye from one section to the next.
          timeline.fromTo(
            blob.current,
            { xPercent: -30, yPercent: 10, opacity: 0 },
            { xPercent: 55, yPercent: -15, opacity: 1, ease: "none" },
            0,
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
      {/* Phase 12 travelling glow. Decorative, and it starts fully transparent so it is
          invisible unless the scrubbed timeline above is actually running — which means it
          simply never appears under reduced motion or on mobile. */}
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
