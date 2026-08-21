"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const SEQUENCE = "sudo hire-me";

/**
 * Type `sudo hire-me` anywhere on the page for a small on-brand reveal
 * (`DESIGN_SYSTEM.md`, Easter egg).
 *
 * A plain `keydown` buffer — no dependency, no key listener library. It is **not** gated
 * behind reduced motion: the spec is explicit that this is user-initiated and tiny, so
 * suppressing it would be the wrong call. It is also referenced nowhere in the UI.
 *
 * Two things it deliberately does not do:
 * - It ignores keystrokes while an input, textarea or contenteditable is focused, so typing
 *   the phrase into a form field can never trigger it.
 * - It matches on a rolling buffer rather than requiring the page to have focus from the
 *   first character, so it works however far into the page you are.
 */
export function EasterEgg() {
  // A ref, not state: the buffer is never rendered, and keeping it out of state avoids
  // re-rendering the whole component on every single keystroke the page receives.
  const buffer = useRef("");
  const [revealed, setRevealed] = useState(false);

  const dismiss = useCallback(() => setRevealed(false), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }

      if (event.key === "Escape") {
        setRevealed(false);
        return;
      }

      // Only single characters extend the buffer; modifiers and arrows are ignored.
      if (event.key.length !== 1) return;

      buffer.current = (buffer.current + event.key.toLowerCase()).slice(-SEQUENCE.length);
      if (buffer.current === SEQUENCE) {
        buffer.current = "";
        setRevealed(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {revealed ? (
        <motion.div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-loader -translate-x-1/2 rounded-card glass-surface px-6 py-4 shadow-glow-strong"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-mono text-sm text-accent-emerald">&gt; Access granted.</p>
          <p className="mt-1 font-mono text-sm text-text-primary">
            &gt; Let&apos;s build something amazing.
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="mt-3 font-mono text-xs uppercase tracking-label text-text-secondary transition-colors hover:text-text-primary"
          >
            Close
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
