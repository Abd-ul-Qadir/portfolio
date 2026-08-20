"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef, type ReactNode } from "react";

import { connectLenisToScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

/**
 * Site-wide smooth scrolling.
 *
 * Lenis is driven from GSAP's ticker rather than its own rAF loop (`autoRaf: false`) so the
 * two share a single frame — see `connectLenisToScrollTrigger` in `lib/gsap.ts`.
 *
 * Under `prefers-reduced-motion` Lenis is not mounted at all: smoothed/eased scrolling is
 * exactly the kind of motion the setting asks us to drop, and native scroll is the correct
 * fallback. ScrollTrigger keeps working either way, because Lenis drives native scroll
 * position rather than a fake scroller.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<LenisRef>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;

    // Exposed for `scripts/cdp.mjs` (and manual debugging) so a driver can move the page to
    // an exact scroll position. Development only — never shipped.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __lenis?: unknown }).__lenis = lenis;
    }

    return connectLenisToScrollTrigger(lenis);
  }, [reducedMotion]);

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}
