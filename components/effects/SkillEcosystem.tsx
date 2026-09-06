"use client";

import { motion } from "framer-motion";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";

import { coreSkills } from "@/content/data";
import { cn } from "@/lib/utils";

/**
 * The floating AI ecosystem from `DESIGN_SYSTEM.md`.
 *
 * **Explicitly not progress bars and not cards** — the old portfolio's linear percentage bars
 * are retired. A centred `AI ENGINEER` node with the skill nodes orbiting it, each connected
 * back to the centre by a thin line, sharing the constellation's visual language.
 *
 * **Only the four scored core skills orbit** (`PHASE_PLAN.md` Phase 10). The unscored stack —
 * Backend, Frontend, Data/AI-ML, Databases, Tools — is a plain tag list in `Skills.tsx`, listing
 * each group's actual technologies. It used to *also* orbit on a second ring, which contradicted
 * the plan, duplicated content already on the page, and was the sole cause of the label
 * collisions between the two rings.
 *
 * Proficiency drives **node size and glow**, and the exact number is revealed in the hover /
 * focus panel rather than printed as a bar label.
 *
 * *Why the nodes are DOM elements and the lines are SVG, rather than one canvas:* every node
 * here is a real labelled control that has to be reachable by keyboard and readable by a
 * screen reader, and canvas content is neither. The line-connection *approach* is shared with
 * the `NeuralField` engine (thin lines, distance-driven opacity, copper on dark); the ambience
 * behind this ecosystem is the site-wide field itself. Logged in PROGRESS.md's decision log.
 */

/** Orbit geometry, as a fraction of the container's half-width/height. */
// Radii as a fraction of the container's half-size. The core orbit has to clear the centre
// node's own radius, or the connecting lines are hidden underneath it — which is exactly what
// happened at mobile width before the hub was shrunk below `sm`.
// **One orbit, four nodes.** `PHASE_PLAN.md` Phase 10 is explicit that only the four *scored*
// core skills orbit the hub, and that "the remaining stack (Databases, Tools, etc. — no
// percentage given) renders as a plain tag list". The stack groups used to orbit on a second
// ring as well, which both contradicted that and duplicated them — they are already listed in
// full, with their individual technologies, in the tag list below this ecosystem. Removing that
// ring is also what removes the label collisions the two rings caused between them.
// 0.43, not 0.4: with only four nodes the ring was leaving a wide dead band inside a 672px
// square. Pushing them out and shrinking the box (below) makes the composition denser without
// making anything smaller — the nodes and hub are sized in `rem`, so only the empty space moves.
const ORBIT_RADIUS = 0.43;

/**
 * The same radius, tightened on a narrow container.
 *
 * **A node is wider than its circle** — the label sits under it and is what actually defines the
 * node's footprint. On a phone the stage is roughly the viewport width, so at 0.43 the outermost
 * labels ran past both edges and were silently clipped by the section's `overflow-hidden`
 * (measured: `left: -5`, `right: 395` in a 390px viewport). On desktop the same spill is
 * harmless — the stage is `max-w-xl` inside a much wider container, so labels simply extend into
 * the space around it.
 *
 * Driven off the measured container width rather than a CSS breakpoint, because the SVG geometry
 * is computed in JS and has to agree with whatever width the element actually got.
 */
const orbitRadiusFor = (width: number) => (width > 0 && width < 420 ? 0.33 : ORBIT_RADIUS);

/**
 * Gap, in viewBox units, between a connection's end and the circle it meets.
 *
 * Zero: the connections are meant to *attach* to the hub and to each node. Any positive value
 * leaves them visibly floating short of the circles they connect.
 */
const LINE_GAP = 0;

/** The node button's own padding (`p-1`), in rem. Offsets the circle from the button's top. */
const BUTTON_PAD = 0.25;

interface EcosystemNode {
  id: string;
  label: string;
  /** 0–100. Every orbiting node is a scored core skill; the unscored stack is the tag list. */
  proficiency: number;
  angle: number;
}

function buildNodes(): EcosystemNode[] {
  return coreSkills.map((skill, index) => ({
    id: skill.id,
    label: skill.name,
    proficiency: skill.proficiency,
    // Evenly spaced, starting at the top.
    angle: (index / coreSkills.length) * Math.PI * 2 - Math.PI / 2,
  }));
}

