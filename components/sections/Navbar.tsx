import { identity, navItems } from "@/content/data";

/**
 * Phase 1 shell — real nav items from `content/data.ts`, no styling state yet.
 * Phase 4 adds the transparent -> glass scroll transition, height compaction and the
 * scroll-spy active-section indicator.
 */
export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
      >
        <a
          href="#hero"
          className="font-mono text-sm tracking-[0.2em] text-text-primary"
          aria-label={`${identity.fullName} — back to top`}
        >
          {identity.initials}
        </a>
        <ul className="hidden gap-6 md:flex">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                className="font-mono text-xs uppercase tracking-[0.15em] text-text-secondary transition-colors hover:text-text-primary"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
