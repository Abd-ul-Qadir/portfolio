"use client";

import { motion } from "framer-motion";
import { useId, useState } from "react";

import { coreSkills, skillGroups } from "@/content/data";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * The floating AI ecosystem from `DESIGN_SYSTEM.md`.
 *
 * **Explicitly not progress bars and not cards** — the old portfolio's linear percentage bars
 * are retired. A centred `AI ENGINEER` node with the skill nodes orbiting it, each connected
 * back to the centre by a thin line, sharing the constellation's visual language.
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
// The two orbits also have to clear *each other*. The labels hang below their circles, so a
// long core-skill name reaches down into whatever the outer orbit has nearby: at 0.36/0.48
// "Python, Django & FastAPI" overlapped "Frontend" by 47x31px and "HTML, CSS & JS" overlapped
// "Data / AI-ML" by 112x21px, both measured. Pulling the orbits apart is what fixes that;
// widening the buttons below (so long names wrap onto fewer lines) is the other half.
const ORBIT = { core: 0.32, outer: 0.53 };

interface EcosystemNode {
  id: string;
  label: string;
  /** 0–100 for the four scored skills; `null` for the unscored stack groups. */
  proficiency: number | null;
  angle: number;
  radius: number;
}

function buildNodes(): EcosystemNode[] {
  // Core skills sit on the inner orbit, evenly spaced.
  const core = coreSkills.map((skill, index) => ({
    id: skill.id,
    label: skill.name,
    proficiency: skill.proficiency,
    angle: (index / coreSkills.length) * Math.PI * 2 - Math.PI / 2,
    radius: ORBIT.core,
  }));

  // The unscored stack groups sit further out, offset so they interleave with the core nodes
  // rather than hiding directly behind them.
  const groups = skillGroups.map((group, index) => ({
    id: group.id,
    label: group.label,
    proficiency: null,
    angle:
      (index / skillGroups.length) * Math.PI * 2 -
      Math.PI / 2 +
      Math.PI / skillGroups.length,
    radius: ORBIT.outer,
  }));

  return [...core, ...groups];
}

const nodes = buildNodes();

/** Maps proficiency to a node diameter in rem — size carries the number, not a bar. */
function nodeSize(proficiency: number | null) {
  if (proficiency === null) return 2;
  // 80% → 2.75rem, 95% → 4.25rem. A 55% diameter spread across the range, which reads as a
  // clear difference without the largest node crowding its neighbours.
  return 2.75 + ((proficiency - 80) / 15) * 1.5;
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
function nodeGlow(proficiency: number | null, isActive: boolean) {
  if (isActive) {
    return `0 0 44px color-mix(in srgb, var(--accent-violet) 60%, transparent)`;
  }
  if (proficiency === null) {
    return `0 0 14px color-mix(in srgb, var(--accent-violet) 12%, transparent)`;
  }
  const t = (proficiency - 80) / 15;
  const blur = Math.round(18 + t * 24);
  const strength = Math.round(24 + t * 26);
  return `0 0 ${blur}px color-mix(in srgb, var(--accent-violet) ${strength}%, transparent)`;
}

export function SkillEcosystem() {
  const reducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);
  const gradientId = useId();

  const active = nodes.find((node) => node.id === activeId) ?? null;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-2xl">
      {/* Connecting lines back to the centre. Decorative — every node they connect is a
          real labelled control in the DOM below. */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent-violet)" />
            <stop offset="100%" stopColor="var(--accent-cyan)" />
          </linearGradient>
        </defs>
        {nodes.map((node) => {
          const x = 50 + Math.cos(node.angle) * node.radius * 100;
          const y = 50 + Math.sin(node.angle) * node.radius * 100;
          const isActive = activeId === node.id;
          return (
            <line
              key={node.id}
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke={`url(#${gradientId})`}
              strokeWidth={isActive ? 0.6 : 0.25}
              // Opacity falls off for the outer orbit, the same way the constellation's
              // lines fade with distance.
              opacity={isActive ? 0.9 : node.proficiency === null ? 0.25 : 0.45}
              className={cn(
                "transition-all duration-500 ease-smooth",
                // Matches the node it points at — see the `<li>` below.
                node.proficiency === null && "hidden sm:block",
              )}
            />
          );
        })}
      </svg>

      {/* The centre node. */}
      <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill glass-surface text-center shadow-glow sm:h-28 sm:w-28 lg:h-32 lg:w-32">
        <span className="px-3 font-mono text-eyebrow uppercase text-text-primary">
          AI Engineer
        </span>
      </div>

      {/* Orbiting skill nodes. */}
      <ul className="contents">
        {nodes.map((node, index) => {
          const x = 50 + Math.cos(node.angle) * node.radius * 100;
          const y = 50 + Math.sin(node.angle) * node.radius * 100;
          const size = nodeSize(node.proficiency);
          const isActive = activeId === node.id;

          return (
            <li
              key={node.id}
              className={cn(
                "absolute -translate-x-1/2",
                // Below `sm` the outer orbit's labels collide with the core ones. The group
                // nodes are dropped there rather than shrunk into illegibility — every one of
                // them is already listed in full in the tag list below this ecosystem, so
                // nothing is lost. `CLAUDE.md` §4 expects this kind of mobile simplification.
                node.proficiency === null && "hidden sm:block",
              )}
              // The connecting lines end at the orbit point, and the circle — not the
              // button's centre — is what should sit there. The label hangs below it, so the
              // button is pulled up by half the circle's diameter.
              style={{ left: `${x}%`, top: `${y}%`, marginTop: `-${size / 2}rem` }}
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
                // Gentle, continuous float — the one piece of ambient motion here, and it
                // stops entirely under reduced motion.
                animate={
                  reducedMotion
                    ? undefined
                    : { y: [0, index % 2 === 0 ? -8 : 8, 0] }
                }
                transition={
                  reducedMotion
                    ? undefined
                    : {
                        duration: 6 + (index % 4),
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.35,
                      }
                }
              >
                {/* The circle is the node: its diameter and glow carry the proficiency.
                    The label sits outside it, so a long skill name can never overflow it. */}
                <span
                  aria-hidden
                  className={cn(
                    "block shrink-0 rounded-pill border transition-all duration-300 ease-smooth",
                    isActive
                      ? "border-accent-violet bg-bg-surface"
                      : "border-border-subtle bg-bg-glass",
                  )}
                  // The glow is inline rather than a `shadow-*` class because its strength is
                  // a function of this node's proficiency, which Tailwind cannot express as a
                  // static utility. An inline `boxShadow` would also silently win over a
                  // class-based one, so the active state is folded into the same ramp instead
                  // of being layered on top of it.
                  style={{
                    width: `${size}rem`,
                    height: `${size}rem`,
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
            </li>
          );
        })}
      </ul>

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
