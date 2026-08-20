import { identity } from "@/content/data";

/**
 * Phase 1 shell — real social links from `content/data.ts`.
 * Phase 10 builds this out properly (lucide icons, layout, ambient treatment).
 */
export function Footer() {
  return (
    <footer className="border-t border-border-subtle">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs text-text-secondary">
          {identity.fullName} — {identity.location}
        </p>
        <ul className="flex gap-6">
          {identity.socials.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-xs uppercase tracking-[0.15em] text-text-secondary transition-colors hover:text-text-primary"
              >
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
