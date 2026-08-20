/**
 * Phase 0 stub — built out in Phase 4 (transparent → glass on scroll,
 * scroll-spy active-section indicator).
 */
export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
      >
        <span className="font-mono text-sm tracking-[0.2em] text-text-primary">AQ</span>
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-secondary">
          Navbar
        </span>
      </nav>
    </header>
  );
}
