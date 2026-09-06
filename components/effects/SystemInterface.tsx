"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { UserRound } from "lucide-react";

import { coreSkills, identity } from "@/content/data";
import { usePointerEffectsEnabled, useReducedMotion } from "@/lib/hooks";

/**
 * The About section's **AI system interface**: the portrait as the anchor of a small set of
 * floating glass modules, read as "viewing the engineer as an intelligent system".
 *
 * ---
 *
 * **Every value in here is real, and derived rather than written down.** The role comes from
 * `identity.roles[0]`, the location from `identity.location`, and the meters are `coreSkills`'
 * actual proficiencies. Nothing is invented — change the content and this changes with it.
 *
 * **Deliberately three elements, not five.** The first version of this had the portrait plus
 * three boxed panels — an "Active role" card, a "Record" card counting projects and credentials,
 * and the capability meters — all at 10-11px mono inside a ~435px column. It read as a cluttered
 * widget rather than a premium composition: too many competing frames, type too small to be
 * comfortable, a 255px portrait losing to the boxes around it, and "Projects 3 / Credentials 11"
 * landing as a debug readout of numbers that are weak signal and already have whole sections of
 * their own.
 *
 * What replaced it: **one large portrait** as the anchor, **one glass panel** carrying the only
 * data worth a frame, and **one caption line** instead of a boxed card for the role. Fewer,
 * bigger, and aligned — which is what makes it read as designed rather than assembled.
 *
 * **How the depth works, and why it costs almost nothing.** The stage owns `perspective`; the
 * layer inside it owns `preserve-3d` and a single rotation driven by two custom properties.
 * Each module then carries a *static* `translateZ`. That is the whole trick: because the
 * children live at different depths inside one rotating 3D space, one animated transform
 * produces genuine differential parallax across all of them. There is no per-module
 * calculation, no `requestAnimationFrame` loop, and no React state — the pointer handler
 * writes two strings to one element, rAF-throttled.
 *
 * **What it deliberately is not.** No canvas, no particles, no network, no second Three.js
 * scene. The hero owns the human/robot interaction and the background owns the neural field;
 * this section's job is to be a calm instrument panel, so it is built from DOM and CSS that the
 * compositor can handle on its own.
 */

/** Depth in px, and the idle-drift offset, for each layer of the composition. */
const LAYERS = {
  portrait: { z: 0, delay: "0s" },
  caption: { z: 52, delay: "-2.4s" },
  capability: { z: 118, delay: "-4.8s" },
} as const;

/** Entrance order. The portrait settles first, then the modules arrive one by one. */
const ENTRANCE = {
  hidden: (reduced: boolean) => (reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.96 }),
  shown: { opacity: 1, y: 0, scale: 1 },
};

function useStagePointer(enabled: boolean) {
  const stage = useRef<HTMLDivElement>(null);
  const space = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const stageEl = stage.current;
    const spaceEl = space.current;
    if (!stageEl || !spaceEl) return;

    let rect = stageEl.getBoundingClientRect();
    const refreshRect = () => {
      rect = stageEl.getBoundingClientRect();
    };

    let queued = false;
    let nx = 0;
    let ny = 0;

    const write = () => {
      queued = false;
      spaceEl.style.setProperty("--sx", nx.toFixed(4));
      spaceEl.style.setProperty("--sy", ny.toFixed(4));
    };

    const onPointerMove = (event: PointerEvent) => {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Normalised against a generous radius around the stage, and clamped. The composition
      // leans toward the pointer; it never chases it.
      const reach = Math.max(rect.width, rect.height) * 0.9;
      nx = Math.max(-1, Math.min(1, (event.clientX - cx) / reach));
      ny = Math.max(-1, Math.min(1, (event.clientY - cy) / reach));
      if (!queued) {
        queued = true;
        requestAnimationFrame(write);
      }
    };

    const onLeave = () => {
      nx = 0;
      ny = 0;
      if (!queued) {
        queued = true;
        requestAnimationFrame(write);
      }
    };

    let scrollQueued = false;
    const onScroll = () => {
      if (scrollQueued) return;
      scrollQueued = true;
      // One layout read per frame rather than one per Lenis scroll event.
      requestAnimationFrame(() => {
        scrollQueued = false;
        refreshRect();
      });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", refreshRect);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", refreshRect);
      spaceEl.style.removeProperty("--sx");
      spaceEl.style.removeProperty("--sy");
    };
  }, [enabled]);

  return { stage, space };
}

/**
 * One depth plane of the composition.
 *
 * **This wrapper exists because Framer Motion writes `transform` on the element it animates.**
 * Putting `translateZ` in the same element's `style` looks like it works — until the entrance
 * finishes and FM's own transform replaces it, silently flattening the whole composition back
 * to 2D. The depth therefore lives on this outer element and the entrance on the motion element
 * inside it, so neither can overwrite the other.
 */
function DepthLayer({
  z,
  className,
  children,
}: {
  z: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className} style={{ transform: `translateZ(${z}px)`, transformStyle: "preserve-3d" }}>
      {children}
    </div>
  );
}

