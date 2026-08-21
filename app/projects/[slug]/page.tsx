import { ArrowLeft, Code2, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GradientText } from "@/components/ui/GradientText";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { getProject, projects, siteUrl } from "@/content/data";

/**
 * Case-study page per project.
 *
 * Next.js 16 removed synchronous `params`, so it is awaited here — see
 * `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`. `PageProps` is the
 * generated helper that types the route's params from the folder name.
 */

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(
  props: PageProps<"/projects/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProject(slug);

  if (!project) {
    return { title: "Project not found" };
  }

  // Distinct title and description per route — Phase 13's SEO pass depends on this being
  // real per-project copy rather than one global title reused everywhere.
  return {
    // Just the project name: the root layout's title template appends
    // " — Abdul Qadir". Repeating it here produced "Pest Eye — Abdul Qadir — Abdul Qadir".
    title: project.title,
    description: project.pitch,
    alternates: { canonical: `${siteUrl}/projects/${project.slug}` },
    openGraph: {
      title: `${project.title} — Abdul Qadir`,
      description: project.pitch,
      url: `${siteUrl}/projects/${project.slug}`,
      type: "article",
    },
  };
}

export default async function ProjectPage(props: PageProps<"/projects/[slug]">) {
  const { slug } = await props.params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  const meta = [
    { label: "Role", value: project.role },
    { label: "Type", value: project.type },
    { label: "Date", value: project.date },
  ];

  return (
    <main className="relative py-section">
      <Container className="relative">
        {/* Back to the projects section of the homepage, not just "/" — returning the
            reader to where they left. The loader is session-gated, so this does not
            replay the boot sequence. */}
        <Link
          href="/#projects"
          data-cursor-label="BACK"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-label text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Back to projects
        </Link>

        <header className="mt-10 max-w-3xl">
          <p className="font-mono text-eyebrow uppercase text-accent-violet-text">
            {project.type}
          </p>
          <h1 className="mt-4 text-heading font-semibold text-text-primary">
            <GradientText>{project.title}</GradientText>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-text-secondary">{project.pitch}</p>
        </header>

        <MediaFrame
          image={project.heroImage}
          pendingLabel="Project hero image pending"
          sizes="(min-width: 1152px) 72rem, 100vw"
          // The only image on the page that should not be lazy.
          priority
          className="mt-12 aspect-project w-full rounded-panel border border-border-subtle"
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-3">
          <dl className="flex flex-col gap-6">
            {meta.map((item) => (
              <div key={item.label}>
                <dt className="font-mono text-eyebrow uppercase text-text-secondary">
                  {item.label}
                </dt>
                <dd className="mt-2 text-text-primary">{item.value}</dd>
              </div>
            ))}
            <div>
              <dt className="font-mono text-eyebrow uppercase text-text-secondary">Stack</dt>
              <dd className="mt-3 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <Badge key={tech}>{tech}</Badge>
                ))}
              </dd>
            </div>
          </dl>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-text-primary">Abstract</h2>
            <p className="mt-4 text-base leading-relaxed text-text-secondary">
              {project.abstract}
            </p>

            {/* Links are omitted entirely while null — never a disabled-looking dead
                control. Set `liveUrl` / `repoUrl` in `content/data.ts` and they appear. */}
            {project.liveUrl || project.repoUrl ? (
              <div className="mt-8 flex flex-wrap gap-4">
                {project.liveUrl ? (
                  <Button href={project.liveUrl} cursorLabel="OPEN">
                    Live preview <ExternalLink aria-hidden className="h-4 w-4" />
                  </Button>
                ) : null}
                {project.repoUrl ? (
                  <Button href={project.repoUrl} variant="secondary" cursorLabel="OPEN">
                    {/* lucide v1 ships no brand marks — see PROGRESS.md decision log. */}
                    Source <Code2 aria-hidden className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            ) : (
              <p className="mt-8 font-mono text-xs uppercase tracking-label text-text-secondary">
                Live link coming soon
              </p>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
