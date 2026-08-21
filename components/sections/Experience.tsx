"use client";

import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { timeline } from "@/content/data";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * The animated timeline from `DESIGN_SYSTEM.md`.
 *
 * Two separate mechanisms, deliberately:
 *
 * 1. **The line grows with scroll** — GSAP ScrollTrigger with `scrub: true`, so scrolling back
 *    up retracts it. A fixed-duration draw would fail this phase's acceptance criterion, which
 *    is also why this is GSAP and not Framer Motion (`CLAUDE.md` §2).
 * 2. **The active node glows** — an IntersectionObserver over a band in the middle of the
 *    viewport, which is about "what am I reading", not about scroll progress.
 *
 * Work and education render in the *same* list (that is the Phase 8 decision), separated only
 * by a type badge. The markup is a real `<ol>` so a screen reader announces it as an ordered
 * list of N items rather than a pile of headings.
 */
export function Experience() {
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string>(timeline[0]?.id ?? "");
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;
      if (!line.current || !root.current) return;

      gsap.fromTo(
        line.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 70%",
            end: "bottom 70%",
            scrub: true,
          },
        },
      );

      return () => {
        ScrollTrigger.getAll()
          .filter((trigger) => trigger.trigger === root.current)
          .forEach((trigger) => trigger.kill());
      };
    },
    { scope: root, dependencies: [reducedMotion] },
  );

  useEffect(() => {
    const items = root.current?.querySelectorAll<HTMLElement>("[data-entry]");
    if (!items || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = visible?.target.getAttribute("data-entry");
        if (id) setActiveId(id);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="relative overflow-hidden py-section"
    >

      <Container className="relative">
        <SectionHeading id="experience-heading" eyebrow="Career" accent="education">
          Experience &
        </SectionHeading>

        <div ref={root} className="relative mt-16">
          {/* The unfilled track, and the violet line that grows over it. */}
          <div
            aria-hidden
            className="timeline-rail bg-border-subtle"
          />
          <div
            ref={line}
            aria-hidden
            data-timeline-line
            className={cn(
              "timeline-rail origin-top bg-primary",
              // Reduced motion: fully drawn from the start, never a bar waiting for a scroll.
              reducedMotion && "scale-y-100",
            )}
          />

          <ol className="flex flex-col gap-12">
            {timeline.map((entry) => {
              const isActive = activeId === entry.id;
              const isEducation = entry.kind === "education";

              return (
                <li
                  key={entry.id}
                  data-entry={entry.id}
                  className="relative pl-10 sm:pl-14"
                >
                  <span
                    aria-hidden
                    data-node
                    data-active={isActive}
                    className={cn(
                      "absolute left-0 top-1.5 flex h-4 w-4 items-center justify-center rounded-pill border transition-all duration-500 ease-smooth sm:h-6 sm:w-6",
                      isActive
                        ? "border-accent-violet bg-bg-surface shadow-glow"
                        : "border-border-subtle bg-bg-base",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-pill transition-colors duration-500",
                        isActive ? "bg-accent-violet" : "bg-text-secondary",
                      )}
                    />
                  </span>

                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-mono text-eyebrow uppercase text-accent-violet-text">
                      {entry.period}
                    </p>
                    <Badge tone={isEducation ? "accent" : "neutral"}>
                      {isEducation ? "Education" : "Work"}
                    </Badge>
                    {entry.arrangement ? <Badge>{entry.arrangement}</Badge> : null}
                  </div>

                  <h3 className="mt-3 text-xl font-semibold text-text-primary sm:text-2xl">
                    {entry.title}
                  </h3>
                  <p className="mt-1 text-text-secondary">{entry.organization}</p>

                  {entry.bullets.length > 0 ? (
                    <ul className="mt-4 flex flex-col gap-3">
                      {entry.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="text-sm leading-relaxed text-text-secondary"
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
