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
 * **The Hero → About boundary is no longer carried by a travelling gradient blob.** That blob
 * — a 26rem violet circle that crossed the screen on this timeline — was removed at Abdul's
 * request: it read as a generic glowing ball rather than as anything to do with the portfolio,
 * and it was the only thing making this boundary feel like an event. The continuity now comes
 * from the site-wide neural field, which morphs its whole topology continuously across every
 * section (see `lib/neural-field.ts`, "The scroll story"). If you add something else to this
 * boundary, add it to this timeline rather than creating a second one.
 *
 * **Gating is done with `gsap.matchMedia()`**, which both scopes the animation and reverts it
 * cleanly when a condition stops matching:
 * - `prefers-reduced-motion: reduce` → no pin, no scrub. The hero is a plain section and the
 *   page scrolls normally.
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

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        "(min-width: 640px) and (prefers-reduced-motion: no-preference)",
        () => {
          // One timeline, one ScrollTrigger, owning the hero transform.
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
      <div ref={inner} className="relative w-full origin-top-left will-change-transform">
        {children}
      </div>
    </section>
  );
}
