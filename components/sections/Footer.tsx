import { ArrowUp, ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { FramerMotionMark, GitHubMark, GsapMark, InstagramMark, LinkedInMark, NextJsMark, TailwindCssMark, XMark } from "@/components/ui/BrandMarks";
import {
  directContacts,
  identity,
  navItems,
  portfolioStack,
} from "@/content/data";

function SocialMark({ icon }: { icon: string }) {
  const className = "h-4 w-4";

  switch (icon) {
    case "github":
      return <GitHubMark className={className} />;
    case "linkedin":
      return <LinkedInMark className={className} />;
    case "instagram":
      return <InstagramMark className={className} />;
    case "x":
      return <XMark className={className} />;
    default:
      return <ArrowUpRight aria-hidden className={className} />;
  }
}

type PortfolioStackId = (typeof portfolioStack)[number]["id"];

function PortfolioStackMark({ id }: { id: PortfolioStackId }) {
  const className = "h-5 w-5";

  switch (id) {
    case "nextjs":
      return <NextJsMark className={className} />;
    case "tailwind":
      return <TailwindCssMark className={className} />;
    case "gsap":
      return <GsapMark className="h-5 w-8" />;
    case "framer-motion":
      return <FramerMotionMark className={className} />;
  }
}

/**
 * A server-rendered closing console. The richer presentation is semantic HTML and static CSS,
 * so the footer adds no hydration, client state, or runtime listeners.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="group relative overflow-hidden border-t border-border-subtle">
      <span aria-hidden className="signal-bus" />

      <Container className="py-8 sm:py-12">
        <div className="footer-panel overflow-hidden rounded-panel p-6 sm:p-8 lg:p-10">
          <span aria-hidden className="dot-grid mask-radial-fade absolute inset-0 opacity-30" />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -right-8 select-none font-mono text-9xl font-semibold tracking-mark text-text-primary opacity-5"
          >
            {identity.initials}
          </span>

          <div className="relative grid gap-12 lg:grid-cols-3 lg:gap-10">
            <section
              aria-labelledby="footer-identity"
              data-scroll-reveal="left"
              className="min-w-0"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-border-hover bg-bg-glass px-2 font-mono text-xs text-accent-violet-text shadow-glow">
                  {identity.initials}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-border-hover to-transparent" />
              </div>

              <h2
                id="footer-identity"
                className="mt-6 text-3xl font-semibold tracking-tight text-text-primary"
              >
                {identity.fullName}
              </h2>
              <p className="mt-2 font-mono text-xs uppercase tracking-label text-accent-cyan">
                {identity.roles[0]}
              </p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-secondary">
                {identity.tagline}
              </p>
              <p className="mt-5 flex items-center gap-2 text-sm text-text-secondary">
                <MapPin aria-hidden className="h-4 w-4 text-accent-violet-text" />
                {identity.location}
              </p>

              <ul className="mt-6 grid gap-2">
                {directContacts.map((method) => (
                  <li key={method.id}>
                    <a
                      href={method.href}
                      data-cursor-label={method.id === "email" ? "OPEN" : undefined}
                      className="group/contact flex min-w-0 items-center gap-3 rounded-card border border-border-subtle bg-bg-glass px-4 py-3 text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
                    >
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-subtle text-accent-violet-text transition-colors group-hover/contact:border-border-hover">
                        {method.id === "email" ? (
                          <Mail aria-hidden className="h-4 w-4" />
                        ) : (
                          <Phone aria-hidden className="h-4 w-4" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-mono text-micro uppercase tracking-label text-text-secondary">
                          {method.label}
                        </span>
                        <span className="block truncate text-sm text-text-primary">
                          {method.value}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <nav aria-labelledby="footer-sections" data-scroll-reveal data-scroll-delay="80">
              <div className="flex items-center gap-3">
                <h2
                  id="footer-sections"
                  className="font-mono text-eyebrow uppercase text-text-secondary"
                >
                  Sections
                </h2>
                <span className="h-px flex-1 bg-border-subtle" />
              </div>
              <ul className="mt-5 grid grid-cols-2 gap-2">
                {navItems.map((item, index) => (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      className="group/link flex items-center justify-between gap-3 rounded-card border border-transparent px-3 py-3 text-sm text-text-secondary transition-colors hover:border-border-subtle hover:bg-bg-glass hover:text-text-primary"
                    >
                      <span className="flex items-baseline gap-2">
                        <span aria-hidden className="font-mono text-micro text-accent-violet-text">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {item.label}
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        className="h-3.5 w-3.5 text-text-secondary transition-transform duration-300 ease-smooth motion-safe:group-hover/link:-translate-y-0.5 motion-safe:group-hover/link:translate-x-0.5"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <section
              aria-labelledby="footer-socials"
              data-scroll-reveal="right"
              data-scroll-delay="160"
            >
              <div className="flex items-center gap-3">
                <h2
                  id="footer-socials"
                  className="font-mono text-eyebrow uppercase text-text-secondary"
                >
                  Elsewhere
                </h2>
                <span className="h-px flex-1 bg-border-subtle" />
              </div>
              <ul className="mt-5 grid gap-3">
                {identity.socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      data-cursor-label="OPEN"
                      className="group/social flex items-center gap-4 rounded-card border border-border-subtle bg-bg-glass p-3 text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
                    >
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-bg-surface text-accent-violet-text transition-colors group-hover/social:border-border-hover group-hover/social:text-accent-cyan">
                        <SocialMark icon={social.icon} />
                      </span>
                      <span className="flex-1 text-sm">{social.label}</span>
                      <ArrowUpRight
                        aria-hidden
                        className="h-4 w-4 transition-transform duration-300 ease-smooth motion-safe:group-hover/social:-translate-y-0.5 motion-safe:group-hover/social:translate-x-0.5"
                      />
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-7 border-t border-border-subtle pt-5">
                <div className="flex items-center gap-3">
                  <h2
                    id="footer-stack"
                    className="shrink-0 font-mono text-eyebrow uppercase text-text-secondary"
                  >
                    Built with
                  </h2>
                  <span className="h-px flex-1 bg-gradient-to-r from-border-subtle to-transparent" />
                </div>
                <ul
                  className="mt-4 flex flex-wrap gap-2"
                  aria-label="Portfolio technology stack"
                >
                  {portfolioStack.map((technology) => (
                    <li
                      key={technology.id}
                      className="group/technology inline-flex items-center gap-2 rounded-pill border border-border-subtle bg-bg-glass py-1 pl-1 pr-3 font-mono text-micro uppercase tracking-label text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
                    >
                      <span
                        aria-hidden
                        className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated px-1 text-accent-teal transition-colors group-hover/technology:border-accent-teal/35 group-hover/technology:text-accent-copper-text"
                      >
                        <PortfolioStackMark id={technology.id} />
                      </span>
                      {technology.label}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <div
            className="relative mt-8 flex flex-col gap-4 border-t border-border-subtle pt-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="font-mono text-xs text-text-secondary">
              © {year} {identity.fullName}
            </p>
            <a
              href="#hero"
              className="group/top inline-flex w-fit items-center gap-3 rounded-pill border border-border-subtle bg-bg-glass px-4 py-2 font-mono text-xs uppercase tracking-label text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
            >
              Back to top
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-bg-base">
                <ArrowUp
                  aria-hidden
                  className="h-3.5 w-3.5 transition-transform duration-300 ease-smooth motion-safe:group-hover/top:-translate-y-0.5"
                />
              </span>
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
