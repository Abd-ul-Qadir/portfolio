import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "accent" | "positive";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  tone?: BadgeTone;
}

const toneStyles: Record<BadgeTone, string> = {
  neutral: "border-border-subtle text-text-secondary",
  accent: "border-border-hover text-accent-violet",
  positive: "border-border-subtle text-accent-emerald",
};

/** Tech pills, role tags, timeline type badges — mono, thin-bordered, never filled. */
export function Badge({ children, className, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill border bg-bg-glass px-3 py-1 font-mono text-xs tracking-wide",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
