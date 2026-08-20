"use client";

import { useEffect, useState } from "react";

import { useReducedMotion } from "@/lib/hooks";

interface TypewriterProps {
  /** Cycled in order, looping. Index 0 is what reduced-motion users see, statically. */
  phrases: readonly string[];
  className?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  /** How long a fully-typed phrase is held before it starts deleting. */
  holdMs?: number;
}

/**
 * Types a phrase out, holds it, deletes it, moves to the next, forever.
 *
 * A small self-contained hook rather than GSAP: this is a looping UI-state effect with no
 * relationship to scroll position (`PHASE_PLAN.md` Phase 5).
 *
 * Under `prefers-reduced-motion` it renders the first phrase as plain static text — no
 * typing, no deleting, no blinking caret, and no timers running at all.
 *
 * The live text is `aria-hidden` and a stable, complete label is exposed to screen readers
 * instead, so assistive tech is not read a character-by-character stream.
 */
export function Typewriter({
  phrases,
  className,
  typeSpeed = 55,
  deleteSpeed = 30,
  holdMs = 1600,
}: TypewriterProps) {
  const reducedMotion = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reducedMotion || phrases.length === 0) return;

    const phrase = phrases[phraseIndex % phrases.length];
    const atEnd = !deleting && text === phrase;
    const atStart = deleting && text === "";

    const delay = atEnd ? holdMs : atStart ? 200 : deleting ? deleteSpeed : typeSpeed;

    // Every state change happens inside the timer, never synchronously in the effect body —
    // otherwise each keystroke would cascade an extra render.
    const timer = window.setTimeout(() => {
      if (atEnd) {
        setDeleting(true);
        return;
      }
      if (atStart) {
        setDeleting(false);
        setPhraseIndex((index) => (index + 1) % phrases.length);
        return;
      }
      setText((current) =>
        deleting ? phrase.slice(0, current.length - 1) : phrase.slice(0, current.length + 1),
      );
    }, delay);

    return () => window.clearTimeout(timer);
  }, [deleting, deleteSpeed, holdMs, phraseIndex, phrases, reducedMotion, text, typeSpeed]);

  if (reducedMotion) {
    return <span className={className}>{phrases[0]}</span>;
  }

  return (
    <span className={className}>
      <span aria-hidden>{text}</span>
      <span aria-hidden className="ml-0.5 inline-block animate-caret-blink text-accent-violet">
        _
      </span>
      {/* One stable, complete label for assistive tech instead of a character stream. */}
      <span className="sr-only">{phrases.join(", ")}</span>
    </span>
  );
}
