import {
  awards,
  certifications,
  coreSkills,
  education,
  experience,
  identity,
  projects,
  siteUrl,
  skillGroups,
  type Project,
} from "@/content/data";

/**
 * Schema.org structured data — the machine-readable version of everything the page says.
 *
 * **Why this file exists.** Google does not rank "a website about Abdul Qadir"; it resolves an
 * *entity* and then decides which pages describe it. AI Overviews work the same way: they
 * synthesise from sources they can attribute to a known entity. Prose alone leaves that
 * resolution to guesswork, which is how a person ends up merged with someone who shares their
 * name. This declares the entity explicitly and links every profile that belongs to it.
 *
 * **Everything here derives from `content/data.ts`.** No fact is retyped. If the schema and the
 * visible page ever disagree, that is a spam signal ("structured data must be representative of
 * the main content"), so a single source is not tidiness — it is the correctness requirement.
 *
 * The pieces connect through stable `@id`s rather than being three unrelated blobs:
 *
 *   {siteUrl}/#person   the entity — the thing that should rank
 *   {siteUrl}/#website  the site, `publisher`-linked to the person
 *   {siteUrl}/#webpage  the homepage, `about`-linked to the person
 *
 * `sameAs` is the load-bearing property: it is how Google merges the portfolio, GitHub,
 * LinkedIn and X into one entity instead of several weak ones.
 */

/** A JSON-LD value. Deliberately not `any` — see `CLAUDE.md`'s no-`any` rule. */
type JsonValue =
  | string
  | number
  | boolean
  | null
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export const PERSON_ID = `${siteUrl}/#person`;
const WEBSITE_ID = `${siteUrl}/#website`;

/** Absolute URL for a site-relative path. Schema.org wants absolute URLs throughout. */
const abs = (path: string) => new URL(path, siteUrl).toString();

/**
 * Every profile that is *this* person, for `sameAs`.
 *
 * Sourced from `identity.socials`, so adding a profile there (X/Twitter, Hugging Face, Dev.to)
 * automatically strengthens the entity — there is no second list to remember. Instagram was
 * deliberately removed 2026-08-28: it is a personal account, and `sameAs` should assert only
 * profiles that represent the professional entity.
 */
function sameAs(): readonly string[] {
  return identity.socials.map((social) => social.href);
}

/** Current role, for `Person.worksFor` — the most recent work entry. */
function currentEmployer(): JsonValue | undefined {
  const current = experience.find((entry) => entry.period.includes("Present"));
  if (!current) return undefined;
  return {
    "@type": "Organization",
    name: current.organization,
  };
}

/**
 * `Person.knowsAbout` — the topics this entity is competent in.
 *
 * This is the property that most directly answers "what is this person known for", which is
 * the question an AI Overview is trying to resolve when it decides who to cite.
 */
function knowsAbout(): readonly string[] {
  return [
    ...coreSkills.map((skill) => skill.name),
    ...skillGroups.flatMap((group) => group.items),
  ];
}

/** Certifications and awards as verifiable credentials. */
function credentials(): readonly JsonValue[] {
  return [
    ...certifications.map((credential) => ({
      "@type": "EducationalOccupationalCredential",
      name: credential.title,
      ...(credential.issuer
        ? { recognizedBy: { "@type": "Organization", name: credential.issuer } }
        : {}),
      // A credential with a verification URL is worth far more than one without: it is
      // independently checkable, which is exactly what an assessor looks for.
      ...(credential.url ? { url: credential.url } : {}),
    })),
    ...awards.map((award) => ({
      "@type": "EducationalOccupationalCredential",
      name: award.title,
      ...(award.issuer
        ? { recognizedBy: { "@type": "Organization", name: award.issuer } }
        : {}),
    })),
  ];
}

/** The person entity. This is the thing that should rank. */
function person(): JsonValue {
  const employer = currentEmployer();

  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: identity.fullName,
    url: siteUrl,
    jobTitle: identity.roles[0],
    description: identity.bio,
    email: `mailto:${identity.email}`,
    telephone: identity.phone,
    address: {
      "@type": "PostalAddress",
      addressCountry: identity.location,
    },
    ...(identity.portrait ? { image: abs(identity.portrait.src) } : {}),
    sameAs: sameAs(),
    knowsAbout: knowsAbout(),
    ...(employer ? { worksFor: employer } : {}),
    alumniOf: education.map((entry) => ({
      "@type": "EducationalOrganization",
      name: entry.organization,
    })),
    hasCredential: credentials(),
    // Awards also get the plain-text `award` property: some consumers read it and ignore
    // `hasCredential`.
    award: awards.map((item) => item.title),
  };
}

/** The site, attributed to the person. */
function website(): JsonValue {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: siteUrl,
    name: `${identity.fullName} — ${identity.roles[0]}`,
    description: identity.tagline,
    inLanguage: "en",
    publisher: { "@id": PERSON_ID },
  };
}

/**
 * The homepage, declared as a `ProfilePage` *about* the person.
 *
 * `ProfilePage` is the specific type Google documents for "a page about one person", and it is
 * a stronger signal than a generic `WebPage` that this site is the person's own canonical
 * profile rather than a page that merely mentions them.
 */
function homePage(): JsonValue {
  return {
    "@type": "ProfilePage",
    "@id": `${siteUrl}/#webpage`,
    url: siteUrl,
    name: `${identity.fullName} — ${identity.roles[0]}`,
    description: identity.tagline,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PERSON_ID },
    mainEntity: { "@id": PERSON_ID },
  };
}

/** Homepage graph: person + site + page, cross-linked by `@id`. */
export function homeGraph(): JsonValue {
  return {
    "@context": "https://schema.org",
    "@graph": [person(), website(), homePage()],
  };
}

/**
 * A project detail page.
 *
 * Each project is a `CreativeWork` **authored by** the person, so the work reinforces the
 * entity instead of floating free. Breadcrumbs are included because they are what Google
 * renders in place of a bare URL in the result.
 */
export function projectGraph(project: Project): JsonValue {
  const url = `${siteUrl}/projects/${project.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${url}#project`,
        name: project.title,
        headline: project.title,
        description: project.pitch,
        abstract: project.abstract,
        url,
        author: { "@id": PERSON_ID },
        creator: { "@id": PERSON_ID },
        keywords: project.stack.join(", "),
        dateCreated: project.date,
        ...(project.heroImage ? { image: abs(project.heroImage.src) } : {}),
        // The deployed application, where one exists — a live artefact is a much stronger
        // signal of real work than a description of it.
        ...(project.liveUrl
          ? { workExample: { "@type": "WebApplication", url: project.liveUrl } }
          : {}),
        ...(project.repoUrl ? { codeRepository: project.repoUrl } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Projects",
            item: `${siteUrl}/#projects`,
          },
          { "@type": "ListItem", position: 3, name: project.title, item: url },
        ],
      },
    ],
  };
}

/** An `ItemList` of every project, so the homepage's work is enumerable. */
export function projectListGraph(): JsonValue {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: project.title,
      url: `${siteUrl}/projects/${project.slug}`,
    })),
  };
}
