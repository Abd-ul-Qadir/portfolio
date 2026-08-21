"use client";

import { useCallback, useEffect, useState } from "react";

import Loader from "@/components/effects/Loader";
import { useHasSeenLoader, useIsCompactViewport, useReducedMotion } from "@/lib/hooks";

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
 * **Why this is a static import and not `dynamic()`:** it used to be code-split, which meant
 * the chunk was only fetched *after* hydration — the loader appeared ~840ms in, on top of a
 * hero that had already been visible since the first paint. A boot screen that drops over
 * content the reader is already looking at is worse than no boot screen. Importing it
 * normally lets it mount during hydration instead. The cost is that its (small) code ships
 * even to sessions that will not show it; the gates below still prevent it *rendering*.
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
