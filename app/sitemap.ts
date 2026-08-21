import type { MetadataRoute } from "next";

import { projects, siteUrl } from "@/content/data";

/**
 * [TODO] `siteUrl` is still the placeholder in `content/data.ts`. Every URL below is wrong
 * until Abdul confirms the production domain — see PROGRESS.md Blockers.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projects.map((project) => ({
      url: `${siteUrl}/projects/${project.slug}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
