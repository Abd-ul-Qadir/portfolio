"use client";

import { DotGrid } from "@/components/effects/DotGrid";
import { NeuralFieldMount } from "@/components/effects/NeuralFieldMount";
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

      {/* The neural field itself — the page's primary visual texture.

          Tuning notes, because these numbers are the whole character of the effect:

          - The **resting** mesh is deliberately quiet. `intensity` scales only the base
            violet/indigo mesh, not activation, so the network stays behind body copy at rest
            and lights up cyan only where the cursor actually is. That is what lets it be both
            dense and readable — the earlier field had to be dimmed globally because its lines
            were equally bright everywhere, including across the service cards' paragraphs.
          - `influenceRadius` at 250px with `pullStrength` 0.34 is the headline interaction:
            the mesh visibly bends toward the cursor within about 130ms.
          - `maxPackets` is a hard ceiling on data in flight, so a long cursor sweep across the
            page cannot cascade into unbounded work. */}
      <NeuralFieldMount
        nodeCount={150}
        mobileNodeCount={54}
        linkRadius={132}
        minRadius={1}
        maxRadius={2.6}
        driftRadius={11}
        influenceRadius={250}
        pullStrength={0.34}
        parallaxDepth={18}
        maxPackets={90}
        intensity={1}
        scrollDrift={60}
        // A full-viewport layer of 1px lines and soft glows gains nothing visible from a 2x
        // backing store, and costs ~44% more pixels to fill on every frame.
        maxDpr={1.5}
        core
        // The scroll story: the field's whole topology morphs continuously from section to
        // section — ambient → lattice → clusters → hub → timeline → pipeline → converge. See
        // `lib/neural-field.ts`. Only this field takes it; the About portrait's is local
        // decoration and stays in its resting layout.
        story
      />
    </div>
  );
}
