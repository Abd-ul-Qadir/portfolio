import { identity } from "@/content/data";

/**
 * Phase 1 shell — real copy from `content/data.ts`, deliberately static.
 * Phase 5 adds the cinematic entrance, the hero-ambient constellation, magnetic CTAs and
 * the typewriter role line (which cycles all of `identity.roles`).
 */
export function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-24"
    >
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-violet">
        {identity.roles[0]}
      </p>
      <h1
        id="hero-heading"
        className="mt-4 text-5xl font-semibold tracking-tight text-text-primary sm:text-7xl"
      >
        {identity.fullName}
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary">
        {identity.tagline}
      </p>
    </section>
  );
}
