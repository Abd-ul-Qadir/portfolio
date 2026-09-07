"use client";

import { useCallback, useSyncExternalStore } from "react";

import Loader from "@/components/effects/Loader";

const LOADER_EVENT = "aq:loader-decision";
type LoaderWindow = typeof window & { __aqLoaderDecision?: "show" | "skip" };

function subscribe(onStoreChange: () => void) {
  window.addEventListener(LOADER_EVENT, onStoreChange);
  return () => window.removeEventListener(LOADER_EVENT, onStoreChange);
}

function getLoaderDecision() {
  return (window as LoaderWindow).__aqLoaderDecision === "show";
}

// The server must emit the shell. The pre-paint script and CSS decide whether it is visible.
function getServerLoaderDecision() {
  return true;
}

/**
 * Hydrates the loader shell emitted before the page content in the initial HTML. A tiny
 * `beforeInteractive` script makes the show/skip decision before hydration using the same
 * three rules as before: skip reduced motion, skip compact viewports, and play once per
 * session. `useSyncExternalStore` keeps the server snapshot stable while allowing that early
 * DOM decision (and the 15-second safety release) to remove the shell without a flash.
 */
export function LoaderMount() {
  const shouldPlay = useSyncExternalStore(
    subscribe,
    getLoaderDecision,
    getServerLoaderDecision,
  );

  const handleDone = useCallback(() => {
    (window as LoaderWindow).__aqLoaderDecision = "skip";
    document.documentElement.dataset.loader = "skip";
    window.dispatchEvent(new Event(LOADER_EVENT));
  }, []);

  if (!shouldPlay) return null;

  return <Loader active onDone={handleDone} />;
}
