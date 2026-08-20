"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

import { usePointerEffectsEnabled } from "@/lib/hooks";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /**
   * Maximum tilt in degrees. `DESIGN_SYSTEM.md` sets **3–6° as a cap, not a target** — do not
   * raise this past 6 without re-reading that section.
   */
  maxTilt?: number;
}

/**
 * Mouse-following 3D tilt plus a soft glow that tracks the cursor inside the card.
 *
 * Contents can opt into the parallax by carrying `data-depth="near"` (icons) or
 * `data-depth="far"` (text) — they are translated on the Z axis so they shift at slightly
 * different rates as the card tilts.
 *
 * Both effects are pointer-only and are not mounted for touch or reduced-motion users; the
 * card then renders as a plain wrapper. Keyboard users get no tilt and no spotlight, which is
 * exactly why `GlassCard`'s `interactive` prop gives `:focus-visible` its own static
 * glow/border — see `PHASE_PLAN.md` Phase 7's acceptance criteria.
 */
export function TiltCard({ children, className, maxTilt = 5 }: TiltCardProps) {
  const enabled = usePointerEffectsEnabled();
  const ref = useRef<HTMLDivElement>(null);

  // -0.5 .. 0.5, relative to the card's centre.
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const springConfig = { stiffness: 200, damping: 20, mass: 0.3 };
  const rotateX = useSpring(
    useTransform(py, [-0.5, 0.5], [maxTilt, -maxTilt]),
    springConfig,
  );
  const rotateY = useSpring(
    useTransform(px, [-0.5, 0.5], [-maxTilt, maxTilt]),
    springConfig,
  );

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    px.set(x - 0.5);
    py.set(y - 0.5);
    // The spotlight follows the pointer in the card's own coordinate space.
    element.style.setProperty("--spot-x", `${x * 100}%`);
    element.style.setProperty("--spot-y", `${y * 100}%`);
  };

  const handlePointerLeave = () => {
    px.set(0);
    py.set(0);
  };

  if (!enabled) {
    return <div className={cn("h-full", className)}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={cn("card-tilt h-full", className)}
    >
      {children}
    </motion.div>
  );
}
