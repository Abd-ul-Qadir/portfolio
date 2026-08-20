import { cn } from "@/lib/utils";

interface RadialOrbsProps {
  className?: string;
  /**
   * Which ambient light sits behind this section. Violet is the default everywhere;
   * `cool` mixes in cyan for the atmospheric sections, per `DESIGN_SYSTEM.md`'s rule that
   * cyan is for very subtle atmosphere only.
   */
  tone?: "violet" | "cool";
}

/**
 * Soft radial light behind a section (`DESIGN_SYSTEM.md` #11/#12). CSS-only: three blurred
 * circles on a very slow drift, no JS and nothing per-frame. Geometry and timing live in the
 * `.ambient-orb*` classes in `tailwind.config.ts`; the drift stops entirely under
 * `prefers-reduced-motion`.
 */
export function RadialOrbs({ className, tone = "violet" }: RadialOrbsProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="ambient-orb ambient-orb-a bg-accent-violet" />
      <div
        className={cn(
          "ambient-orb ambient-orb-b",
          tone === "cool" ? "bg-accent-cyan" : "bg-accent-indigo",
        )}
      />
      <div className="ambient-orb ambient-orb-c bg-accent-indigo" />
    </div>
  );
}
