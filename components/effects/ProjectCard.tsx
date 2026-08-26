"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { Badge } from "@/components/ui/Badge";
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { Project } from "@/content/data";
import { usePointerEffectsEnabled, useReducedMotion } from "@/lib/hooks";

interface ProjectCardProps {
  project: Project;
  index: number;
}

/** How far the image may drift toward the cursor, in pixels. A follow, not a drag. */
const PARALLAX_TRAVEL = 14;

/**
 * A project card with the reveal choreography from `DESIGN_SYSTEM.md`.
 *
 * **On scroll into view** (Framer Motion — a one-time entrance, not scroll-scrubbed): the
 * image starts slightly zoomed under a dark overlay, the overlay fades out, the title slides
 * in, and the tech tags stagger in after it. Sequenced with `delayChildren`/`staggerChildren`
 * on one parent variant rather than four hand-tuned delays.
 *
 * **On hover, desktop only:** the image shifts a little toward the cursor within the card
 * bounds. Gated behind `usePointerEffectsEnabled`, so there is no hover-parallax listener at
 * all on touch or under reduced motion.
 */
export function ProjectCard({ project, index }: ProjectCardProps) {
  const reducedMotion = useReducedMotion();
  const pointerEffects = usePointerEffectsEnabled();
  const frame = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const imageX = useSpring(x, { stiffness: 150, damping: 20, mass: 0.5 });
  const imageY = useSpring(y, { stiffness: 150, damping: 20, mass: 0.5 });

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerEffects || !frame.current) return;
    const bounds = frame.current.getBoundingClientRect();
    // -1..1 across each axis, so the travel is symmetric about the centre.
    const ratioX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const ratioY = (event.clientY - bounds.top) / bounds.height - 0.5;
    x.set(ratioX * PARALLAX_TRAVEL * 2);
    y.set(ratioY * PARALLAX_TRAVEL * 2);
  };

  const resetParallax = () => {
    x.set(0);
    y.set(0);
  };

  const container = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: reducedMotion ? 0 : 0.1,
        staggerChildren: reducedMotion ? 0 : 0.08,
      },
    },
  };

  const fadeUp = {
    hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reducedMotion ? 0.2 : 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  } as const;

  return (
    <motion.article
      className="group relative"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      {/* Phase 12, Skills -> Projects: a node-and-line connector echoing the skill
          ecosystem's hub-and-spoke language. `SectionTransitions` scrubs these in, staggered,
          as the grid is approached. Authored fully drawn, so under reduced motion (where that
          ScrollTrigger is never created) it simply renders as a static connector. */}
      <span aria-hidden className="flex flex-col items-center">
        <span className="h-1.5 w-1.5 rounded-pill bg-accent-violet" />
        <span
          data-card-connector
          className="h-6 w-px origin-top bg-primary"
        />
      </span>

      <Link
        href={`/projects/${project.slug}`}
        data-cursor-label="VIEW"
        className="block rounded-panel focus-visible:outline-none"
        aria-labelledby={`${project.slug}-title`}
      >
        <div
          ref={frame}
          onPointerMove={handlePointerMove}
          onPointerLeave={resetParallax}
          className="relative aspect-square overflow-hidden rounded-panel border border-border-subtle transition-colors duration-500 ease-smooth group-hover:border-border-hover group-focus-within:border-border-hover"
        >
          {/* The image itself drifts toward the cursor; the frame stays put. */}
          <motion.div
            className="absolute inset-0"
            style={pointerEffects ? { x: imageX, y: imageY, scale: 1.06 } : undefined}
            variants={{
              hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.14 },
              visible: {
                opacity: 1,
                scale: pointerEffects ? 1.06 : 1,
                transition: { duration: reducedMotion ? 0.2 : 0.9, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            <MediaFrame
              image={project.cardImage}
              pendingLabel="Image pending"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="h-full w-full"
              // Keeps the placeholder clear of the title block at the card's bottom edge.
              pendingClassName="pb-24"
            />
          </motion.div>

          {/* Dark overlay that fades out as the card enters view. */}
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-bg-base"
            variants={{
              hidden: { opacity: 0.85 },
              visible: {
                opacity: 0,
                transition: { duration: reducedMotion ? 0.2 : 0.8, ease: "easeOut" },
              },
            }}
          />

          {/* An analysis pass over the image while the card is hovered or focused — the
              same reading the hero portrait's reveal gives, at card scale. Authored paused;
              the `.group:hover` rule starts it, so an idle grid animates nothing. */}
          <span aria-hidden className="scan-line" />

          {/* Keeps the title legible over any image. */}
          <div aria-hidden className="project-scrim absolute inset-0" />

          <motion.div className="absolute inset-x-0 bottom-0 p-6" variants={fadeUp}>
            <div className="flex items-start justify-between gap-4">
              <h3
                id={`${project.slug}-title`}
                className="text-xl font-semibold text-text-primary sm:text-2xl"
              >
                {project.title}
              </h3>
              <ArrowUpRight
                aria-hidden
                className="mt-1 h-5 w-5 shrink-0 text-text-secondary transition-all duration-300 ease-smooth group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-violet-text motion-reduce:transform-none"
              />
            </div>
          </motion.div>
        </div>
      </Link>

      <motion.p variants={fadeUp} className="mt-4 text-sm leading-relaxed text-text-secondary">
        {project.pitch}
      </motion.p>

      <motion.ul variants={container} className="mt-4 flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <motion.li key={tech} variants={fadeUp}>
            <Badge>{tech}</Badge>
          </motion.li>
        ))}
      </motion.ul>

      <span className="sr-only">Project {index + 1}</span>
    </motion.article>
  );
}
