"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

import { useHasSeenLoader, useIsCompactViewport, useReducedMotion } from "@/lib/hooks";

const Loader = dynamic(() => import("@/components/effects/Loader"), { ssr: false });

/**
 * Decides whether the boot sequence plays at all. Two independent gates:
 *
 * 1. **Reduced motion** — skipped entirely, never merely shortened (`CLAUDE.md` §4).
 * 2. **Once per browser session** — `sessionStorage`, so returning to `/` from a project
 *    detail page does not replay it.
 * 3. **Desktop only (≥640px)** — a 1.3s opaque boot overlay owns most of the mobile LCP
 *    budget, and it measured as the single largest performance cost on the page. Phones go
 *    straight to the content; the boot sequence stays part of the desktop experience. This is
 *    the same mobile-simplification licence `CLAUDE.md` §4 grants the hero pin, and it is
 *    recorded in PROGRESS.md's decision log.
 *
 * Both gates run before `dynamic()` renders anything, so the loader's chunk is not even
 * fetched when it will not be shown.
 */
export function LoaderMount() {
  const reducedMotion = useReducedMotion();
  const isCompact = useIsCompactViewport();
  const [hasSeen, markSeen] = useHasSeenLoader();
  // Captured once: `hasSeen` flips to true the moment the sequence *starts*, and this
  // component must keep rendering the loader it already started.
  const [shouldPlay] = useState(() => !hasSeen);
  const [finished, setFinished] = useState(false);

  // The session is marked as soon as the sequence starts, not when it completes. If it were
  // marked on completion, a load interrupted part-way (tab backgrounded, navigation) would
  // replay the whole boot sequence next time — the opposite of what the gate is for.
  useEffect(() => {
    if (!reducedMotion && !isCompact && shouldPlay) markSeen();
  }, [isCompact, markSeen, reducedMotion, shouldPlay]);

  const handleDone = useCallback(() => {
    setFinished(true);
  }, []);

  if (reducedMotion || isCompact || !shouldPlay || finished) return null;

  return <Loader onDone={handleDone} />;
}
