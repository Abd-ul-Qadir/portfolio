"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, type ReactNode } from "react";

import { connectLenisToScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

/**
 * Wires the Lenis instance into GSAP.
 *
 * **This must read the instance from context, not from a ref on `<ReactLenis>`.** The
 * original version did `lenisRef.current?.lenis` inside an effect keyed on `[reducedMotion]`,
 * and bailed out with `if (!lenis) return`. When the ref was not yet populated on that single
 * run, the effect never re-ran, so `connectLenisToScrollTrigger` was never called — and with
 * `autoRaf: false` that means **nothing ever calls `lenis.raf()`**. Lenis then swallows wheel
 * and trackpad input without ever applying it, while dragging the native scrollbar still
 * works, because that path never goes through Lenis. That was a real, shipped bug.
 *
 * Living inside `<ReactLenis>` and using `useLenis()` removes the timing question entirely:
 * the hook returns `undefined` until the instance exists and then re-renders with it, and the
 * effect below is keyed on that value, so the wiring happens exactly once the instance is
 * real.
 */
function LenisGsapBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // Exposed for `scripts/cdp.mjs` (and manual debugging) so a driver can move the page to
    // an exact scroll position. Development only — never shipped.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __lenis?: unknown }).__lenis = lenis;
    }

    return connectLenisToScrollTrigger(lenis);
  }, [lenis]);

  return null;
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
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ autoRaf: false }}>
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
}
