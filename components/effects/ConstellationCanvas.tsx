"use client";

import { useEffect, useRef } from "react";

import { useReducedMotion } from "@/lib/hooks";
import { palette, withAlpha } from "@/lib/tokens";
import { cn } from "@/lib/utils";

export interface ConstellationConfig {
  /** Particle count at a ~1440px-wide viewport. Scaled down on smaller screens. */
  particleCount?: number;
  /** Two particles closer than this (in px) get a connecting line. */
  connectionDistance?: number;
  /** Node radius range, in px. */
  minRadius?: number;
  maxRadius?: number;
  /** Drift speed, in px per frame at 60fps. */
  speed?: number;
  /** Node fill colour. Defaults to the primary violet accent. */
  nodeColor?: string;
  /** Connecting line colour. */
  lineColor?: string;
  /** Glow radius on nodes, in px. `0` disables the glow (cheaper). */
  glow?: number;
  /**
   * How far the whole field shifts with the pointer, as a fraction of the pointer's offset
   * from centre. `0` disables the parallax.
   */
  parallaxStrength?: number;
  /**
   * How strongly nodes are pulled toward the pointer, and how far that reaches (px).
   * `0` disables attraction — the hero field uses parallax only, the portrait config uses
   * this for a pronounced reaction directly over the image.
   */
  attractStrength?: number;
  attractRadius?: number;
  /** Cap on particle count for narrow viewports. */
  mobileParticleCount?: number;
}

interface ConstellationCanvasProps extends ConstellationConfig {
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  /** Current pointer-attraction displacement, eased toward the target each frame. */
  ox: number;
  oy: number;
}

const DEFAULTS = {
  particleCount: 70,
  connectionDistance: 130,
  minRadius: 0.8,
  maxRadius: 2.2,
  speed: 0.18,
  glow: 6,
  parallaxStrength: 0.02,
  attractStrength: 0,
  attractRadius: 140,
  mobileParticleCount: 28,
} as const;

/**
 * The one constellation implementation for the whole site — a hand-rolled 2D `<canvas>`, not
 * Three.js/R3F (`CLAUDE.md` §2).
 *
 * Everything that differs between contexts is a prop, because this component is used three
 * times with three different configurations and a second implementation is the failure mode
 * to avoid:
 *
 * - **Hero-ambient** (Phase 5): a loose field, parallax only.
 * - **Portrait-tied** (Phase 6): a tighter, denser, glowing cluster whose nodes pull toward
 *   the cursor and whose lines brighten.
 * - **Skills ecosystem** (Phase 10): the same line-connection rendering around a centre node.
 *
 * Performance and accessibility rules it enforces on every consumer:
 * - particle count scales down on small viewports,
 * - the `requestAnimationFrame` loop stops on `document.visibilitychange` and on unmount,
 * - under `prefers-reduced-motion` it renders **one static frame and never starts a loop**.
 */
