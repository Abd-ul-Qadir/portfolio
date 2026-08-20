"use client";

import { useSyncExternalStore } from "react";

/**
 * Shared media-query hooks. Every effect component in `components/effects/` consumes these
 * rather than calling `matchMedia` itself, so there is one definition of "reduced motion" and
 * one definition of "touch device" for the whole site (`CLAUDE.md` §4).
 *
 * `useSyncExternalStore` is used instead of `useState` + `useEffect` so the value is correct
 * on the very first client render — no frame where an animation starts and is then torn down.
 */

function subscribeToQuery(query: string) {
  return (onChange: () => void) => {
    const list = window.matchMedia(query);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  };
}

function useMediaQuery(query: string, serverValue: boolean) {
  return useSyncExternalStore(
    subscribeToQuery(query),
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/**
 * `true` when the user has asked for reduced motion.
 *
 * Defaults to `true` during SSR: assuming *less* motion until proven otherwise means the
 * cautious path is the one that renders first.
 */
export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)", true);
}

/**
 * `true` on devices without a precise hover-capable pointer.
 *
 * Used to unmount the cursor and disable magnetic pull entirely — there is nothing to be
 * magnetic toward without a mouse (`CLAUDE.md` §4).
 *
 * Defaults to `true` during SSR for the same reason as above: no pointer effects until the
 * client confirms there is a pointer.
 */
export function useIsTouchDevice() {
  return useMediaQuery("(hover: none), (pointer: coarse)", true);
}

/**
 * `true` when pointer-driven effects (cursor, magnetic pull, tilt, parallax) should run at
 * all. The single check every interactive effect starts with.
 */
export function usePointerEffectsEnabled() {
  const reducedMotion = useReducedMotion();
  const isTouch = useIsTouchDevice();
  return !reducedMotion && !isTouch;
}
