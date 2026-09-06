"use client";

import { Download } from "lucide-react";

import { MagneticWrapper } from "@/components/effects/MagneticWrapper";
import { Button } from "@/components/ui/Button";
import { identity } from "@/content/data";
import { cn } from "@/lib/utils";

/**
 * The résumé download button, used by the navbar in both its desktop bar and its mobile menu.
 *
 * **It is built out of the site's own vocabulary rather than as a new effect.** The border
 * charge is the same `.circuit-card` / `.circuit-trace` pair every service and credential card
 * already uses, so the one persistently-visible call to action reads as part of the running
 * system instead of as a bolted-on CTA. The whole thing costs nothing at rest: the trace is
 * authored `opacity: 0` and `animation-play-state: paused`, and only the parent's
 * `:hover` / `:focus-visible` starts it.
 *
 * **No `target="_blank"` and no `download` attribute, both deliberate.** The Drive URL responds
 * with `Content-Disposition: attachment`, so the browser downloads the file *without*
 * navigating away — a new tab would just leave a blank one behind. And `download` is ignored by
 * every browser on a cross-origin URL, so adding it would only imply a guarantee it cannot
 * make. See the note on `identity.resumeDownloadUrl`.
 *
 * Renders nothing when the link is absent, which keeps `PHASE_PLAN.md` Phase 9's rule —
 * a missing link is a missing control, never a dead click.
 */
export function ResumeButton({
  className,
  fullWidth = false,
  onNavigate,
}: {
  className?: string;
  /** The mobile menu wants it to fill the row; the desktop bar does not. */
  fullWidth?: boolean;
  /** Lets the mobile menu close itself when the download starts. */
  onNavigate?: () => void;
}) {
  const href = identity.resumeDownloadUrl;
  if (!href) return null;

  const button = (
    <Button
      href={href}
      /**
       * `Button` opens absolute URLs in a new tab by default. Suppressed here for the reason
       * in the block comment above: this URL is a download, not a page.
       */
      external={false}
      variant="secondary"
      size="sm"
      cursorLabel="DOWNLOAD"
      className={cn("circuit-card", fullWidth && "w-full", className)}
      onClick={onNavigate}
    >
      {/*
        The icon drops a hair on hover — the gesture the button describes, in miniature. A
        transition rather than a looping keyframe, so it only ever moves in response to the
        user (`DESIGN_SYSTEM.md`: animation reacts, it does not run in the background).

        The shift is gated with `motion-safe:` rather than switched off with
        `motion-reduce:transform-none`. That is not a style preference: `group-*` variants
        compile to two class selectors, so a one-class `motion-reduce:` override *loses the
        cascade to them* and the icon still jumped 2px under reduced motion. `motion-safe:`
        stops the rule from existing there at all, which no specificity can defeat.
      */}
      <Download
        aria-hidden
        className="h-3.5 w-3.5 transition-transform duration-300 ease-smooth motion-safe:group-hover:translate-y-0.5 motion-safe:group-focus-visible:translate-y-0.5 motion-reduce:transition-none"
      />
      Résumé
      {/* The travelling border charge. Purely decorative, hence `aria-hidden`. */}
      <span aria-hidden className="circuit-trace" />
    </Button>
  );

  /**
   * `MagneticWrapper` mounts the pull only for real pointers and only outside reduced motion,
   * and it never intercepts events — so the link underneath stays exactly as clickable and
   * keyboard-operable with it as without.
   */
  return (
    <MagneticWrapper className={cn(fullWidth && "w-full")} maxTravel={4} radius={110}>
      {button}
    </MagneticWrapper>
  );
}
