import { contact } from "@/content/data";

/**
 * Phase 1 shell — real copy and working contact links from `content/data.ts`.
 * Phase 10 adds the terminal skin (and, if `contact.formEnabled` is ever turned on, the
 * real accessible form underneath it — see `CLAUDE.md` §4).
 */
export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-24"
    >
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-violet">
        Phase 10
      </p>
      <h2
        id="contact-heading"
        className="mt-4 text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl"
      >
        {contact.headline}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary">
        {contact.supportingLine}
      </p>
      <ul className="mt-8 flex flex-col gap-3">
        {contact.methods.map((method) => (
          <li key={method.id}>
            <a
              href={method.href}
              className="font-mono text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              <span className="text-accent-violet">{method.label}: </span>
              {method.value}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
