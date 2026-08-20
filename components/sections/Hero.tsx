import { ArrowDown, ArrowRight, Mail } from "lucide-react";
import type { CSSProperties } from "react";

import { ConstellationMount } from "@/components/effects/ConstellationMount";
import { MagneticWrapper } from "@/components/effects/MagneticWrapper";
import { RadialOrbs } from "@/components/effects/RadialOrbs";
import { Typewriter } from "@/components/effects/Typewriter";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GradientText } from "@/components/ui/GradientText";
import { identity } from "@/content/data";

/**
 * Stagger for the entrance. The `.rise-in` class is a CSS animation, not Framer Motion —
 * see the note on `.rise-in` in `tailwind.config.ts` and the decision log in `PROGRESS.md`:
 * a Framer entrance would server-render `opacity: 0` onto the page's LCP element.
 *
 * A consequence worth keeping: this section stays a **Server Component**. Only the pieces
 * that genuinely need the client (the canvas, the typewriter, the magnetic wrappers) are
 * client components.
 */
const rise = (index: number): CSSProperties => ({
  animationDelay: `${0.08 * index}s`,
});

const [firstName, ...restOfName] = identity.fullName.split(" ");

export function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      {/* Hero-ambient: a loose field with pointer parallax and no attraction. The tighter,
          node-attracting configuration of this same component belongs to the About portrait
          (Phase 6), and a third configuration to Skills (Phase 10). */}
      <ConstellationMount
        particleCount={70}
        mobileParticleCount={28}
        connectionDistance={130}
        parallaxStrength={0.02}
        glow={6}
      />
      <RadialOrbs />

      <Container className="relative">
        <div className="flex flex-col items-start">
          <p
            style={rise(0)}
            className="rise-in font-mono text-eyebrow uppercase text-accent-violet"
          >
            {identity.location}
          </p>

          <h1
            id="hero-heading"
            style={rise(1)}
            className="rise-in mt-6 text-display font-semibold text-text-primary"
          >
            {firstName} <GradientText>{restOfName.join(" ")}</GradientText>
          </h1>

          <p
            style={rise(2)}
            className="rise-in mt-4 font-mono text-lg text-text-secondary sm:text-xl"
          >
            <Typewriter phrases={identity.roles} />
          </p>

          <p
            style={rise(3)}
            className="rise-in mt-8 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg"
          >
            {identity.tagline}
          </p>

          <div style={rise(4)} className="rise-in mt-10 flex flex-wrap items-center gap-4">
            <MagneticWrapper>
              <Button href="#projects" cursorLabel="EXPLORE">
                View projects
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Button>
            </MagneticWrapper>
            <MagneticWrapper>
              <Button href="#contact" variant="secondary" cursorLabel="OPEN">
                <Mail aria-hidden className="h-4 w-4" />
                Get in touch
              </Button>
            </MagneticWrapper>
          </div>
        </div>
      </Container>

      <a
        href="#about"
        style={rise(6)}
        aria-label="Scroll to the about section"
        className="rise-in absolute inset-x-0 bottom-8 mx-auto flex w-fit flex-col items-center gap-2 text-text-secondary transition-colors hover:text-text-primary"
      >
        <span className="font-mono text-eyebrow uppercase">Scroll</span>
        <ArrowDown
          aria-hidden
          className="h-4 w-4 animate-arrow-nudge motion-reduce:animate-none"
        />
      </a>
    </section>
  );
}