const nodes = buildNodes();

/** Maps proficiency to a node diameter in rem — size carries the number, not a bar. */
function nodeSize(proficiency: number) {
  // 80% → 3.25rem, 95% → 5rem. With only four nodes on one ring there is room for them to be
  // bigger, which makes the proficiency difference easier to read at a glance.
  return 3.25 + ((proficiency - 80) / 15) * 1.75;
}

/**
 * Maps proficiency to a **resting** glow.
 *
 * `DESIGN_SYSTEM.md` asks proficiency to drive "node size and/or glow intensity". Size alone
 * was carrying it, and glow existed only as a hover state — so at rest every node rendered as
 * the same flat disc and the ecosystem read as inert rather than as a system under power.
 * Now both carry it: a 95% skill sits visibly brighter than an 80% one before you touch
 * anything.
 *
 * Built from `--accent-copper` through `color-mix` so it stays a token, never a hex literal
 * (`CLAUDE.md` §2). Unscored stack groups get a deliberately faint halo — present enough to
 * belong to the same system, dim enough that they never compete with the scored skills.
 */
function nodeGlow(proficiency: number, isActive: boolean) {
  if (isActive) {
    return `0 0 48px color-mix(in srgb, var(--accent-copper) 65%, transparent)`;
  }
  const t = (proficiency - 80) / 15;
  const blur = Math.round(18 + t * 24);
  const strength = Math.round(24 + t * 26);
  return `0 0 ${blur}px color-mix(in srgb, var(--accent-copper) ${strength}%, transparent)`;
}

/**
 * The node's own body.
 *
 * Previously the circles were `bg-bg-glass` — a 4% white film, which against this background
 * rendered them as dark holes punched in the page rather than as nodes carrying any charge.
 * A radial fill, scaled by the same proficiency the size and glow already track, makes each
 * one read as lit from within, and it also stops the connecting line showing straight through
 * the middle of the circle it terminates at.
 */
function nodeFill(proficiency: number) {
  const t = (proficiency - 80) / 15;
  const core = Math.round(46 + t * 28);
  const edge = Math.round(16 + t * 12);
  return (
    `radial-gradient(circle at 50% 40%, ` +
    `color-mix(in srgb, var(--accent-copper) ${core}%, transparent) 0%, ` +
    `color-mix(in srgb, var(--accent-gold) ${edge}%, transparent) 58%, ` +
    `transparent 80%)`
  );
}

