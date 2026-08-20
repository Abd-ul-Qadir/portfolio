"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

import { usePointerEffectsEnabled } from "@/lib/hooks";
import { cn } from "@/lib/utils";

interface MagneticWrapperProps {
  children: ReactNode;
  className?: string;
  /** How far from the element's centre the pull starts, in pixels. */
  radius?: number;
  /** Maximum travel, in pixels. Deliberately small — this is a nudge, not a teleport. */
  maxTravel?: number;
}

/**
 * Translates the wrapped element a small, distance-weighted, clamped amount toward the
 * pointer while the pointer is inside its proximity radius (`DESIGN_SYSTEM.md`, Cursor).
 *
 * Built once and reused — Phase 5's hero CTAs and Phase 7's service cards both wrap their
 * content in this rather than hand-rolling the maths.
 *
 * The pull is decoration on top of a working control: it is never mounted for touch users or
 * under reduced motion, and it never intercepts pointer events, so the wrapped button/link
 * stays exactly as clickable and keyboard-operable either way.
 */
export function MagneticWrapper({
  children,
  className,
  radius = 120,
  maxTravel = 8,
}: MagneticWrapperProps) {
  const enabled = usePointerEffectsEnabled();
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 20, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 20, mass: 0.4 });

  useEffect(() => {
    if (!enabled) return;

    const onPointerMove = (event: PointerEvent) => {
      const element = ref.current;
      if (!element) return;

      const bounds = element.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const deltaX = event.clientX - centerX;
      const deltaY = event.clientY - centerY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance > radius) {
        x.set(0);
        y.set(0);
        return;
      }

      // Linear falloff: full strength at the centre, nothing at the edge of the radius.
      const strength = (1 - distance / radius) * maxTravel;
      // `distance` can be 0 when the pointer is exactly on centre — guard the divide.
      const unitX = distance === 0 ? 0 : deltaX / distance;
      const unitY = distance === 0 ? 0 : deltaY / distance;

      x.set(unitX * strength);
      y.set(unitY * strength);
    };

    const reset = () => {
      x.set(0);
      y.set(0);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", reset);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", reset);
      reset();
    };
  }, [enabled, maxTravel, radius, x, y]);

  if (!enabled) {
    return <div className={cn("inline-flex", className)}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      className={cn("inline-flex", className)}
    >
      {children}
    </motion.div>
  );
}
