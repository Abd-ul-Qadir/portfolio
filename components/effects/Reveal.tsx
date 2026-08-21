"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ElementType, ReactNode } from "react";

import { useReducedMotion } from "@/lib/hooks";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  /** Rendered element. Use `li` inside a list, `article` for a card, and so on. */
  as?: ElementType;
  /** Seconds. Use the item's index for a stagger rather than hand-tuning each one. */
  delay?: number;
  /** How much of the element must be in view before it fires. */
  amount?: number;
}

/**
 * The one entrance reveal for the whole site: fade + translateY + a slight scale, fired
 * **once** per element as it enters the viewport (`once: true`, so it does not re-trigger
 * every time the scroll direction changes).
 *
 * Phase 11 replaced the ad hoc `whileInView` blocks that had accumulated in individual
 * sections with this, so the entrance rhythm is defined in one place. Anything genuinely
 * scroll-*scrubbed* (the timeline rail, the hero transform) is GSAP and does not belong here
 * — see `CLAUDE.md` §2.
 *
 * Under reduced motion this collapses to an opacity-only fade: no translate, no scale.
 */
export function Reveal({
  children,
  as = "div",
  delay = 0,
  amount = 0.25,
  ...rest
}: RevealProps) {
  const reducedMotion = useReducedMotion();
  const MotionTag = motion[as as "div"];

  return (
    <MotionTag
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount }}
      transition={{
        duration: reducedMotion ? 0.2 : 0.6,
        delay: reducedMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
