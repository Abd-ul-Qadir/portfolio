"use client";

import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";

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
 * This component is never mounted under reduced motion (see `LoaderMount`) — the requirement
 * is that the loader is *skipped*, not merely faster.
 */
export default function Loader({ onDone }: LoaderProps) {
  const root = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
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

      const timeline = gsap.timeline({
        onComplete: onDone,
      });

      timeline
        .to(counter, {
          value: 100,
          duration: DURATION,
          ease: "power2.inOut",
          onUpdate: () => setProgress(Math.round(counter.value)),
        })
        // Status lines are staged against the same timeline, so they can never drift out of
        // step with the bar.
        .call(() => setVisibleLines(1), undefined, 0)
        .call(() => setVisibleLines(2), undefined, DURATION * 0.3)
        .call(() => setVisibleLines(3), undefined, DURATION * 0.6)
        .call(() => setVisibleLines(4), undefined, DURATION * 0.92)
        .to(root.current, { autoAlpha: 0, duration: 0.4, ease: "power2.out" }, ">");
    },
    { scope: root, dependencies: [onDone] },
  );

  const filled = Math.round((progress / 100) * BAR_CELLS);

  return (
    <div
      ref={root}
      // Announced as a status region so a screen reader that is present during the sequence
      // is told what is happening rather than hearing a silent 1.3s gap.
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-loader flex flex-col items-center justify-center gap-6 bg-bg-base"
    >
      <p className="font-mono text-4xl font-semibold tracking-[0.2em] text-text-primary">
        {identity.initials}
      </p>
      <p className="font-mono text-eyebrow uppercase text-text-secondary">
        {identity.roles[0]}
      </p>

      <p className="mt-4 font-mono text-sm text-accent-violet" aria-hidden>
        {"█".repeat(filled)}
        <span className="text-text-secondary">{"░".repeat(BAR_CELLS - filled)}</span>
        <span className="ml-3 text-text-primary">{progress}%</span>
      </p>

      <ul className="mt-2 flex min-h-24 flex-col gap-1 text-center">
        {STATUS_LINES.slice(0, visibleLines).map((line, index) => (
          <li
            key={line}
            className={
              index === STATUS_LINES.length - 1
                ? "font-mono text-xs text-accent-emerald"
                : "font-mono text-xs text-text-secondary"
            }
          >
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
