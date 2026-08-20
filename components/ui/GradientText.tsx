import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

/**
 * Violet -> indigo -> cyan gradient text.
 *
 * Short headline phrases only — `DESIGN_SYSTEM.md` rules it out for body copy, since the
 * cyan end of the ramp does not hold contrast at body sizes.
 */
export function GradientText({
  children,
  className,
  as: Tag = "span",
}: GradientTextProps) {
  return <Tag className={cn("text-gradient-primary", className)}>{children}</Tag>;
}
