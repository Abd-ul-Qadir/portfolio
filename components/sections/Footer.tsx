import { ArrowUp } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { identity, navItems } from "@/content/data";

/**
 * Footer. A server component — nothing here needs the client.
 *
 * Social links render as text labels rather than brand marks: `lucide-react` v1 ships no
 * GitHub/LinkedIn/Instagram icons and `CLAUDE.md` §2 makes lucide the sole icon set, so a
 * second icon package is not an option (see PROGRESS.md's decision log).
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border-subtle">
      <Container className="py-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <p className="font-mono text-eyebrow uppercase tracking-eyebrow text-accent-violet-text">
              {identity.initials}
            </p>
            <p className="mt-4 text-lg font-medium text-text-primary">
              {identity.fullName}
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              {identity.roles[0]} — {identity.location}
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="font-mono text-eyebrow uppercase text-text-secondary">
              Sections
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-10 gap-y-3">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-eyebrow uppercase text-text-secondary">
              Elsewhere
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {identity.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-cursor-label="OPEN"
                    className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-border-subtle pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-text-secondary">
            © {year} {identity.fullName}
          </p>
          <a
            href="#hero"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-label text-text-secondary transition-colors hover:text-text-primary"
          >
            Back to top
            <ArrowUp aria-hidden className="h-4 w-4" />
          </a>
        </div>
      </Container>
    </footer>
  );
}
