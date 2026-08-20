"use client";

import dynamic from "next/dynamic";

import { usePointerEffectsEnabled } from "@/lib/hooks";

/**
 * `ssr: false` is only allowed inside a Client Component, which is the entire reason this
 * wrapper exists — the root layout is a Server Component and cannot pass the option itself.
 *
 * The gate here is what keeps the cursor bundle off touch devices and reduced-motion sessions
 * entirely: `dynamic()` only fetches the chunk when the component is actually rendered, so
 * this is a code-splitting decision as much as a behavioural one (`CLAUDE.md` §4 — the cursor
 * must be *unmounted*, not hidden).
 */
const Cursor = dynamic(() => import("@/components/effects/Cursor"), { ssr: false });

export function CursorMount() {
  const enabled = usePointerEffectsEnabled();
  if (!enabled) return null;
  return <Cursor />;
}