export function SkillEcosystem() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const gradientId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);

  /**
   * The SVG works in a 0–100 viewBox while the hub and the nodes are sized in `rem`, so the
   * connections can only stop at their real edges if the two are related by an actual
   * measurement. Both the container and the hub are responsive (`max-w-2xl`, `h-20 sm:h-28
   * lg:h-32`), so this is re-measured on resize rather than assumed.
   *
   * `offsetWidth`, not `getBoundingClientRect()`: the latter reports a *rotated* bounding box,
   * and this component now spins.
   */
  const [box, setBox] = useState({ width: 0, hub: 0, rem: 16 });
  useEffect(() => {
    const root = rootRef.current;
    const hub = hubRef.current;
    if (!root || !hub) return;
    const measure = () =>
      setBox({
        width: root.offsetWidth,
        hub: hub.offsetWidth,
        rem: parseFloat(getComputedStyle(document.documentElement).fontSize) || 16,
      });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(hub);
    return () => observer.disconnect();
  }, []);

  /** viewBox units per CSS pixel. 0 until the first measurement lands. */
  const unit = box.width > 0 ? 100 / box.width : 0;
  const orbitRadius = orbitRadiusFor(box.width);
  /** Where a connection starts: the hub's edge, plus a little air. */
  const hubEdge = (box.hub / 2) * unit + LINE_GAP;

  const active = nodes.find((node) => node.id === activeId) ?? null;

  return (
    <div
      ref={rootRef}
      className="ecosystem-stage relative mx-auto aspect-square w-full max-w-xl"
    >
      {/* Local well in the background field — see `.ecosystem-scrim`. Sits behind everything
          this component draws but above the site-wide field, which is `fixed` at `-z-20`. */}
      <div aria-hidden className="ecosystem-scrim pointer-events-none absolute -inset-16" />

      {/* Everything that orbits lives inside one rotating wrapper: the connections, the orbit
          ring and the nodes all turn together, so the geometry stays rigid while it spins.
          The hub and the info panel are deliberately OUTSIDE it — the hub is the axis and its
          lettering must stay upright, and the panel is UI, not part of the orbit. */}
      <div className="ecosystem-rotor absolute inset-0 animate-ecosystem-spin motion-reduce:animate-none">
      {/* Connecting lines back to the centre. Decorative — every node they connect is a
          real labelled control in the DOM below. */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <defs>
          {/* `gradientUnits="userSpaceOnUse"` is load-bearing, not a preference.
              SVG's default is `objectBoundingBox`, which resolves the gradient against each
              stroked element's own bounding box — and a perfectly horizontal or vertical
              `<line>` has a **zero-area** box, so the gradient cannot resolve and the stroke
              paints nothing at all. With four nodes evenly spaced from the top, every single
              connection is axis-aligned, so every line silently disappeared. (Before the outer
              ring was removed this hid it: the diagonal group lines drew, while the lines to
              React.js and HTML/CSS did not.) Pinning the gradient to the viewBox instead makes
              it independent of each line's geometry. */}
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="100"
            y2="100"
          >
            <stop offset="0%" stopColor="var(--accent-copper)" />
            <stop offset="52%" stopColor="var(--accent-gold)" />
            <stop offset="100%" stopColor="var(--accent-teal)" />
          </linearGradient>
          <radialGradient id={`${gradientId}-well`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--bg-surface)" stopOpacity="0.74" />
            <stop offset="72%" stopColor="var(--bg-base)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--bg-base)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* A static optical well separates the rotor from the site-wide neural field without
            paying for another blur or backdrop-filter region. */}
        <circle
          cx="50"
          cy="50"
          r={orbitRadius * 100 + 5}
          fill={`url(#${gradientId}-well)`}
          stroke="var(--border-subtle)"
          strokeWidth="0.16"
        />

        {/* Primary carrier: the continuous line is the track; the asymmetric filled signal
            rotates independently around it. This uses a transform on one SVG group rather than
            animating stroke paint every frame. `pathLength=100` keeps the pattern identical at
            both responsive radii. */}
        <circle
          cx="50"
          cy="50"
          r={orbitRadius * 100}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth="0.32"
          opacity="0.9"
        />
        <g className="ecosystem-track-runner animate-ecosystem-track motion-reduce:animate-none">
          <circle
            cx="50"
            cy="50"
            r={orbitRadius * 100}
            pathLength="100"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="0.72"
            strokeLinecap="round"
            strokeDasharray="18 7 3 72"
            opacity="0.92"
          />
        </g>
        <circle
          cx="50"
          cy="50"
          r={orbitRadius * 100}
          pathLength="100"
          fill="none"
          stroke="var(--accent-teal)"
          strokeWidth="0.24"
          strokeLinecap="round"
          strokeDasharray="0.25 2.25"
          opacity="0.48"
        />

        {/* Precision bezel: one boundary and one dashed circle create the graduated edge.

            **One `<circle>`, not 48 tick elements.** A wide stroke with a mostly-gap dash
            pattern renders as evenly spaced ticks for the cost of a single path — the whole
            point being that this stays cheap while the composition gets denser. */}
        <circle
          cx="50"
          cy="50"
          r={orbitRadius * 100 + 5}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth="0.18"
          opacity="0.8"
        />
        <circle
          cx="50"
          cy="50"
          r={orbitRadius * 100 + 5}
          pathLength="100"
          fill="none"
          stroke="var(--accent-gold)"
          strokeWidth="1.15"
          strokeDasharray="0.22 2.28"
          opacity="0.42"
        />

        {/* Inner telemetry track anchors the hub. Its short copper runner travels in the
            opposite direction, separating it clearly from the outer signal without an oval
            axis or any per-frame JavaScript. */}
        <circle
          cx="50"
          cy="50"
          r={orbitRadius * 100 * 0.62}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth="0.2"
          opacity="0.72"
        />
        <g className="ecosystem-track-runner animate-ecosystem-track-reverse motion-reduce:animate-none">
          <circle
            cx="50"
            cy="50"
            r={orbitRadius * 100 * 0.62}
            pathLength="100"
            fill="none"
            stroke="var(--accent-copper)"
            strokeWidth="0.38"
            strokeLinecap="round"
            strokeDasharray="14 86"
            strokeDashoffset="34"
            opacity="0.72"
          />
        </g>

        {nodes.map((node) => {
          const dx = Math.cos(node.angle);
          const dy = Math.sin(node.angle);
          // A connection runs from the hub's edge to the node's edge, never centre to centre:
          // ending at the centres put the line *through* both circles.
          const nodeEdge =
            orbitRadius * 100 - ((nodeSize(node.proficiency) * box.rem) / 2) * unit - LINE_GAP;
          const x1 = 50 + dx * hubEdge;
          const y1 = 50 + dy * hubEdge;
          const x = 50 + dx * nodeEdge;
          const y = 50 + dy * nodeEdge;
          // Length of the visible segment, so the travelling dash covers exactly it.
          const span = Math.max(nodeEdge - hubEdge, 0);
          const isActive = activeId === node.id;
          // Nothing to draw until the first measurement lands; the lines are decorative and
          // `aria-hidden`, so a single frame without them costs nothing.
          if (span <= 0) return null;
          return (
            <g key={node.id}>
              <line
                x1={x1}
                y1={y1}
                x2={x}
                y2={y}
                stroke={`url(#${gradientId})`}
                strokeWidth={isActive ? 0.8 : 0.42}
                // Strong enough to read as the foreground: the site-wide neural field behind
                // this section is deliberately dense and bright, and at the earlier 0.45 these
                // connections were being outshone by the decoration.
                opacity={isActive ? 1 : 0.75}
                className="transition-all duration-500 ease-smooth"
              />
              {/* Connection traffic is now interaction-driven. Resting used to run four SVG
                  stroke animations forever; hover/focus starts one signal on the active path,
                  making the response clearer while removing continuous paint work. */}
              <line
                x1={x1}
                y1={y1}
                x2={x}
                y2={y}
                stroke="var(--accent-teal)"
                strokeWidth={isActive ? 1 : 0.7}
                strokeLinecap="round"
                // Dash and travel distance both derive from the measured span, so the pulse
                // sweeps exactly the visible segment however long it happens to be.
                strokeDasharray={`2 ${Math.max(span - 2, 1)}`}
                opacity={isActive ? 0.95 : 0}
                className={cn(
                  "transition-opacity duration-300 ease-smooth motion-reduce:animate-none motion-reduce:opacity-0",
                  isActive && "animate-synapse-flow",
                )}
                style={
                  {
                    "--flow-span": span,
                  } as CSSProperties
                }
              />
            </g>
          );
        })}
      </svg>

      {/* Orbiting skill nodes. */}
      <ul className="contents">
        {nodes.map((node) => {
          const x = 50 + Math.cos(node.angle) * orbitRadius * 100;
          const y = 50 + Math.sin(node.angle) * orbitRadius * 100;
          const size = nodeSize(node.proficiency);
          const isActive = activeId === node.id;

          return (
            <li
              key={node.id}
              className="absolute -translate-x-1/2"
              // The connecting lines end at the orbit point, and the circle — not the
              // button's centre — is what should sit there. The label hangs below it, so the
              // button is pulled up by half the circle's diameter *plus* the button's own
              // padding, which is what put the circle a few pixels low before.
              style={{
                left: `${x}%`,
                top: `${y}%`,
                marginTop: `-${size / 2 + BUTTON_PAD}rem`,
              }}
            >
              {/* Counter-rotation, on its own element so it cannot collide with the Framer
                  transform the button below uses for its float. It cancels the orbit's spin
                  exactly — same duration, same linear timing, opposite direction — so the node
                  travels around the hub while its circle and label stay upright. Drop this and
                  every label reads upside down halfway round.

                  **The origin is the circle's centre, not this element's.** By default a
                  transform pivots about the element's own middle — and this element wraps the
                  circle *and* the label below it, so its middle sits well under the circle.
                  Spinning about that swung each circle off the end of its connection as the
                  orbit turned, which is exactly the drift Abdul reported. The circle's centre
                  is one button-padding plus half a diameter down from the top. */}
              <div
                className="ecosystem-counterrotor animate-ecosystem-counterspin motion-reduce:animate-none"
                style={{ transformOrigin: `50% ${BUTTON_PAD + size / 2}rem` }}
              >
              <motion.button
                type="button"
                aria-describedby={active?.id === node.id ? "skill-info-panel" : undefined}
                onMouseEnter={() => setActiveId(node.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(node.id)}
                onBlur={() => setActiveId(null)}
                data-cursor-label="INFO"
                data-skill-node={node.id}
                className="flex w-24 flex-col items-center gap-2 rounded-card p-1 sm:w-36"
                // **No independent bob.** Each node used to drift +/-8px on its own timer,
                // but the connections are drawn in the SVG and do not drift with it — so the
                // circles detached from the ends of their own lines, by the same 8px, on a
                // loop. The orbit's rotation already supplies the "gently floating" motion
                // `DESIGN_SYSTEM.md` asks for, and it moves the lines and the nodes together.
              >
                {/* The node: a lit disc, a gauge arc reading its proficiency, and the number
                    itself. The label sits outside, so a long skill name can never overflow it.

                    **The number is visible at rest on purpose.** It used to appear only in the
                    hover panel, which left four glowing discs carrying no readable information
                    — the ecosystem looked decorative rather than instrumented. */}
                <span aria-hidden className="relative block shrink-0">
                  <span
                    className={cn(
                      "relative grid place-items-center rounded-pill border transition-all duration-300 ease-smooth",
                      isActive ? "border-accent-copper" : "border-border-subtle",
                    )}
                    // The glow is inline rather than a `shadow-*` class because its strength is
                    // a function of this node's proficiency, which Tailwind cannot express as a
                    // static utility. An inline `boxShadow` would also silently win over a
                    // class-based one, so the active state is folded into the same ramp instead
                    // of being layered on top of it.
                    style={{
                      width: `${size}rem`,
                      height: `${size}rem`,
                      background: nodeFill(node.proficiency),
                      boxShadow: nodeGlow(node.proficiency, isActive),
                    }}
                  >
                    {/* Convex highlight, above the fill and below the number. */}
                    <span className="skill-node-sheen" />

                    {/* Scaled to the disc rather than fixed, so it fills the 5rem node and
                        still fits inside the 3.25rem one. */}
                    <span
                      className="relative font-mono font-medium tabular-nums leading-none text-text-primary"
                      style={{ fontSize: `${size * 0.28}rem` }}
                    >
                      {node.proficiency}
                    </span>
                  </span>

                  <span className="skill-ring-track" />
                  <span
                    className={cn("skill-ring", isActive && "opacity-100")}
                    style={{ ["--pct" as string]: node.proficiency }}
                  />
                </span>
                <span
                  className={cn(
                    "text-center font-mono text-node transition-colors duration-300",
                    isActive ? "text-text-primary" : "text-text-secondary",
                  )}
                >
                  {node.label}
                </span>
              </motion.button>
              </div>
            </li>
          );
        })}
      </ul>
      </div>

      {/* The centre node. */}
      <div
        ref={hubRef}
        className="ecosystem-hub absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1.5 rounded-pill border border-border-subtle text-center sm:h-28 sm:w-28 lg:h-32 lg:w-32"
      >
        {/* A slowly rotating copper/teal bezel and quiet static calibration boundary make the
            axis read as a processing core. */}
        <span
          aria-hidden
          className="ecosystem-hub-bezel"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-6 rounded-pill border border-dashed border-border-subtle opacity-35"
        />
        {/* The site's existing "the system is on" signal, reused rather than reinvented. */}
        <span aria-hidden className="status-node" />
        <span className="px-3 font-mono text-eyebrow uppercase text-text-primary">
          AI Engineer
        </span>
        <span
          aria-hidden
          className="hidden font-mono text-micro uppercase tracking-label text-text-secondary sm:block"
        >
          Core / {String(nodes.length).padStart(2, "0")}
        </span>
      </div>

      {/* Info panel. `aria-live` so the detail is announced when a keyboard user tabs onto a
          node, rather than being visible-only. */}
      <div
        id="skill-info-panel"
        aria-live="polite"
        className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center"
      >
        {active ? (
          <div className="rounded-card glass-surface px-4 py-3 text-center shadow-elevated">
            <p className="text-sm font-medium text-text-primary">{active.label}</p>
            <p className="mt-1 font-mono text-xs text-accent-copper-text">
              {active.proficiency !== null
                ? `${active.proficiency}% proficiency`
                : "Supporting stack"}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
