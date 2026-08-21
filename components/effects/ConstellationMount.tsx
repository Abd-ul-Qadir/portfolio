"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { ConstellationConfig } from "@/components/effects/ConstellationCanvas";
import { cn } from "@/lib/utils";

/**
 * Client wrapper so the canvas can be loaded with `ssr: false` from a Server Component
 * section (`CLAUDE.md` §2 — anything touching `window` or `canvas` is dynamically imported;
 * `ssr: false` is only legal inside a Client Component).
 *
 * It also **defers the canvas until it is near the viewport**. The homepage mounts three of
 * these (hero, About portrait, Skills), and previously all three downloaded their chunk,
 * built their particle field and started a `requestAnimationFrame` loop during initial load —
 * three times the work, for two fields nobody could see yet. The hero's is in view
 * immediately so it is unaffected; the other two now cost nothing until scrolled toward.
 */
const ConstellationCanvas = dynamic(
  () => import("@/components/effects/ConstellationCanvas"),
  { ssr: false },
);

interface ConstellationMountProps extends ConstellationConfig {
  className?: string;
}

export function ConstellationMount({ className, ...config }: ConstellationMountProps) {
  const holder = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

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
      // Start a little before it scrolls in, so the field is already drifting on arrival
      // rather than popping into existence.
      { rootMargin: "300px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [active]);

  return (
    <div
      ref={holder}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      {active ? <ConstellationCanvas {...config} /> : null}
    </div>
  );
}
