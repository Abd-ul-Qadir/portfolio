"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

import { usePointerEffectsEnabled } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/** Elements that count as hoverable even without an explicit `data-cursor-label`. */
const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, summary, [data-cursor-label]';

/**
 * The dual-layer contextual cursor from `DESIGN_SYSTEM.md`.
 *
 * - **Outer:** a large translucent circle that springs/lags toward the pointer.
 * - **Inner:** a small dot that tracks it almost immediately.
 *
 * Over an interactive element the outer circle expands, its border shifts to the accent
 * colour, and the element's own `data-cursor-label` (`VIEW` / `OPEN` / `EXPLORE`) appears
 * inside it — each element controls its own label.
 *
 * **The cursor has a fixed appearance — it does not blend.**
 *
 * It used to composite with `mix-blend-mode: difference`, which derives its colour from
 * whatever happens to be underneath. Over the page that meant differencing against the neural
 * field's cyan processing core, which is what produced the familiar white ring with a warm dot.
 * Over the hero portrait the image *occludes* that core, so the same cursor differenced against
 * bright chrome instead and its dot went dark and all but disappeared — the cursor changed
 * identity depending on what it was passing over. Abdul reported it twice.
 *
 * Explicit colours instead: the ring and dot now look the same everywhere, and the dark halo
 * behind them is what keeps them legible on a bright image, which is the job the blend used to
 * do. This is a deliberate deviation from `DESIGN_SYSTEM.md`'s `mix-blend-mode` line — see
 * PROGRESS.md's decision log.
 *
 * This component assumes it is only ever mounted when pointer effects are wanted (see
 * `CursorMount`), but it re-checks anyway and renders nothing otherwise, so it can never be
 * the reason a touch or reduced-motion user sees a stray cursor.
 */
export default function Cursor() {
  const enabled = usePointerEffectsEnabled();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const outerX = useSpring(x, { stiffness: 220, damping: 26, mass: 0.6 });
  const outerY = useSpring(y, { stiffness: 220, damping: 26, mass: 0.6 });

  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const onPointerMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };

    const onPointerOver = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const interactive = target.closest(INTERACTIVE_SELECTOR);
      setHovering(Boolean(interactive));
      setLabel(
        interactive instanceof HTMLElement
          ? (interactive.dataset.cursorLabel ?? null)
          : null,
      );
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="cursor-layer pointer-events-none fixed inset-0 z-cursor">
      {/* Outer: springs and lags behind the pointer. */}
      <motion.div
        className={cn(
          "cursor-ring absolute left-0 top-0 flex items-center justify-center rounded-pill border",
          hovering
            ? "h-16 w-16 border-accent-violet bg-cursor-fill"
            : "h-9 w-9 border-text-primary",
        )}
        style={{
          x: outerX,
          y: outerY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: visible ? 1 : 0,
        }}
      >
        <AnimatePresence>
          {hovering && label ? (
            <motion.span
              key={label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="font-mono text-cursor uppercase text-text-primary"
            >
              {label}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.div>

      {/* The AI processing core.
          Tracks the raw pointer, not the spring, because it is the point of contact rather
          than the trailing ring — and because the neural field's tendrils and glow are drawn
          at the raw coordinate too, so anything else would separate them.

          **It lives here rather than on the canvas.** The field is the site background at
          `-z-20`, so a core drawn there is occluded by every card and every image — Abdul
          reported it missing over exactly those. As DOM on the cursor layer it is visible over
          anything, which is the only correct behaviour for something attached to the pointer. */}
      <motion.div
        className="cursor-core"
        style={{ x, y, translateX: "-50%", translateY: "-50%", opacity: visible ? 1 : 0 }}
      >
        <span className="cursor-core-halo" />
        <span className="cursor-core-ring" />
        <span className="cursor-core-arc" />
        <span className="cursor-core-arc-inner" />
      </motion.div>

      {/* Inner: tracks the pointer with no spring. */}
      <motion.div
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-pill bg-cursor-dot"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
          opacity: visible && !hovering ? 1 : 0,
        }}
      />
    </div>
  );
}
