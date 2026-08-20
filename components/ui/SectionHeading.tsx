import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { GradientText } from "@/components/ui/GradientText";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** Mono eyebrow above the heading, e.g. `WHAT I DO`. */
  eyebrow?: string;
  children: ReactNode;
  /** Trailing words rendered in the primary gradient — headline phrases only. */
  accent?: ReactNode;
  description?: ReactNode;
  /** Wired to the section's `aria-labelledby`. */
  id?: string;
  className?: string;
  /** Small sparkle accent beside the eyebrow — used sparingly (`DESIGN_SYSTEM.md` #14). */
  sparkle?: boolean;
}

/**
 * The one heading block every section uses, so the eyebrow/heading/description rhythm and
 * the diffused violet glow behind the heading stay identical site-wide.
 */
export function SectionHeading({
  eyebrow,
  children,
  accent,
  description,
  id,
  className,
  sparkle = false,
}: SectionHeadingProps) {
  return (
    <div className={cn("relative max-w-3xl", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-24 h-56 w-56 rounded-pill bg-accent-violet opacity-[0.12] blur-3xl"
      />
      {eyebrow ? (
        <p className="relative flex items-center gap-2 font-mono text-eyebrow uppercase text-accent-violet">
          {sparkle ? <Sparkles aria-hidden className="h-3.5 w-3.5" /> : null}
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className="relative mt-4 text-heading font-semibold text-text-primary"
      >
        {children}
        {accent ? (
          <>
            {" "}
            <GradientText>{accent}</GradientText>
          </>
        ) : null}
      </h2>
      {description ? (
        <p className="relative mt-5 text-base leading-relaxed text-text-secondary sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
