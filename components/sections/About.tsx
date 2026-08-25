import { UserRound } from "lucide-react";
import Image from "next/image";

import { NeuralFieldMount } from "@/components/effects/NeuralFieldMount";
import { ScrollRevealText } from "@/components/effects/ScrollRevealText";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { identity } from "@/content/data";

export function About() {
  const portrait = identity.portrait;

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative overflow-hidden py-section"
    >

      <Container className="relative" data-section-inner>
        <SectionHeading id="about-heading" eyebrow="About" accent="AI Engineer">
          Full Stack
        </SectionHeading>

        <div className="mt-16 grid items-start gap-12 lg:grid-cols-about lg:gap-16">
          {/* Portrait, with the portrait-tied constellation configuration layered over it:
              a much tighter, denser cluster than the hero's field, and — unlike the hero —
              nodes that actively pull toward the cursor. Same component, different props. */}
          <div className="group relative mx-auto w-full max-w-sm lg:mx-0">
            <div className="relative aspect-portrait overflow-hidden rounded-panel glass-surface">
              {portrait ? (
                <Image
                  src={portrait.src}
                  alt={portrait.alt}
                  fill
                  sizes="(min-width: 1024px) 24rem, 100vw"
                  className="object-cover"
                  priority={false}
                />
              ) : (
                // Placeholder holding the exact aspect ratio the real portrait will occupy,
                // so dropping the asset in cannot shift the layout. Set `identity.portrait`
                // in `content/data.ts` and this branch disappears.
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <UserRound aria-hidden className="h-10 w-10 text-text-secondary" />
                  <p className="font-mono text-eyebrow uppercase text-text-secondary">
                    Portrait pending
                  </p>
                </div>
              )}

              {/* The portrait-tied field (Phase 6): the same engine as the site-wide one, at a
                  tighter scale and with a much more pronounced reaction directly over the
                  image — a shorter `linkRadius` against a similar node count makes the mesh
                  visibly denser, and `pullStrength` here is half again the background's.

                  `core` is off and `scrollDrift` is 0 on purpose: this field lives inside a
                  card, so it must not drift out of alignment with the frame, and a second
                  processing core drawn inside the portrait would compete with the one the
                  site-wide field already draws under the cursor. */}
              <NeuralFieldMount
                nodeCount={46}
                mobileNodeCount={26}
                linkRadius={78}
                minRadius={1}
                maxRadius={2.6}
                driftRadius={7}
                influenceRadius={150}
                pullStrength={0.5}
                parallaxDepth={8}
                maxPackets={22}
                touchPackets={8}
                intensity={1.15}
                scrollDrift={0}
                core={false}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="accent">{identity.location}</Badge>
              <Badge>Available for work</Badge>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <ScrollRevealText text={identity.bio} />

            <dl className="grid grid-cols-2 gap-6 border-t border-border-subtle pt-8 sm:grid-cols-3">
              <div>
                <dt className="font-mono text-eyebrow uppercase text-text-secondary">
                  Focus
                </dt>
                <dd className="mt-2 text-text-primary">AI-powered web apps</dd>
              </div>
              <div>
                <dt className="font-mono text-eyebrow uppercase text-text-secondary">
                  Backend
                </dt>
                <dd className="mt-2 text-text-primary">Django · FastAPI</dd>
              </div>
              <div>
                <dt className="font-mono text-eyebrow uppercase text-text-secondary">
                  Frontend
                </dt>
                <dd className="mt-2 text-text-primary">React · React Native</dd>
              </div>
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
