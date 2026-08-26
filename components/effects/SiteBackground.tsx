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

          - **Density and strength are set high on purpose** — Abdul asked for the field to
            read as the page's main texture rather than a whisper. 215 nodes at a 112px link
            radius gives a finer-grained mesh than the earlier 150/132 (more nodes, shorter
            synapses), and `intensity` 1.75 lifts the resting mesh well clear of the
            background. `intensity` scales only the base violet/indigo mesh, never activation,
            so the cursor still stands out against it rather than being lost in it.
          - **This is a readability trade, and it is the intended one.** A brighter resting
            mesh does cross body copy more than the previous restrained setting. If text ever
            reads as fighting the background, lower `intensity` first — it is the single knob
            for that, and it does not touch the interaction.
          - `influenceRadius` at 250px with `pullStrength` 0.34 is the headline interaction:
            the mesh visibly bends toward the cursor within about 130ms.
          - `maxPackets` is a hard ceiling on data in flight, so a long cursor sweep across the
            page cannot cascade into unbounded work. */}
      <NeuralFieldMount
        nodeCount={215}
        mobileNodeCount={80}
        linkRadius={112}
        minRadius={1}
        maxRadius={2.6}
        driftRadius={11}
        influenceRadius={250}
        pullStrength={0.34}
        parallaxDepth={18}
        maxPackets={110}
        intensity={1.75}
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
