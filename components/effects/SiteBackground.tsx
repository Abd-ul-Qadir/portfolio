"use client";

import { DotGrid } from "@/components/effects/DotGrid";
import { NeuralFieldMount } from "@/components/effects/NeuralFieldMount";

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
      {/* Phase 12 still scrubs this from faint to defined at the About -> Skills boundary;
          it is just the site-wide grid now rather than the Skills section's own. */}
      <DotGrid data-transition-dotgrid />

      {/* The neural field itself — the page's primary visual texture.

          Tuning notes, because these numbers are the whole character of the effect:

          - **Density and strength are set high on purpose** — Abdul asked for the field to
            read as the page's main texture rather than a whisper. 215 nodes at a 112px link
            radius gives a finer-grained mesh than the earlier 150/132 (more nodes, shorter
            synapses), and `intensity` 1.75 lifts the resting mesh well clear of the
            background. `intensity` scales only the base copper/gold mesh, never activation,
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
        // Each packet is a dot plus a tail stroke. 110 in flight is a lot of small strokes on
        // top of ~700 edges, and the exact count is not individually perceptible — measured as
        // part of the 2026-08-27 raster-cost pass.
        maxPackets={60}
        intensity={1.75}
        scrollDrift={60}
        /**
         * **The three settings below are the fix for the page feeling laggy, and they are all
         * about rasterisation rather than JavaScript.**
         *
         * Measured on a production build: hiding this one canvas roughly doubled the page's
         * frame rate, while the engine's own JS cost only 0.79 ms/frame. The bottleneck was
         * filling a 2160x1350 (2.9 megapixel) backing store 60 times a second.
         *
         * - `maxDpr` 1.5 -> 1 cuts that to 1.3 MP: **2.25x fewer pixels per frame.** This layer
         *   is 1px lines and soft cached sprites on near-black — there is no fine detail for the
         *   extra ratio to resolve.
         * - `maxBackingPixels` bounds the *area*, which `maxDpr` alone does not: a 2560-wide
         *   monitor at DPR 1 is still 3.7 MP, and it grows quadratically with window size.
         * - `drawHz` repaints ambient drift at 30fps while stepping the simulation every frame.
         *   The cap lifts automatically while the pointer is moving, so cursor reaction stays
         *   at full rate — only the state the page is in while scrolling or reading is
         *   throttled.
         *
         * If the field ever needs to look sharper again, raise `maxDpr` first and re-measure;
         * it is the single most expensive knob here.
         */
        maxDpr={1}
        maxBackingPixels={2_600_000}
        drawHz={30}
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
