"use client";

import { useLayoutEffect, useRef } from "react";

import { identity } from "@/content/data";
import { gsap } from "@/lib/gsap";

/** The four status lines from `DESIGN_SYSTEM.md`'s boot sequence. */
const STATUS_LINES = [
  "INITIALIZING SYSTEM...",
  "LOADING NEURAL INTERFACE...",
  "LOADING PROJECTS...",
  "READY.",
] as const;

const BAR_CELLS = 16;
const MIN_VISIBLE_MS = 450;
const PROGRESS_CEILING_SECONDS = 6;
const COMPLETE_HOLD_MS = 180;
const STATUS_THRESHOLDS = [0, 30, 60, 99] as const;

interface LoaderProps {
  /** False only for the hydration-safe shell used on skipped visits. */
  active: boolean;
  /** Called once the sequence has finished and the overlay has faded out. */
  onDone: () => void;
}

function waitForWindowLoad(signal: AbortSignal) {
  if (document.readyState === "complete") return Promise.resolve();

  return new Promise<void>((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true, signal });
  });
}

function waitForTwoPaints() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}

/**
 * The "AI system booting" overlay from `DESIGN_SYSTEM.md`.
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
 * The progress tween approaches 92% while the browser is loading, then reaches 100% only
 * after the window load event, fonts, and two paint frames are ready. Fast connections clear
 * quickly; slow ones hold naturally instead of finishing on a fictional fixed timer.
 */
export default function Loader({ active, onDone }: LoaderProps) {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const barEmpty = useRef<HTMLSpanElement>(null);
  const percent = useRef<HTMLSpanElement>(null);
  const lines = useRef<Array<HTMLLIElement | null>>([]);
  useLayoutEffect(() => {
    const loaderWindow = window as typeof window & {
      __aqLoaderBootTimer?: number;
      __aqLoaderDecision?: "show" | "skip";
      __aqLoaderProgress?: number;
    };
    if (!active || loaderWindow.__aqLoaderDecision !== "show") return;

    const controller = new AbortController();
    if (loaderWindow.__aqLoaderBootTimer !== undefined) {
      window.clearInterval(loaderWindow.__aqLoaderBootTimer);
      delete loaderWindow.__aqLoaderBootTimer;
    }

    const initialProgress =
      (loaderWindow.__aqLoaderProgress ??
        Number.parseInt(percent.current?.textContent ?? "0", 10)) ||
      0;
    const counter = { value: initialProgress };
    let released = false;
    let finishTween: gsap.core.Tween | undefined;
    let fadeTween: gsap.core.Tween | undefined;

    const renderProgress = () => {
      const value = Math.round(counter.value);
      loaderWindow.__aqLoaderProgress = value;
      const filled = Math.round((value / 100) * BAR_CELLS);

      // Direct DOM writes — see the performance note above.
      if (bar.current) bar.current.textContent = "█".repeat(filled);
      if (barEmpty.current) {
        barEmpty.current.textContent = "░".repeat(BAR_CELLS - filled);
      }
      if (percent.current) percent.current.textContent = `${value}%`;

      lines.current.forEach((line, index) => {
        if (line) {
          line.dataset.visible = String(value >= STATUS_THRESHOLDS[index]);
        }
      });
    };

    const release = () => {
      if (released) return;
      released = true;
      onDone();
    };

    renderProgress();

    // Ease toward a ceiling while the page is genuinely loading. It may pause there on a
    // slow connection; 100% is reserved for the browser-ready signal below.
    const loadingTween = gsap.to(counter, {
      value: 92,
      duration: PROGRESS_CEILING_SECONDS,
      ease: "power2.out",
      onUpdate: renderProgress,
    });

    const finishWhenReady = async () => {
      await Promise.all([
        waitForWindowLoad(controller.signal),
        document.fonts.ready.catch(() => undefined),
      ]);
      await waitForTwoPaints();

      const startedAt =
        performance.getEntriesByName("aq-loader-start", "mark").at(-1)?.startTime ??
        performance.now();
      const remainingMinimum = Math.max(
        0,
        MIN_VISIBLE_MS - (performance.now() - startedAt),
      );

      if (remainingMinimum > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingMinimum));
      }
      if (controller.signal.aborted) return;

      loadingTween.kill();
      finishTween = gsap.to(counter, {
        value: 100,
        duration: 0.5,
        ease: "power2.inOut",
        onUpdate: renderProgress,
        onComplete: () => {
          window.setTimeout(() => {
            if (controller.signal.aborted) return;
            fadeTween = gsap.to(root.current, {
              autoAlpha: 0,
              duration: 0.32,
              ease: "power2.out",
              onComplete: release,
            });
          }, COMPLETE_HOLD_MS);
        },
      });
    };

    const handleSafetyRelease = () => release();
    window.addEventListener("aq:loader-decision", handleSafetyRelease);
    void finishWhenReady();

    return () => {
      controller.abort();
      window.removeEventListener("aq:loader-decision", handleSafetyRelease);
      loadingTween.kill();
      finishTween?.kill();
      fadeTween?.kill();
    };
  }, [active, onDone]);

  return (
    <div
      ref={root}
      // Announced as a status region so a screen reader present during loading is told what
      // is happening rather than hearing a silent gap.
      role="status"
      aria-live="polite"
      className="loader-shell fixed inset-0 z-loader flex-col items-center justify-center gap-6 bg-bg-base"
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
        <span ref={bar} data-loader-bar />
        <span
          ref={barEmpty}
          data-loader-bar-empty
          className="text-text-secondary"
        >
          {"░".repeat(BAR_CELLS)}
        </span>
        <span
          ref={percent}
          data-loader-percent
          className="ml-3 text-text-primary"
        >
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
            data-loader-line
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
