import { Check } from "lucide-react";

import { MagneticWrapper } from "@/components/effects/MagneticWrapper";
import { TiltCard } from "@/components/effects/TiltCard";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { iconMap } from "@/components/ui/icons";
import { services } from "@/content/data";
import { cn } from "@/lib/utils";

/**
 * Bento sizing. Four services over a three-column grid: the first and last span two columns,
 * so the row rhythm is 2+1 / 1+2 rather than a plain 2×2 block. At tablet width it drops to
 * two equal columns — deliberately not a single column, which would waste the width.
 */
const bentoSpan = ["lg:col-span-2", "lg:col-span-1", "lg:col-span-1", "lg:col-span-2"];

export function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="relative overflow-hidden py-section"
    >

      <Container className="relative" data-section-inner>
        {/* Heading wording comes from `CONTENT_BRIEF.md`'s own section title
            ("Services / What I Do"). No invented marketing copy — `CLAUDE.md` §1. */}
        <SectionHeading id="services-heading" eyebrow="Services" accent="do" sparkle>
          What I
        </SectionHeading>

        <ul data-stagger-group className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon];

            return (
              <li
                key={service.id}
                data-scroll-reveal
                data-scroll-delay={String((index % 2) * 80)}
                className={cn("list-none", bentoSpan[index])}
              >
                <MagneticWrapper className="block h-full w-full" maxTravel={6} radius={220}>
                  <TiltCard className="w-full">
                    <GlassCard
                      interactive
                      as="article"
                      className="card-spotlight group relative flex h-full flex-col overflow-hidden p-8"
                      // Focusable so keyboard users reach the card and get the static
                      // focus treatment `GlassCard` provides in place of tilt/spotlight.
                      tabIndex={0}
                      aria-labelledby={`${service.id}-title`}
                    >
                      {Icon ? (
                        <span
                          data-depth="near"
                          // `self-start` is load-bearing: the card is a flex column (so the
                          // stack row can be pinned to its foot), and a flex item defaults to
                          // `align-self: stretch` — which silently pulled this badge across the
                          // full width of the card, turning a 48px tile into a full-width bar.
                          className="mb-6 inline-flex self-start rounded-card border border-border-subtle bg-bg-surface p-3 text-accent-violet-text transition-transform duration-500 ease-smooth group-hover:rotate-6 group-hover:scale-110 motion-reduce:transform-none"
                        >
                          <Icon aria-hidden className="h-6 w-6" />
                        </span>
                      ) : null}

                      <h3
                        id={`${service.id}-title`}
                        data-depth="far"
                        className="text-xl font-semibold text-text-primary"
                      >
                        {service.title}
                      </h3>

                      <p
                        data-depth="far"
                        className="mt-3 text-sm leading-relaxed text-text-secondary"
                      >
                        {service.description}
                      </p>

                      {service.points.length > 0 ? (
                        <ul className="mt-6 flex flex-col gap-2">
                          {service.points.map((point) => (
                            <li
                              key={point}
                              className="flex items-start gap-2 text-sm text-text-secondary"
                            >
                              <Check
                                aria-hidden
                                className="mt-0.5 h-4 w-4 shrink-0 text-accent-emerald"
                              />
                              {point}
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {/* Stack, pinned to the foot of the card.

                          `mt-auto` on a flex column is what makes the four cards agree: the
                          bento gives them different heights and different amounts of copy, so
                          without it each stack row floats at whatever height its own text ends,
                          and the grid reads as ragged. Pushed to the bottom they line up as a
                          band across the section.

                          The wrapper is not redundant: `mt-auto` collapses to zero on a card
                          whose copy already fills the height, which would leave the rule welded
                          to the last bullet. The outer `pt-6` is the guaranteed gap above it,
                          the inner one the gap below.

                          The rule is a border rather than an `<hr>`: it separates two lists that
                          are both already semantic, so a screen reader gains nothing from a
                          second landmark. */}
                      {service.stack.length > 0 ? (
                        <div className="mt-auto pt-6">
                          <ul className="flex flex-wrap gap-2 border-t border-border-subtle pt-6">
                            {service.stack.map((tech) => (
                              <li key={tech}>
                                <Badge>{tech}</Badge>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </GlassCard>
                  </TiltCard>
                </MagneticWrapper>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
