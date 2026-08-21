"use client";

import { ConstellationMount } from "@/components/effects/ConstellationMount";
import { DotGrid } from "@/components/effects/DotGrid";
import { RadialOrbs } from "@/components/effects/RadialOrbs";

/**
 * The single background for the whole site.
 *
 * **Why one fixed layer instead of a background per section:** sections used to each carry
 * their own mix of `RadialOrbs` / `DotGrid` / `ConstellationMount`, which made every boundary
 * a visible change of backdrop and restarted the particle field three times down the page.
 * This is one `position: fixed` layer behind everything, so the constellation reads as one
 * continuous field the content scrolls over.
 *
 * It is also **cheaper than what it replaces**: one `requestAnimationFrame` loop and one
 * canvas sized to the viewport, rather than two full-width fields plus several orb/grid
 * layers. Being `fixed`, the canvas never grows with page height.
 *
 * Ordering (see `tailwind.config.ts` for the z-scale): this sits at `-z-20`, the Phase 12
 * darkening layer at `-z-10` so it darkens the constellation too, and all content above both.
 * Nothing here is interactive or announced — the whole layer is `aria-hidden` and
 * `pointer-events-none`.
 *
 * **Deviation from `DESIGN_SYSTEM.md`, at Abdul's request** — the doc confines the
 * constellation to the hero. See PROGRESS.md's decision log.
 */
export function SiteBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
    >
      {/* Soft violet/indigo light. One set for the page rather than one per section. */}
      <RadialOrbs />

      {/* Phase 12 still scrubs this from faint to defined at the About -> Skills boundary;
          it is just the site-wide grid now rather than the Skills section's own. */}
      <DotGrid data-transition-dotgrid />

      {/* The field itself. Counts are tuned for a viewport-sized canvas: dense enough to read
          as a constellation, sparse enough to stay cheap behind every section. */}
      {/* Held at 60% and with a shorter connection distance than the old hero-only field.
          Behind a full page of body copy, a field at full strength reads *through* the text
          (lines were visibly crossing the service cards' paragraphs) rather than sitting
          behind it — and `DESIGN_SYSTEM.md` asks for ambience, not a competing layer. */}
      <ConstellationMount
        className="opacity-60"
        particleCount={64}
        mobileParticleCount={24}
        connectionDistance={118}
        minRadius={0.7}
        maxRadius={2}
        speed={0.12}
        glow={5}
        parallaxStrength={0.02}
        attractStrength={0}
      />
    </div>
  );
}
