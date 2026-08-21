"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { MagneticWrapper } from "@/components/effects/MagneticWrapper";
import { RadialOrbs } from "@/components/effects/RadialOrbs";
import { TiltCard } from "@/components/effects/TiltCard";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { iconMap } from "@/components/ui/icons";
import { services } from "@/content/data";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Bento sizing. Four services over a three-column grid: the first and last span two columns,
 * so the row rhythm is 2+1 / 1+2 rather than a plain 2×2 block. At tablet width it drops to
 * two equal columns — deliberately not a single column, which would waste the width.
 */
const bentoSpan = ["lg:col-span-2", "lg:col-span-1", "lg:col-span-1", "lg:col-span-2"];

export function Services() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="relative overflow-hidden py-section"
    >
      <RadialOrbs tone="cool" />

      <Container className="relative">
        {/* Heading wording comes from `CONTENT_BRIEF.md`'s own section title
            ("Services / What I Do"). No invented marketing copy — `CLAUDE.md` §1. */}
        <SectionHeading id="services-heading" eyebrow="Services" accent="do" sparkle>
          What I
        </SectionHeading>

        <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon];

            return (
              <motion.li
                key={service.id}
                className={cn("list-none", bentoSpan[index])}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
                whileInView={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: reducedMotion ? 0.2 : 0.6,
                  delay: reducedMotion ? 0 : index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <MagneticWrapper className="block h-full w-full" maxTravel={6} radius={220}>
                  <TiltCard className="w-full">
                    <GlassCard
                      interactive
                      as="article"
                      className="card-spotlight group relative h-full overflow-hidden p-8"
                      // Focusable so keyboard users reach the card and get the static
                      // focus treatment `GlassCard` provides in place of tilt/spotlight.
                      tabIndex={0}
                      aria-labelledby={`${service.id}-title`}
                    >
                      {Icon ? (
                        <span
                          data-depth="near"
                          className="mb-6 inline-flex rounded-card border border-border-subtle bg-bg-surface p-3 text-accent-violet-text transition-transform duration-500 ease-smooth group-hover:rotate-6 group-hover:scale-110 motion-reduce:transform-none"
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
                    </GlassCard>
                  </TiltCard>
                </MagneticWrapper>
              </motion.li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
