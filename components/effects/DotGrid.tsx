import { cn } from "@/lib/utils";

interface DotGridProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  /**
   * How present the grid reads. Phase 12 animates the element's opacity at the
   * About boundary, so keep this as the resting value.
   */
  intensity?: "faint" | "visible";
  /** Fades the grid out toward the edges so it never reads as a hard-edged panel. */
  fade?: boolean;
}

/**
 * Ambient dot-grid background texture. Pure CSS (see the `.dot-grid` component class in
 * `tailwind.config.ts`) — no canvas, no per-frame JS, nothing to clean up on unmount.
 * Decorative only, so it is `aria-hidden` and never receives pointer events.
 */
export function DotGrid({
  className,
  intensity = "faint",
  fade = true,
  ...rest
}: DotGridProps) {
  return (
    <div
      {...rest}
      aria-hidden
      data-dot-grid
      className={cn(
        "dot-grid pointer-events-none absolute inset-0",
        intensity === "faint" ? "opacity-60" : "opacity-100",
        fade && "mask-radial-fade",
        className,
      )}
    />
  );
}
