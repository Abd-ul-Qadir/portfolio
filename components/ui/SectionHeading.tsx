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
 * The one heading block every section uses, so the eyebrow/heading/description rhythm stays
 * identical site-wide. Its rail and signal line are static CSS decoration: the heading gains a
 * stronger system identity without creating six new animation loops or another client boundary.
 *
 * **No glow behind the heading.** This used to render a 224px violet blur here, which is why a
 * soft violet ball sat behind *every* section — the bento grid, Projects, Contact — and it is
 * what Abdul was pointing at when he asked for the neon balls removed. `DESIGN_SYSTEM.md` #11
 * asks for a diffused glow behind headings; the neural field now supplies far more ambient
 * light than that item was ever meant to provide, so stacking a blurred disc on top of it only
 * muddied the background. Logged in PROGRESS.md's decision log.
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
    <div data-scroll-reveal className={cn("section-heading max-w-3xl", className)}>
      {eyebrow ? (
        <p className="section-heading-kicker font-mono text-eyebrow uppercase text-accent-violet-text">
          {/* A live status node in front of every section label, so each heading reads as a
              panel on a running system rather than a title. Pure CSS, two pseudo-elements —
              see `.status-node` — which is what keeps this a server component. */}
          <span aria-hidden className="status-node" />
          {sparkle ? <Sparkles aria-hidden className="h-3.5 w-3.5" /> : null}
          <span>{eyebrow}</span>
          <span aria-hidden className="section-heading-rule" />
        </p>
      ) : null}
      <h2
        id={id}
        className="section-heading-title mt-4 text-heading font-semibold text-text-primary"
      >
        {children}
        {accent ? (
          <>
            {" "}
            <GradientText className="section-heading-accent">{accent}</GradientText>
          </>
        ) : null}
      </h2>
      {description ? (
        <p className="section-heading-description mt-5 text-base leading-relaxed text-text-secondary sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
