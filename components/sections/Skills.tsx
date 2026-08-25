"use client";

import { Reveal } from "@/components/effects/Reveal";
import { SkillEcosystem } from "@/components/effects/SkillEcosystem";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { skillGroups, spokenLanguages } from "@/content/data";

/**
 * Skills.
 *
 * Three layers, in the order `DESIGN_SYSTEM.md` describes them:
 * 1. The floating ecosystem (`SkillEcosystem`) — **not** bars, **not** cards.
 * 2. The broader stack, as a plain tag list, because the brief gives no proficiency for it and
 *    inventing one would be making up content.
 * 3. Spoken languages as circular badges.
 *
 * This section mounts no field of its own: the ambience behind it is the one site-wide
 * `NeuralField` in `SiteBackground`, which the whole page scrolls over.
 */
export function Skills() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="relative overflow-hidden py-section"
    >


      <Container className="relative" data-section-inner>
        <SectionHeading id="skills-heading" eyebrow="Capabilities" accent="ecosystem">
          The
        </SectionHeading>

        <Reveal className="mt-12" amount={0.2}>
          <SkillEcosystem />
        </Reveal>

        {/* The unscored stack. Deliberately a tag list, not bars. */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group) => (
            <div key={group.id}>
              <h3 className="font-mono text-eyebrow uppercase text-text-secondary">
                {group.label}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item}>
                    <Badge>{item}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h3 className="font-mono text-eyebrow uppercase text-text-secondary">Languages</h3>
          <ul className="mt-4 flex flex-wrap gap-4">
            {spokenLanguages.map((language) => (
              <li key={language}>
                <span className="flex h-20 w-20 items-center justify-center rounded-pill border border-border-subtle bg-bg-glass text-center font-mono text-xs text-text-primary">
                  {language}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
