import { SystemInterface } from "@/components/effects/SystemInterface";
import { ScrollRevealText } from "@/components/effects/ScrollRevealText";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { identity } from "@/content/data";

/**
 * About: the bio, and the AI system interface that reads it back as an instrument panel.
 *
 * **The copy column comes first in the DOM, deliberately.** Reading order and the stacked mobile
 * order are therefore heading → text → visual, which is the hierarchy this section is meant to
 * have; `lg:order-*` puts the composition back on the right at desktop width without changing
 * that order for a screen reader or a phone. The visual supports the copy — it never precedes it.
 *
 * The portrait and every module inside `SystemInterface` are driven from `content/data.ts`, so
 * nothing in the visual can drift out of step with the rest of the site.
 */
export function About() {
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

        <div className="mt-16 grid items-center gap-14 lg:grid-cols-about-reversed lg:gap-16">
          <div className="flex flex-col gap-8 lg:order-1">
            <ScrollRevealText text={identity.bio} />

            <dl
              data-scroll-reveal
              data-scroll-delay="70"
              className="grid grid-cols-2 gap-6 border-t border-border-subtle pt-8 sm:grid-cols-3"
            >
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

            <div data-scroll-reveal data-scroll-delay="130" className="flex flex-wrap gap-2">
              <Badge tone="accent">{identity.location}</Badge>
              <Badge>Available for work</Badge>
            </div>
          </div>

          <div data-scroll-reveal="right" className="lg:order-2">
            <SystemInterface />
          </div>
        </div>
      </Container>
    </section>
  );
}
