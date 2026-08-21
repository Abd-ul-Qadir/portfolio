"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { MediaFrame } from "@/components/ui/MediaFrame";
import type { Credential } from "@/content/data";
import { useReducedMotion } from "@/lib/hooks";

interface CredentialLightboxProps {
  credential: Credential | null;
  onClose: () => void;
}

/**
 * Image lightbox for a certificate or award that has no external link.
 *
 * A real modal dialog rather than a styled div: `role="dialog"` + `aria-modal`, focus moved
 * in on open and returned to the trigger on close, Escape closes, and Tab is trapped inside
 * so keyboard users cannot wander into the page behind it.
 */
export function CredentialLightbox({ credential, onClose }: CredentialLightboxProps) {
  const panel = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const open = credential !== null;

  // `onClose` is typically an inline arrow, so its identity changes every render. Keeping it
  // in a ref lets the effect below depend on `open` alone — otherwise the effect re-runs
  // constantly, re-capturing `previouslyFocused` as the dialog itself, and focus is returned
  // to an element that no longer exists instead of to the trigger.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    // Focus the panel itself, so a screen reader announces the dialog rather than the
    // close button in isolation.
    panel.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = panel.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {credential ? (
        <motion.div
          className="fixed inset-0 z-loader flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.1 : 0.25 }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="scrim-backdrop absolute inset-0 h-full w-full cursor-default"
            tabIndex={-1}
          />

          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={credential.title}
            tabIndex={-1}
            className="relative w-full max-w-3xl rounded-panel glass-surface p-4 shadow-elevated focus-visible:outline-none"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between gap-4 px-2 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {credential.title}
                </h3>
                {credential.issuer ? (
                  <p className="mt-1 font-mono text-xs text-text-secondary">
                    {credential.issuer}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-pill border border-border-subtle p-2 text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>

            <MediaFrame
              image={credential.image}
              pendingLabel="Certificate image pending"
              sizes="(min-width: 768px) 48rem, 100vw"
              className="aspect-credential w-full rounded-card"
              imageClassName="object-contain"
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
