import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GradientText } from "@/components/ui/GradientText";
import { navItems } from "@/content/data";

export const metadata: Metadata = {
  title: "Lost in space",
  description:
    "That page drifted out of orbit. Head back to the homepage to keep exploring.",
  /**
   * Required, not redundant: the root layout sets `robots: { index: true }`, which this route
   * would otherwise inherit — a 404 advertising itself as indexable. Next.js also emits its
   * own automatic `noindex` for not-found, so the rendered page carries two robots tags; they
   * agree, which is the point. Removing this leaves `noindex` and `index, follow` fighting.
   */
  robots: { index: false, follow: true },
};

/**
 * Custom 404 (`DESIGN_SYSTEM.md` #1): the lost-in-space / constellation motif that ties back
 * to the hero, with a clear way home.
 *
 * A Server Component — the only client piece is the constellation, which is already gated on
 * reduced motion and touch internally. The particle field is sparser and drifts more slowly
 * than the hero's, so the page reads as empty space rather than a busy background.
 */
export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden">

      <Container className="relative">
        <p className="font-mono text-eyebrow uppercase tracking-eyebrow text-accent-violet-text">
          Error 404
        </p>

        <h1 className="mt-6 text-display font-semibold text-text-primary">
          Lost in <GradientText>space</GradientText>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
          That page drifted out of orbit. Nothing here but background radiation — let&apos;s
          get you back to something solid.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/" cursorLabel="HOME">
            Back to homepage
          </Button>
          <Button href="/#projects" variant="secondary" cursorLabel="VIEW">
            View projects
          </Button>
        </div>

        <nav aria-label="Site sections" className="mt-12">
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`/${item.href}`}
                  className="font-mono text-xs uppercase tracking-label text-text-secondary transition-colors hover:text-text-primary"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </main>
  );
}
