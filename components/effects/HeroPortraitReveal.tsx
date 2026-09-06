"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { usePointerEffectsEnabled } from "@/lib/hooks";

/** Two events per interaction let the existing canvas loop match the robotic reveal palette. */
const ROBOTIC_REVEAL_EVENT = "portfolio:robotic-reveal";

interface HeroPortraitRevealProps {
  /** The robotic layer. Rendered above the normal portrait and masked to the cursor. */
  children: ReactNode;
}

/**
 * The hero portrait's cursor-following reveal: moving over the photo scans the AI version of
 * the subject into view under the pointer, and it fades back out on leave.
 *
 * ---
 *
 * ## How it stays cheap
 *
 * **Nothing here re-renders React.** The pointer position, the reveal radius and the opacity
 * are written straight onto the wrapper as CSS custom properties (`--rx`, `--ry`, `--rr`,
 * `--ro`) from a `requestAnimationFrame` loop. The mask is a `radial-gradient` reading those
 * properties, so a frame costs one style write on one element and the compositor does the rest.
 * Routing the pointer through `useState` would re-render the hero's whole subtree on every
 * mouse move, which is exactly what the brief rules out.
 *
 * The loop only runs while the effect is live — while the pointer is inside, or while the
 * radius is still easing back to zero afterwards — and stops itself once everything has
 * settled, so an idle hero costs nothing at all.
 *
 * ## How it stays inside the portrait
 *
 * The robotic source is keyed with the **same matte** as the normal cut-out
 * (`scripts/cutout.py`), so the two silhouettes are pixel-identical and the robotic layer is
 * already transparent everywhere the subject is not. Containment is therefore structural rather
 * than something the mask has to enforce: even a reveal centred on the very edge of the frame
 * cannot paint background, because there is no background in the layer to paint.
 *
 * ## Reduced motion and touch
 *
 * `usePointerEffectsEnabled()` gates the whole thing — the same hook `TiltCard` and
 * `ProjectCard` use. On a touch device or under `prefers-reduced-motion` no listener is
 * attached, no loop runs, and the robotic layer is never shown: the hero is simply the normal
 * photo. The portrait is already `hidden lg:flex`, so phones never even load the second image.
 */
export function HeroPortraitReveal({ children }: HeroPortraitRevealProps) {
  const enabled = usePointerEffectsEnabled();
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = host.current;
    if (!el) return;

    // Target values, set by the pointer; and the eased values actually painted. The gap between
    // them is the "slight lag" that makes the reveal feel like it has weight rather than being
    // welded to the cursor.
    let targetX = 50;
    let targetY = 50;
    let targetR = 0;
    let x = 50;
    let y = 50;
    let r = 0;
    let raf = 0;
    let inside = false;

    // Radius as a fraction of the box's SHORTER side, resolved to px each frame.
    //
    // It has to be a length: `radial-gradient(circle <percentage>)` is invalid CSS — an
    // explicit circle radius must be a `<length>` — and an invalid mask fails *open*, painting
    // the whole layer instead of hiding it. Percentages are only legal on `ellipse`, which
    // would also go oval in this 4:5 box.
    const RADIUS_RATIO = 0.36;
    let radiusPx = 150;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) radiusPx = Math.min(rect.width, rect.height) * RADIUS_RATIO;
      return rect;
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(el);

    const frame = () => {
      // Position eases faster than the radius: the window should keep up with the pointer
      // while still opening and closing softly.
      x += (targetX - x) * 0.22;
      y += (targetY - y) * 0.22;
      r += (targetR - r) * 0.12;


      el.style.setProperty("--rx", `${x.toFixed(2)}%`);
      el.style.setProperty("--ry", `${y.toFixed(2)}%`);
      el.style.setProperty("--rr", `${(r * radiusPx).toFixed(2)}px`);
      // The rim and scanlines fade in with the reveal rather than being switched on.
      el.style.setProperty("--ro", r.toFixed(3));

      const settled =
        !inside && r < 0.002 && Math.abs(targetX - x) < 0.1 && Math.abs(targetY - y) < 0.1;
      if (settled) {
        // Fully closed: park it and stop burning frames.
        el.style.setProperty("--rr", "0px");
        el.style.setProperty("--ro", "0");
        raf = 0;
        return;
      }
      raf = window.requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!raf) raf = window.requestAnimationFrame(frame);
    };

    const setNetworkActivation = (active: boolean) => {
      window.dispatchEvent(
        new CustomEvent(ROBOTIC_REVEAL_EVENT, { detail: { active } }),
      );
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      targetX = ((event.clientX - rect.left) / rect.width) * 100;
      targetY = ((event.clientY - rect.top) / rect.height) * 100;
      wake();
    };

    const onEnter = (event: PointerEvent) => {
      inside = true;
      targetR = 1;
      setNetworkActivation(true);
      // Jump the *position* to the entry point instead of easing to it, or the window slides
      // in from wherever it was last left, which reads as a stray object crossing the photo.
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        x = targetX = ((event.clientX - rect.left) / rect.width) * 100;
        y = targetY = ((event.clientY - rect.top) / rect.height) * 100;
      }
      wake();
    };

    const onLeave = () => {
      inside = false;
      targetR = 0;
      setNetworkActivation(false);
      wake();
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      if (inside) setNetworkActivation(false);
      resize.disconnect();
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={host} aria-hidden className="portrait-reveal">
      <div className="portrait-reveal-layer">{children}</div>
      {/* Faint scanlines across the revealed area, masked to the same window — a readout, not
          a CRT. **No coloured ring:** an earlier version drew a cyan annulus at the boundary
          and it read as a hard circle drawn on the portrait rather than as a reveal. The
          feathered mask is the only thing that should mark where the two versions meet. */}
      <div className="portrait-reveal-scan" />
    </div>
  );
}
