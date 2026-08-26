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
 * the `NeuralField` engine (thin lines, distance-driven opacity, violet on dark); the ambience
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
const ORBIT_RADIUS = 0.4;

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
 * Built from `--accent-violet` through `color-mix` so it stays a token, never a hex literal
 * (`CLAUDE.md` §2). Unscored stack groups get a deliberately faint halo — present enough to
 * belong to the same system, dim enough that they never compete with the scored skills.
 */
function nodeGlow(proficiency: number, isActive: boolean) {
  if (isActive) {
    return `0 0 48px color-mix(in srgb, var(--accent-violet) 65%, transparent)`;
  }
  const t = (proficiency - 80) / 15;
  const blur = Math.round(18 + t * 24);
  const strength = Math.round(24 + t * 26);
  return `0 0 ${blur}px color-mix(in srgb, var(--accent-violet) ${strength}%, transparent)`;
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
    `color-mix(in srgb, var(--accent-violet) ${core}%, transparent) 0%, ` +
    `color-mix(in srgb, var(--accent-indigo) ${edge}%, transparent) 58%, ` +
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
  /** Where a connection starts: the hub's edge, plus a little air. */
  const hubEdge = (box.hub / 2) * unit + LINE_GAP;

  const active = nodes.find((node) => node.id === activeId) ?? null;

  return (
    <div ref={rootRef} className="relative mx-auto aspect-square w-full max-w-2xl">
      {/* Local well in the background field — see `.ecosystem-scrim`. Sits behind everything
          this component draws but above the site-wide field, which is `fixed` at `-z-20`. */}
      <div aria-hidden className="ecosystem-scrim pointer-events-none absolute -inset-16" />

      {/* Everything that orbits lives inside one rotating wrapper: the connections, the orbit
          ring and the nodes all turn together, so the geometry stays rigid while it spins.
          The hub and the info panel are deliberately OUTSIDE it — the hub is the axis and its
          lettering must stay upright, and the panel is UI, not part of the orbit. */}
      <div className="absolute inset-0 animate-ecosystem-spin motion-reduce:animate-none">
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
            <stop offset="0%" stopColor="var(--accent-violet)" />
            <stop offset="100%" stopColor="var(--accent-cyan)" />
          </linearGradient>
        </defs>
        {/* The orbit itself, drawn faintly. `DESIGN_SYSTEM.md` describes the nodes as
            "floating/orbiting" the hub; without the path they sit on, four nodes on a cross
            read as a static diagram rather than as a system with a shape. */}
        <circle
          cx="50"
          cy="50"
          r={ORBIT_RADIUS * 100}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="0.15"
          strokeDasharray="0.9 2.6"
          opacity="0.28"
        />

        {nodes.map((node, index) => {
          const dx = Math.cos(node.angle);
          const dy = Math.sin(node.angle);
          // A connection runs from the hub's edge to the node's edge, never centre to centre:
          // ending at the centres put the line *through* both circles.
          const nodeEdge =
            ORBIT_RADIUS * 100 - ((nodeSize(node.proficiency) * box.rem) / 2) * unit - LINE_GAP;
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
              {/* The signal travelling that connection: one short dash sweeping the line's
                  length, inward toward the hub. Pure CSS on an SVG stroke — no JS and no
                  per-frame work — and it stops dead under reduced motion. Each connection is
                  delayed so they never pulse in unison. */}
              <line
                x1={x1}
                y1={y1}
                x2={x}
                y2={y}
                stroke="var(--accent-cyan)"
                strokeWidth={isActive ? 1 : 0.7}
                strokeLinecap="round"
                // Dash and travel distance both derive from the measured span, so the pulse
                // sweeps exactly the visible segment however long it happens to be.
                strokeDasharray={`2 ${Math.max(span - 2, 1)}`}
                opacity={isActive ? 0.95 : 0.7}
                className="animate-synapse-flow transition-all duration-500 ease-smooth motion-reduce:animate-none motion-reduce:opacity-0"
                style={
                  {
                    animationDelay: `${index * 0.8}s`,
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
          const x = 50 + Math.cos(node.angle) * ORBIT_RADIUS * 100;
          const y = 50 + Math.sin(node.angle) * ORBIT_RADIUS * 100;
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
                className="animate-ecosystem-counterspin motion-reduce:animate-none"
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
                className="flex w-28 flex-col items-center gap-2 rounded-card p-1 sm:w-36"
                // **No independent bob.** Each node used to drift +/-8px on its own timer,
                // but the connections are drawn in the SVG and do not drift with it — so the
                // circles detached from the ends of their own lines, by the same 8px, on a
                // loop. The orbit's rotation already supplies the "gently floating" motion
                // `DESIGN_SYSTEM.md` asks for, and it moves the lines and the nodes together.
              >
                {/* The circle is the node: its diameter and glow carry the proficiency.
                    The label sits outside it, so a long skill name can never overflow it. */}
                <span
                  aria-hidden
                  className={cn(
                    "block shrink-0 rounded-pill border transition-all duration-300 ease-smooth",
                    isActive ? "border-accent-violet" : "border-border-subtle",
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
                />
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
        className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill glass-surface text-center shadow-glow sm:h-28 sm:w-28 lg:h-32 lg:w-32"
      >
        <span className="px-3 font-mono text-eyebrow uppercase text-text-primary">
          AI Engineer
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
            <p className="mt-1 font-mono text-xs text-accent-violet-text">
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
