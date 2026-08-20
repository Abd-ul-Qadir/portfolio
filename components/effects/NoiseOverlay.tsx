import { cn } from "@/lib/utils";

interface NoiseOverlayProps {
  className?: string;
}

/**
 * The very faint, slow-moving grain from `DESIGN_SYSTEM.md`'s Background layer — a single
 * low-opacity tiled SVG turbulence texture, not a particle system. It should be barely
 * perceptible; if you can point at it, it's too strong.
 *
 * Fixed and full-viewport so it sits over the whole page as one layer rather than being
 * repeated per section. Composited on its own layer (`transform` animation only, no repaint),
 * and the drift stops under `prefers-reduced-motion`.
 */
export function NoiseOverlay({ className }: NoiseOverlayProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "noise-overlay pointer-events-none fixed z-40 animate-grain-shift opacity-grain mix-blend-overlay will-change-transform motion-reduce:animate-none",
        className,
      )}
    />
  );
}
