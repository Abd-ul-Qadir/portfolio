"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

import { useHasSeenLoader, useReducedMotion } from "@/lib/hooks";

const Loader = dynamic(() => import("@/components/effects/Loader"), { ssr: false });

/**
 * Decides whether the boot sequence plays at all. Two independent gates:
 *
 * 1. **Reduced motion** — skipped entirely, never merely shortened (`CLAUDE.md` §4).
 * 2. **Once per browser session** — `sessionStorage`, so returning to `/` from a project
 *    detail page does not replay it.
 *
 * Both gates run before `dynamic()` renders anything, so the loader's chunk is not even
 * fetched when it will not be shown.
 */
export function LoaderMount() {
  const reducedMotion = useReducedMotion();
  const [hasSeen, markSeen] = useHasSeenLoader();
  // Captured once: `hasSeen` flips to true the moment the sequence *starts*, and this
  // component must keep rendering the loader it already started.
  const [shouldPlay] = useState(() => !hasSeen);
  const [finished, setFinished] = useState(false);

  // The session is marked as soon as the sequence starts, not when it completes. If it were
  // marked on completion, a load interrupted part-way (tab backgrounded, navigation) would
  // replay the whole boot sequence next time — the opposite of what the gate is for.
  useEffect(() => {
    if (!reducedMotion && shouldPlay) markSeen();
  }, [markSeen, reducedMotion, shouldPlay]);

  const handleDone = useCallback(() => {
    setFinished(true);
  }, []);

  if (reducedMotion || !shouldPlay || finished) return null;

  return <Loader onDone={handleDone} />;
}
