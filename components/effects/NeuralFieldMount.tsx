"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { useIsTouchDevice } from "@/lib/hooks";
import type { NeuralFieldConfig } from "@/lib/neural-field";
import { cn } from "@/lib/utils";

/**
 * Client wrapper so the canvas can be loaded with `ssr: false` from a Server Component
 * (`CLAUDE.md` §2 — anything touching `window` or `canvas` is dynamically imported, and
 * `ssr: false` is only legal inside a Client Component).
 *
 * It carries two responsibilities beyond the import:
 *
 * 1. **Deferral.** The field is not mounted until it is near the viewport, so a page with more
 *    than one instance does not download the chunk, build a topology and start a
 *    `requestAnimationFrame` loop for a field nobody can see yet.
 * 2. **The mobile simplification.** On a touch device every pointer behaviour is switched off
 *    at the source rather than checked in the hot loop: `influenceRadius: 0` disables
 *    attraction, activation, edge lighting, tendrils, trail and sparks in one value, `core`
 *    goes off, and the packet budget and node count drop. What remains is a calm mesh with a
 *    little ambient signal — which is the right thing to show when there is no cursor to react
 *    to (`CLAUDE.md` §4).
 */
const NeuralField = dynamic(() => import("@/components/effects/NeuralField"), {
  ssr: false,
});

interface NeuralFieldMountProps extends NeuralFieldConfig {
  className?: string;
  /** Packet budget on touch devices. */
  touchPackets?: number;
}

export function NeuralFieldMount({
  className,
  touchPackets = 14,
  ...config
}: NeuralFieldMountProps) {
  const holder = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const isTouch = useIsTouchDevice();

  useEffect(() => {
    if (active) return;
    const element = holder.current;
    if (!element) return;

    // No support check: `IntersectionObserver` exists in every browser Next.js 16 targets
    // (Chrome/Edge/Firefox 111+, Safari 16.4+), so a fallback branch here would be dead code.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setActive(true);
          observer.disconnect();
        }
      },
      // A little ahead of the viewport, so the mesh is already settled on arrival rather than
      // popping into existence.
      { rootMargin: "300px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [active]);

  const resolved: NeuralFieldConfig = isTouch
    ? {
        ...config,
        influenceRadius: 0,
        core: false,
        parallaxDepth: 0,
        scrollDrift: 0,
        maxPackets: touchPackets,
      }
    : config;

  return (
    <div
      ref={holder}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      {active ? <NeuralField {...resolved} /> : null}
    </div>
  );
}