export default function ConstellationCanvas({
  className,
  ...config
}: ConstellationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  // Config is read inside the effect. Keeping it in a ref (updated in its own effect, not
  // during render) means a parent re-rendering with an equivalent inline config object does
  // not tear down and re-seed the whole particle field.
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const settings = { ...DEFAULTS, ...configRef.current };
    const nodeColor = settings.nodeColor ?? palette["accent-violet"];
    const lineColor = settings.lineColor ?? palette["accent-indigo"];

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;

    // Pointer state, in canvas-local coordinates. `-1` means "pointer is not over us".
    let pointerX = -1;
    let pointerY = -1;
    let parallaxX = 0;
    let parallaxY = 0;

    const random = (min: number, max: number) => min + Math.random() * (max - min);

    const resolveCount = () => {
      const base =
        width < 640
          ? settings.mobileParticleCount
          : Math.round(settings.particleCount * Math.min(1, width / 1440));
      // Never fewer than a handful, or the "constellation" reads as a few stray dots.
      return Math.max(12, base);
    };

    const seed = () => {
      particles = Array.from({ length: resolveCount() }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: random(-settings.speed, settings.speed),
        vy: random(-settings.speed, settings.speed),
        radius: random(settings.minRadius, settings.maxRadius),
        ox: 0,
        oy: 0,
      }));
      // Exposed so the resolved (viewport-scaled) count can be asserted from outside —
      // "particle count scales down on smaller viewports" is a stated requirement, and this
      // is the only way to check it without guessing from pixels.
      canvas.dataset.particles = String(particles.length);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      seed();
      if (reducedMotion) draw();
    };

    const step = () => {
      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap rather than bounce: bouncing makes the field visibly "breathe" against the
        // edges, which reads as motion rather than ambience.
        if (particle.x < 0) particle.x += width;
        if (particle.x > width) particle.x -= width;
        if (particle.y < 0) particle.y += height;
        if (particle.y > height) particle.y -= height;

        let targetOx = 0;
        let targetOy = 0;
        if (settings.attractStrength > 0 && pointerX >= 0) {
          const dx = pointerX - particle.x;
          const dy = pointerY - particle.y;
          const distance = Math.hypot(dx, dy);
          if (distance < settings.attractRadius && distance > 0.001) {
            const falloff = 1 - distance / settings.attractRadius;
            targetOx = dx * falloff * settings.attractStrength;
            targetOy = dy * falloff * settings.attractStrength;
          }
        }
        particle.ox += (targetOx - particle.ox) * 0.08;
        particle.oy += (targetOy - particle.oy) * 0.08;
      }

      if (settings.parallaxStrength > 0) {
        const targetX =
          pointerX >= 0 ? (pointerX - width / 2) * settings.parallaxStrength : 0;
        const targetY =
          pointerY >= 0 ? (pointerY - height / 2) * settings.parallaxStrength : 0;
        parallaxX += (targetX - parallaxX) * 0.05;
        parallaxY += (targetY - parallaxY) * 0.05;
      }
    };

    function draw() {
      if (!context) return;
      context.clearRect(0, 0, width, height);

      const pointerActive = pointerX >= 0;

      // Lines first, so nodes sit on top of them.
      context.lineWidth = 1;
      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        const ax = a.x + a.ox + parallaxX;
        const ay = a.y + a.oy + parallaxY;

        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const bx = b.x + b.ox + parallaxX;
          const by = b.y + b.oy + parallaxY;
          const distance = Math.hypot(ax - bx, ay - by);
          if (distance > settings.connectionDistance) continue;

          // Opacity falls off with distance, so the mesh fades out rather than snapping.
          let alpha = (1 - distance / settings.connectionDistance) * 0.5;
          if (pointerActive && settings.attractStrength > 0) alpha *= 1.6;

          context.strokeStyle = withAlpha(lineColor, Math.min(alpha, 0.9));
          context.beginPath();
          context.moveTo(ax, ay);
          context.lineTo(bx, by);
          context.stroke();
        }
      }

      context.shadowBlur = settings.glow;
      context.shadowColor = withAlpha(nodeColor, 0.8);
      for (const particle of particles) {
        context.fillStyle = withAlpha(nodeColor, 0.85);
        context.beginPath();
        context.arc(
          particle.x + particle.ox + parallaxX,
          particle.y + particle.oy + parallaxY,
          particle.radius,
          0,
          Math.PI * 2,
        );
        context.fill();
      }
      context.shadowBlur = 0;
    }

    const loop = () => {
      step();
      draw();
      frame = window.requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reducedMotion) return;
      running = true;
      frame = window.requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      window.cancelAnimationFrame(frame);
    };

    // Pause when the tab is hidden — an off-screen rAF loop is pure battery cost.
    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
    };

    const onPointerLeave = () => {
      pointerX = -1;
      pointerY = -1;
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    document.addEventListener("visibilitychange", onVisibilityChange);

    if (!reducedMotion) {
      // Pointer tracking is listener-only work, but it is still pointless under reduced
      // motion where nothing may react to it.
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("pointerleave", onPointerLeave);
      start();
    } else {
      draw();
    }

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      data-constellation
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}
