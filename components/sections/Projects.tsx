"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useState } from "react";

import { CredentialLightbox } from "@/components/effects/CredentialLightbox";
import { ProjectCard } from "@/components/effects/ProjectCard";
import { Container } from "@/components/ui/Container";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  awards,
  certifications,
  galleryFilters,
  projects,
  type Credential,
  type GalleryFilter,
} from "@/content/data";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Projects (the main showcase, each with a `/projects/[slug]` detail page) plus the lighter
 * certifications-and-awards gallery, behind the `All / Projects / Certifications / Awards`
 * tabs from `CONTENT_BRIEF.md`.
 *
 * The tabs are a real ARIA tablist and filter client-side — no navigation, no reload.
 *
 * Certificates and awards do **not** get detail pages: one with a `url` opens that link, one
 * without opens an image lightbox. Neither is ever a dead click.
 */
export function Projects() {
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [lightbox, setLightbox] = useState<Credential | null>(null);
  const reducedMotion = useReducedMotion();

  const showProjects = filter === "all" || filter === "projects";
  const showCertifications = filter === "all" || filter === "certifications";
  const showAwards = filter === "all" || filter === "awards";

  const credentials: Credential[] = [
    ...(showCertifications ? certifications : []),
    ...(showAwards ? awards : []),
  ];

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="relative overflow-hidden py-section"
    >

      <Container className="relative">
        <SectionHeading
          id="projects-heading"
          eyebrow="Selected work"
          accent="credentials"
          sparkle
        >
          Projects &
        </SectionHeading>

        {/* Filter tabs. A real tablist: arrow keys are handled natively by the browser's
            focus order, and `aria-selected` carries the state for assistive tech. */}
        <div
          role="tablist"
          aria-label="Filter work by type"
          className="mt-10 flex flex-wrap gap-2"
        >
          {galleryFilters.map((tab) => {
            const selected = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "rounded-pill border px-4 py-2 font-mono text-xs uppercase tracking-label transition-all duration-300 ease-smooth",
                  selected
                    ? "border-border-hover bg-bg-glass text-text-primary shadow-glow"
                    : "border-border-subtle text-text-secondary hover:border-border-hover hover:text-text-primary",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Projects grid. */}
        <AnimatePresence mode="popLayout">
          {showProjects ? (
            <motion.ul
              key="projects"
              data-project-grid
              className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0.1 : 0.3 }}
            >
              {projects.map((project, index) => (
                <li key={project.slug} className="list-none">
                  <ProjectCard project={project} index={index} />
                </li>
              ))}
            </motion.ul>
          ) : null}
        </AnimatePresence>

        {/* Certifications & awards — a lighter gallery, no detail pages. */}
        <AnimatePresence mode="popLayout">
          {credentials.length > 0 ? (
            <motion.ul
              key={`credentials-${filter}`}
              className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0.1 : 0.3 }}
            >
              {credentials.map((credential) => {
                const isLink = credential.url !== null;

                const inner = (
                  <>
                    <MediaFrame
                      image={credential.image}
                      pendingLabel={
                        credential.kind === "award" ? "Award image pending" : "Image pending"
                      }
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="aspect-credential w-full rounded-card"
                    />
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-medium text-text-primary">
                          {credential.title}
                        </h3>
                        <p className="mt-1 font-mono text-xs text-text-secondary">
                          {credential.issuer ??
                            (credential.kind === "award" ? "Award" : "Certification")}
                          {credential.date ? ` · ${credential.date}` : ""}
                        </p>
                      </div>
                      {isLink ? (
                        <ExternalLink
                          aria-hidden
                          className="mt-1 h-4 w-4 shrink-0 text-text-secondary"
                        />
                      ) : null}
                    </div>
                  </>
                );

                const shared =
                  "group block w-full rounded-panel border border-border-subtle p-4 text-left transition-all duration-300 ease-smooth hover:border-border-hover hover:shadow-glow focus-visible:border-border-hover focus-visible:shadow-glow";

                return (
                  <motion.li
                    key={credential.id}
                    className="list-none"
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reducedMotion ? 0.15 : 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {isLink ? (
                      <a
                        href={credential.url ?? undefined}
                        target="_blank"
                        rel="noreferrer noopener"
                        data-cursor-label="OPEN"
                        className={shared}
                      >
                        {inner}
                      </a>
                    ) : (
                      // No link supplied yet, so this opens the image lightbox instead of
                      // rendering a dead anchor.
                      <button
                        type="button"
                        onClick={() => setLightbox(credential)}
                        data-cursor-label="VIEW"
                        className={shared}
                      >
                        {inner}
                      </button>
                    )}
                  </motion.li>
                );
              })}
            </motion.ul>
          ) : null}
        </AnimatePresence>
      </Container>

      <CredentialLightbox credential={lightbox} onClose={() => setLightbox(null)} />
    </section>
  );
}
