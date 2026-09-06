import { ContactOrbs } from "@/components/effects/ContactOrbs";
import { ContactForm } from "@/components/sections/ContactForm";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { contact, identity } from "@/content/data";

/**
 * Contact: the message form in a compact terminal window, with the four contact nodes as orbs
 * beneath it.
 *
 * **What changed and why.** This used to be one large terminal holding a `$ connect --with`
 * prompt, three full-width rows for email/phone/LinkedIn, a résumé row and *then* the form. The
 * links were the loudest thing in the section while being the secondary path, and the terminal
 * had grown to fill the section — the shell chrome stopped being a frame and became the design.
 * The terminal now wraps the form and nothing else, and the links are `ContactOrbs`.
 *
 * **The links still do not depend on the form working.** They are plain anchors — `mailto:`,
 * `tel:` and two profiles — so they work with JavaScript off, with a missing `RESEND_API_KEY`
 * and with the mail provider down. That was the reason for keeping both, and it is unchanged.
 *
 * `#contact` and `data-section-inner` are untouched: `SectionTransitions` scrubs the
 * Projects → Contact darkening off this section, and the field's scroll story reads the inner
 * container. Neither is affected by anything below.
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

        {/* The terminal is now a frame around the form, and is sized like one: capped and
            centred rather than spanning the section. */}
        <div
          data-scroll-reveal="scale"
          className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-panel glass-surface shadow-elevated"
        >
          {/* Terminal chrome. Purely decorative, and deliberately the only shell reference
              left — no prompt line, no fake command, no shell output. */}
          <div
            aria-hidden
            className="flex items-center gap-2 border-b border-border-subtle px-5 py-3"
          >
            <span className="h-2.5 w-2.5 rounded-pill bg-accent-pink" />
            <span className="h-2.5 w-2.5 rounded-pill bg-accent-violet" />
            <span className="h-2.5 w-2.5 rounded-pill bg-accent-emerald" />
            <span className="ml-3 font-mono text-xs text-text-secondary">
              contact — zsh
            </span>
          </div>

          <div className="px-6 py-6 sm:px-8">
            {contact.formEnabled ? (
              <ContactForm />
            ) : (
              <p className="font-mono text-xs text-text-secondary">
                <span className="text-accent-emerald">$</span> Prefer email?{" "}
                {identity.email}
              </p>
            )}
          </div>
        </div>

        {/* The four contact nodes. Secondary to the form, and staggered in one by one. */}
        <div className="mx-auto max-w-2xl">
          <ContactOrbs />
        </div>
      </Container>
    </section>
  );
}