export function SystemInterface() {
  const reduced = useReducedMotion();
  const pointerEffects = usePointerEffectsEnabled();
  const { stage, space } = useStagePointer(pointerEffects);

  const portrait = identity.portrait;
  // Three of the four scored skills. The fourth is not dropped from the site — the Skills
  // section still lists every one; this module is a summary, not the record.
  const topSkills = coreSkills.slice(0, 3);

  const transition = (delay: number) => ({
    duration: reduced ? 0.2 : 0.5,
    delay: reduced ? 0 : delay,
    ease: [0.22, 1, 0.36, 1] as const,
  });

  return (
    <div ref={stage} className="system-stage relative mx-auto w-full max-w-lg lg:mx-0">
      {/* A local well in the site-wide field. Glass over a bright mesh reads as dirty. */}
      <div aria-hidden className="system-scrim pointer-events-none absolute -inset-10" />

      <div ref={space} className="system-space relative pb-14 sm:pb-16">
        {/* ------------------------------------------------------------ caption
            The role as a line of type, not a boxed card. A third frame here was most of what
            made the group feel cluttered, and a caption carries the same words with less. */}
        <DepthLayer z={LAYERS.caption.z} className="mb-4 flex justify-end">
          <motion.p
            initial={ENTRANCE.hidden(reduced)}
            whileInView={ENTRANCE.shown}
            viewport={{ once: true, amount: 0.3 }}
            transition={transition(0.1)}
            className="flex items-center gap-2.5 font-mono text-eyebrow uppercase text-text-secondary"
          >
            {/* The site's existing "the system is on" signal, reused rather than reinvented. */}
            <span aria-hidden className="status-node" />
            <span className="text-text-primary">{identity.roles[0]}</span>
            <span aria-hidden className="text-border-hover">/</span>
            <span>{identity.location}</span>
          </motion.p>
        </DepthLayer>

        {/* ----------------------------------------------------------- portrait */}
        <DepthLayer z={LAYERS.portrait.z} className="flex justify-end">
          <motion.div
            initial={ENTRANCE.hidden(reduced)}
            whileInView={ENTRANCE.shown}
            viewport={{ once: true, amount: 0.3 }}
            transition={transition(0)}
            className="w-[82%]"
          >
            <div className="relative aspect-portrait overflow-hidden rounded-panel border border-border-subtle">
              {portrait ? (
                <Image
                  src={portrait.src}
                  alt={portrait.alt}
                  fill
                  sizes="(min-width: 1024px) 26rem, 82vw"
                  className="object-cover object-top"
                  priority={false}
                />
              ) : (
                // Holds the exact shape the real portrait will occupy, so dropping the asset in
                // cannot shift the layout. Set `identity.portrait` in `content/data.ts`.
                <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                  <UserRound aria-hidden className="h-8 w-8 text-text-secondary" />
                  <p className="font-mono text-eyebrow uppercase text-text-secondary">
                    Portrait pending
                  </p>
                </div>
              )}

              {/* Non-destructive treatment only: a vignette that stays clear of the face and
                  carries the photograph's own studio backdrop down to the page colour. */}
              <div aria-hidden className="portrait-well pointer-events-none absolute inset-0" />
            </div>
          </motion.div>
        </DepthLayer>

        {/* --------------------------------------------------------- capability
            The one framed element, and the one that earns a frame. It crosses the portrait's
            lower-left corner — torso, never the face — and sits furthest forward in the stack.

            The stage's bottom padding is what sets how much of the panel overlaps the portrait
            versus hangs below it, because the panel is anchored to the stage's foot. Too much
            padding and it reads as falling off the bottom rather than crossing. */}
        <DepthLayer
          z={LAYERS.capability.z}
          className="absolute bottom-0 left-0 z-10 w-[78%] sm:w-[72%]"
        >
          <motion.div
            initial={ENTRANCE.hidden(reduced)}
            whileInView={ENTRANCE.shown}
            viewport={{ once: true, amount: 0.3 }}
            transition={transition(0.2)}
          >
            <div
              className="system-module system-float px-5 py-4"
              style={{ ["--float-delay" as string]: LAYERS.capability.delay }}
            >
              <span aria-hidden className="system-sheen left-0" />
              <p className="font-mono text-eyebrow uppercase text-text-secondary">
                Core capability
              </p>

              <dl className="mt-4 flex flex-col gap-3.5">
                {topSkills.map((skill, index) => (
                  /*
                    `dl > div > dt/dd` is the shape the spec and axe both require: the terms must
                    be the wrapper's direct children. The meter is a second `dd` rather than a
                    loose `div` for the same reason.
                  */
                  <div
                    key={skill.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-3"
                  >
                    <dt className="truncate font-mono text-sm text-text-primary">
                      {skill.name}
                    </dt>
                    <dd className="shrink-0 font-mono text-meta tabular-nums text-accent-violet-text">
                      {skill.proficiency}
                    </dd>
                    {/* `aria-hidden` because the number beside it already carries the value — a
                        screen reader should hear "React.js 95", not a second unlabelled meter. */}
                    <dd aria-hidden className="mt-2 h-px w-full overflow-hidden bg-border-subtle">
                      <motion.span
                        className="block h-full bg-primary"
                        initial={{ width: reduced ? `${skill.proficiency}%` : 0 }}
                        whileInView={{ width: `${skill.proficiency}%` }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{
                          duration: reduced ? 0 : 0.7,
                          delay: reduced ? 0 : 0.34 + index * 0.09,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </motion.div>
        </DepthLayer>
      </div>
    </div>
  );
}
