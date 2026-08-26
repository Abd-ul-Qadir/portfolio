import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

/**
 * Violet -> indigo -> cyan gradient text, with a light passing through it.
 *
 * Short headline phrases only — `DESIGN_SYSTEM.md` rules it out for body copy, since the
 * cyan end of the ramp does not hold contrast at body sizes.
 *
 * `.text-gradient-scan` supersedes `.text-gradient-primary` here: it paints the same brand
 * gradient with a highlight layer stacked over it, so the accent words are periodically lit
 * by a pass of light. The gradient itself never moves, so the words keep the exact colour
 * identity the design system specifies, and under reduced motion the highlight parks off the
 * glyphs — leaving plain gradient text.
 */
export function GradientText({
  children,
  className,
  as: Tag = "span",
}: GradientTextProps) {
  return <Tag className={cn("text-gradient-scan", className)}>{children}</Tag>;
}
