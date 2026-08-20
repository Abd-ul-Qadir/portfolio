"use client";

import dynamic from "next/dynamic";

import type { ConstellationConfig } from "@/components/effects/ConstellationCanvas";

/**
 * Client wrapper so the canvas can be loaded with `ssr: false` from a Server Component
 * section (`CLAUDE.md` §2 — anything touching `window` or `canvas` is dynamically imported;
 * `ssr: false` is only legal inside a Client Component).
 */
const ConstellationCanvas = dynamic(
  () => import("@/components/effects/ConstellationCanvas"),
  { ssr: false },
);

interface ConstellationMountProps extends ConstellationConfig {
  className?: string;
}

export function ConstellationMount(props: ConstellationMountProps) {
  return <ConstellationCanvas {...props} />;
}
