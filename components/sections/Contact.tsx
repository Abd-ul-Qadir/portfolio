"use client";

import { MagneticWrapper } from "@/components/effects/MagneticWrapper";
import { Reveal } from "@/components/effects/Reveal";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { iconMap } from "@/components/ui/icons";
import { contact, identity } from "@/content/data";

/**
 * Contact, themed as a terminal.
 *
 * `contact.formEnabled` is still `false` — `CONTENT_BRIEF.md` ends by asking whether a working
 * message form is wanted (it needs a backend: Resend or a serverless function) or just the
 * three direct links, and that has not been answered. `PHASE_PLAN.md` Phase 10 says to ship
 * the three links and flag the form rather than guess, so that is what this does. When the
 * answer arrives, flip the flag in `content/data.ts` and build the form here — the
 * `CLAUDE.md` §4 rule applies then: semantic `<label>`s, keyboard-operable, screen-reader
 * announced validation. The terminal look is a skin over a real form, never a replacement.
 *
 * Everything below is real, linked content: the prompt line is decorative
 * (`aria-hidden`), and each contact method is a genuine `mailto:` / `tel:` / profile link.
 */
export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative overflow-hidden py-section"
    >

      <Container className="relative" data-section-inner>
        <SectionHeading
          id="contact-heading"
          eyebrow="Get in touch"
          accent="something great"
          description={contact.supportingLine}
        >
          Let&apos;s build
        </SectionHeading>

        <Reveal
          className="mt-12 overflow-hidden rounded-panel glass-surface shadow-elevated"
          amount={0.3}
        >
          {/* Terminal chrome. Purely decorative. */}
          <div
            aria-hidden
            className="flex items-center gap-2 border-b border-border-subtle px-5 py-3"
          >
            <span className="h-3 w-3 rounded-pill bg-accent-pink" />
            <span className="h-3 w-3 rounded-pill bg-accent-violet" />
            <span className="h-3 w-3 rounded-pill bg-accent-emerald" />
            <span className="ml-3 font-mono text-xs text-text-secondary">
              contact — zsh
            </span>
          </div>

          <div className="p-6 sm:p-8">
            <p aria-hidden className="font-mono text-sm text-text-secondary">
              <span className="text-accent-emerald">$</span> connect --with{" "}
              <span className="text-text-primary">AbdulQadir</span>
              <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-caret-blink bg-accent-violet motion-reduce:animate-none" />
            </p>

            <ul data-stagger-group className="mt-8 flex flex-col gap-4">
              {contact.methods.map((method) => {
                const Icon = iconMap[method.icon];
                return (
                  <li key={method.id}>
                    <MagneticWrapper className="w-full" maxTravel={4} radius={140}>
                      <a
                        href={method.href}
                        data-cursor-label="OPEN"
                        className="group flex w-full items-center gap-4 rounded-card border border-border-subtle px-4 py-4 transition-all duration-300 ease-smooth hover:border-border-hover hover:shadow-glow focus-visible:border-border-hover focus-visible:shadow-glow"
                        {...(method.id === "linkedin"
                          ? { target: "_blank", rel: "noreferrer noopener" }
                          : {})}
                      >
                        {Icon ? (
                          <Icon
                            aria-hidden
                            className="h-5 w-5 shrink-0 text-accent-violet-text"
                          />
                        ) : null}
                        <span className="min-w-0">
                          <span className="block font-mono text-eyebrow uppercase text-text-secondary">
                            {method.label}
                          </span>
                          <span className="mt-1 block truncate font-mono text-sm text-text-primary">
                            {method.value}
                          </span>
                        </span>
                      </a>
                    </MagneticWrapper>
                  </li>
                );
              })}
            </ul>

            {contact.formEnabled ? null : (
              <p className="mt-8 font-mono text-xs text-text-secondary">
                <span className="text-accent-emerald">$</span> Prefer email? {identity.email}
              </p>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
