import { ArrowRight, Mail } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";

import { HeroPortraitReveal } from "@/components/effects/HeroPortraitReveal";
import { MagneticWrapper } from "@/components/effects/MagneticWrapper";
import { Typewriter } from "@/components/effects/Typewriter";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GradientText } from "@/components/ui/GradientText";
import { identity } from "@/content/data";

/**
 * The hero has **no scroll animation** — removed at Abdul's request. It previously pinned and
 * scrubbed its content down into the top-left corner (`HeroChoreography`, Phase 11's flagship
 * moment), which is why this section used to be wrapped in a client component at all. With the
 * pin gone the wrapper had nothing left to do, so the section is inlined here and the component
 * deleted: one fewer client component, and no GSAP on the page's LCP element.
 *
 * Stagger for the entrance. The `.rise-in` class is a CSS animation, not Framer Motion —
 * see the note on `.rise-in` in `tailwind.config.ts` and the decision log in `PROGRESS.md`:
 * a Framer entrance would server-render `opacity: 0` onto the page's LCP element.
 *
 * A consequence worth keeping: this section stays a **Server Component**. Only the pieces
 * that genuinely need the client (the canvas, the typewriter, the magnetic wrappers) are
 * client components.
 */
const rise = (index: number): CSSProperties => ({
  // Kept small on purpose — every 10ms here lands directly on LCP. See the note on
  // `.rise-in` in `tailwind.config.ts`.
  animationDelay: `${0.04 * index}s`,
});

const [firstName, ...restOfName] = identity.fullName.split(" ");

export function Hero() {
  const portrait = identity.portraitCutout;
  const robotic = identity.portraitRobotic;

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      <Container className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-hero lg:gap-8">
          <div className="flex flex-col items-start">
            <p
              style={rise(0)}
              className="rise-in font-mono text-eyebrow uppercase text-accent-violet-text"
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
              className="rise-in mt-8 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg"
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

          {/* Portrait. Hidden below `lg`: at narrow widths it would either crowd the copy or
              shrink to a thumbnail, and it costs bandwidth on exactly the devices least able
              to spare it. `sizes` reflects that, so phones never download it. */}
          {portrait ? (
            <div
              data-hero-portrait
              className="relative hidden h-full w-full items-end justify-self-end lg:flex"
            >
              {/* Violet bloom behind the subject, so the cutout sits in light rather than
                  floating on flat black. */}
              <div aria-hidden className="ambient-orb ambient-orb-hero bg-accent-violet" />

              <div
                style={rise(2)}
                className="rise-in relative aspect-portrait w-full max-w-lg"
              >
                <Image
                  src={portrait.src}
                  alt={portrait.alt}
                  fill
                  // Above the fold, and the likely LCP element on desktop.
                  priority
                  sizes="(min-width: 1024px) 42vw, 1px"
                  className="hero-portrait object-contain object-right-bottom"
                />

                {/* The AI version of the same portrait, scanned into view under the cursor.
                    Layered over the photo at identical geometry — same `fill`, same
                    `object-contain object-right-bottom` — so the two register exactly; anything
                    else would show the robot's features sliding against the photograph's.
                    `HeroPortraitReveal`'s silhouette mask mirrors this object-position, so the
                    three have to be changed together.

                    Not `priority`: the normal photo is the LCP element and this must not
                    compete with it for bandwidth. It renders nothing at all on touch devices
                    and under reduced motion. */}
                {robotic ? (
                  <HeroPortraitReveal>
                    <Image
                      src={robotic.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 42vw, 1px"
                      className="hero-portrait object-contain object-right-bottom"
                    />
                  </HeroPortraitReveal>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
