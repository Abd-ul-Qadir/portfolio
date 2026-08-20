import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /**
   * Adds hover/focus affordances: violet border, ambient glow, slight lift.
   * `:focus-visible` gets the same static treatment as hover, because the Phase 7 tilt and
   * cursor-spotlight have no keyboard analog (`DESIGN_SYSTEM.md`, Services).
   */
  interactive?: boolean;
}

/**
 * The glass surface used for cards and panels. Phase 7 layers the 3D tilt and cursor
 * spotlight on top of this in a client component — the base stays server-renderable.
 */
export function GlassCard({
  children,
  className,
  as: Tag = "div",
  interactive = false,
}: GlassCardProps) {
  return (
    <Tag
      className={cn(
        "glass-surface rounded-card text-left shadow-elevated",
        interactive &&
          "transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-border-hover hover:shadow-glow focus-visible:-translate-y-0.5 focus-visible:border-border-hover focus-visible:shadow-glow",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
