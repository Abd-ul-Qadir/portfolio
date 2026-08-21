"use client";

import { useLenis } from "lenis/react";
import { useEffect, useRef } from "react";

import { identity } from "@/content/data";
import { gsap, useGSAP } from "@/lib/gsap";

/** The four status lines from `DESIGN_SYSTEM.md`'s boot sequence. */
const STATUS_LINES = [
  "INITIALIZING SYSTEM...",
  "LOADING NEURAL INTERFACE...",
  "LOADING PROJECTS...",
  "READY.",
] as const;

const BAR_CELLS = 16;
const DURATION = 1.3;

interface LoaderProps {
  /** Called once the sequence has finished and the overlay has faded out. */
  onDone: () => void;
}

/**
 * The "AI system booting" overlay from `DESIGN_SYSTEM.md`, ~1.3s end to end.
 *
 * Built as a single **GSAP timeline** rather than with Framer Motion: this is one linear,
 * self-contained sequence where a progress number, a block-character bar and four staged
 * status lines all have to stay in lockstep, which is exactly what a timeline is for.
 * `PHASE_PLAN.md` Phase 4 explicitly allows either — the rule this does not break is that
 * nothing here is scroll-driven, so it is not the Framer/GSAP split from `CLAUDE.md` §2.
 *
 * **Performance note (Phase 14) — do not reintroduce `useState` here.** The first version
 * called `setProgress` from the timeline's `onUpdate`, i.e. ~78 React re-renders of this tree
 * during the single most contended moment of the page's life. Measured on Lighthouse's mobile
 * preset, the loader alone cost **17 performance points and ~570ms of total blocking time**.
 * The timeline now writes straight to DOM nodes through refs, which is invisible to React and
 * effectively free. Same sequence, same look.
 *
 * This component is never mounted under reduced motion (see `LoaderMount`) — the requirement
 * is that the loader is *skipped*, not merely faster.
 */
export default function Loader({ onDone }: LoaderProps) {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const barEmpty = useRef<HTMLSpanElement>(null);
  const percent = useRef<HTMLSpanElement>(null);
  const lines = useRef<Array<HTMLLIElement | null>>([]);
  const lenis = useLenis();

  // Hold the page still while the sequence plays.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [lenis]);

  useGSAP(
    () => {
      const counter = { value: 0 };

      const revealLine = (index: number) => () => {
        const line = lines.current[index];
        if (line) line.dataset.visible = "true";
      };

      const timeline = gsap.timeline({ onComplete: onDone });

      timeline
        .to(counter, {
          value: 100,
          duration: DURATION,
          ease: "power2.inOut",
          onUpdate: () => {
            const value = Math.round(counter.value);
            const filled = Math.round((value / 100) * BAR_CELLS);
            // Direct DOM writes — see the performance note above.
            if (bar.current) {
              bar.current.textContent = "█".repeat(filled);
            }
            // The unfilled remainder has to shrink as the filled part grows, or the bar
            // simply gets longer instead of filling up.
            if (barEmpty.current) {
              barEmpty.current.textContent = "░".repeat(BAR_CELLS - filled);
            }
            if (percent.current) {
              percent.current.textContent = `${value}%`;
            }
          },
        })
        // Status lines are staged against the same timeline, so they can never drift out of
        // step with the bar.
        .call(revealLine(0), undefined, 0)
        .call(revealLine(1), undefined, DURATION * 0.3)
        .call(revealLine(2), undefined, DURATION * 0.6)
        .call(revealLine(3), undefined, DURATION * 0.92)
        .to(root.current, { autoAlpha: 0, duration: 0.4, ease: "power2.out" }, ">");
    },
    { scope: root, dependencies: [onDone] },
  );

  return (
    <div
      ref={root}
      // Announced as a status region so a screen reader that is present during the sequence
      // is told what is happening rather than hearing a silent 1.3s gap.
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-loader flex flex-col items-center justify-center gap-6 bg-bg-base"
    >
      <p className="font-mono text-4xl font-semibold tracking-mark text-text-primary">
        {identity.initials}
      </p>
      <p className="font-mono text-eyebrow uppercase text-text-secondary">
        {identity.roles[0]}
      </p>

      {/* The bar and percentage change ~60 times a second, so they are `aria-hidden`: the
          status lines below carry the same information at a pace a screen reader can use. */}
      <p className="mt-4 font-mono text-sm text-accent-violet-text" aria-hidden>
        <span ref={bar} />
        <span ref={barEmpty} className="text-text-secondary">
          {"░".repeat(BAR_CELLS)}
        </span>
        <span ref={percent} className="ml-3 text-text-primary">
          0%
        </span>
      </p>

      {/* All four lines are rendered up front and revealed via `data-visible`, so staging them
          costs a style recalculation rather than a React render. */}
      <ul className="mt-2 flex min-h-24 flex-col gap-1 text-center">
        {STATUS_LINES.map((line, index) => (
          <li
            key={line}
            ref={(node) => {
              lines.current[index] = node;
            }}
            data-visible="false"
            className={
              index === STATUS_LINES.length - 1
                ? "loader-line font-mono text-xs text-accent-emerald"
                : "loader-line font-mono text-xs text-text-secondary"
            }
          >
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
