/**
 * Typed content for the whole site, transcribed from `docs/CONTENT_BRIEF.md`.
 *
 * Rules for this file:
 * - Every section component imports its copy from here. Never hardcode copy in a component.
 * - Anything the brief marks `[TODO]` is `null` here — never a guessed value, never an empty
 *   string that looks like real content. Consumers must degrade gracefully on `null`
 *   (hide/disable the control; don't render a dead link). Each one is tracked in
 *   `PROGRESS.md` -> Known issues.
 */

/* ------------------------------------------------------------------ icons */

/**
 * `lucide-react` icon names referenced by content. Components map these to the real
 * component through a `Record<IconName, LucideIcon>` lookup, so content stays free of
 * React imports.
 */
export type IconName =
  | "code-2"
  | "smartphone"
  | "rocket"
  | "share-2"
  | "github"
  | "linkedin"
  | "instagram"
  | "mail"
  | "phone";

/* ----------------------------------------------------------------- images */

export interface ContentImage {
  readonly src: string;
  /** Real descriptive alt text — never a filename (Phase 9 acceptance criteria). */
  readonly alt: string;
}

/* --------------------------------------------------------------- identity */

export interface SocialLink {
  readonly label: string;
  readonly href: string;
  readonly icon: IconName;
}

export interface Identity {
  readonly fullName: string;
  readonly initials: string;
  readonly location: string;
  /** Hero typewriter cycles through these in order. Index 0 is the reduced-motion fallback. */
  readonly roles: readonly [string, string, string];
  readonly tagline: string;
  readonly bio: string;
  readonly email: string;
  readonly phone: string;
  /** `[TODO]` in the brief — no CV link supplied yet. */
  readonly resumeUrl: string | null;
  /**
   * `[TODO]` — the About-section portrait has not been supplied. While this is `null` the
   * About section renders a placeholder holding the right aspect ratio, and the portrait-tied
   * constellation still runs over it. Drop the file into `public/` and fill this in.
   */
  readonly portrait: ContentImage | null;
  readonly socials: readonly SocialLink[];
}

export const identity: Identity = {
  fullName: "Abdul Qadir",
  initials: "AQ",
  location: "Pakistan",
  roles: ["Full Stack AI Engineer", "ML Engineer", "Agentic AI Builder"],
  tagline:
    "I specialize in building scalable, high-performance web applications powered by AI. Let's turn your complex ideas into seamless digital experiences.",
  bio: "I am a Full Stack AI Engineer based in Pakistan. I specialize in building intelligent, scalable web applications by integrating machine learning models with robust backends like Django and FastAPI. I help convert complex data ideas into meaningful and useful digital products. Having a strong foundation in both modern front-end technologies and data science allows me to build comprehensive solutions, prioritize tasks effectively, and iterate fast.",
  email: "abdulqadir12511@gmail.com",
  phone: "+92 324 542 24298",
  resumeUrl: null,
  portrait: null,
  socials: [
    { label: "GitHub", href: "https://github.com/Abd-ul-Qadir", icon: "github" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/abd-ul-qadir/",
      icon: "linkedin",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/abdu1.qadir",
      icon: "instagram",
    },
  ],
};

/* --------------------------------------------------------------- services */

export interface Service {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
  /** Checkmark-bulleted sub-points (`DESIGN_SYSTEM.md` #10). */
  readonly points: readonly string[];
}

export const services: readonly Service[] = [
  {
    id: "web-development",
    title: "Web Development",
    description:
      "Building scalable, and responsive web applications using modern frameworks like React, Django, FastAPI, HTML/CSS/JS to deliver seamless user experiences from frontend to backend.",
    icon: "code-2",
    points: ["React front-ends", "Django & FastAPI back-ends", "Responsive by default"],
  },
  {
    id: "app-development",
    title: "App Development",
    description:
      "Developing high-performance cross-platform applications using React Native, with seamless backend API integrations powered by Django, FastAPI, and Flask.",
    icon: "smartphone",
    points: ["Cross-platform React Native", "Django, FastAPI & Flask APIs"],
  },
  {
    id: "agentic-ai",
    title: "Agentic AI using n8n",
    description:
      "Building automated workflows and AI agents using n8n for data extraction, complex API integrations, and business process automation.",
    icon: "rocket",
    points: [
      "Automated workflows",
      "Complex API integrations",
      "Business process automation",
    ],
  },
  {
    id: "ai-ml-apps",
    title: "AI/ML Powered Apps",
    description:
      "Integrating trained machine learning models and AI APIs into web and mobile applications for advanced data processing and predictive analytics.",
    icon: "share-2",
    points: ["Trained model integration", "Predictive analytics"],
  },
];

/* ------------------------------------------------- experience & education */

/** Both kinds render in the one Phase 8 timeline, distinguished by a type badge. */
export type TimelineKind = "work" | "education";

export interface TimelineEntry {
  readonly id: string;
  readonly kind: TimelineKind;
  /** Job title, or degree name for education. */
  readonly title: string;
  /** Employer, or institution for education. */
  readonly organization: string;
  /** Human-readable range, exactly as written in the brief. */
  readonly period: string;
  /** Sort key — descending. Higher is more recent. */
  readonly startYear: number;
  readonly arrangement: string | null;
  readonly bullets: readonly string[];
}

export const experience: readonly TimelineEntry[] = [
  {
    id: "pyora-full-stack",
    kind: "work",
    title: "Full Stack Developer",
    organization: "Pyora Solutions",
    period: "Aug 2025 – Present",
    startYear: 2025,
    arrangement: "Hybrid",
    bullets: [
      "POS System — Django, Oracle, PostgreSQL: built a Django-based POS system with modules for dashboard analytics, customer and kitchen orders, checkout, stock management, and table booking.",
      "CRM System — Django, ReactJS, PostgreSQL: developed a full-stack CRM with an analytics dashboard, customer and CRM staff management, lead and task tracking, and role-based permissions.",
    ],
  },
  {
    id: "pyora-internship",
    kind: "work",
    title: "Python/Django Internship",
    organization: "Pyora Solutions",
    period: "June 2024 – Sept 2024",
    startYear: 2024,
    arrangement: "Onsite",
    bullets: [
      "Pyzk Attendance Machine Application — Python, Pyzk library, Oracle, PostgreSQL: built a GUI-based biometric attendance system for Sufi Group of Companies using Pyzk, integrating ZKTeco devices with automated/manual sync, scheduling, error logging, and centralized device management.",
      "POS System — Python, Pyzk library, Oracle, PostgreSQL: implemented a secure admin and user login system with authentication in Django, enabling role-based access control.",
    ],
  },
  {
    id: "octanet-intern",
    kind: "work",
    title: "Python Development Intern",
    organization: "OctaNet Services Pvt. Ltd",
    period: "April 2024 – May 2024",
    startYear: 2024,
    arrangement: null,
    bullets: [
      "Developed an ATM application using Python to manage transaction history, withdrawals, deposits, and transfers.",
    ],
  },
  {
    id: "cognorise-intern",
    kind: "work",
    title: "Python Development Intern",
    organization: "CognoRise InfoTech",
    period: "March 2024 – April 2024",
    startYear: 2024,
    arrangement: null,
    bullets: [
      "Built a set of small Python/Tkinter tools: a calculator (expression-based arithmetic), a password generator, Rock Paper Scissors, Hangman, a Dice Rolling Simulator, and a Countdown Timer.",
    ],
  },
];

export const education: readonly TimelineEntry[] = [
  {
    id: "air-university-bscs",
    kind: "education",
    title: "Bachelor of Science in Computer Science",
    organization: "Air University Islamabad",
    period: "2021 – 2025",
    startYear: 2021,
    arrangement: null,
    bullets: [],
  },
  {
    id: "fazaia-fsc",
    kind: "education",
    title: "FSc Pre-Engineering",
    organization: "Fazaia Degree College, MRF Kamra",
    period: "2018 – 2020",
    startYear: 2018,
    arrangement: null,
    bullets: [],
  },
];

/**
 * The single reverse-chronological list the Phase 8 timeline renders. Work and education are
 * interleaved by start year, with work first on a tie (it's the more relevant signal).
 */
export const timeline: readonly TimelineEntry[] = [...experience, ...education].sort(
  (a, b) =>
    b.startYear - a.startYear || (a.kind === b.kind ? 0 : a.kind === "work" ? -1 : 1),
);

/* --------------------------------------------------------------- projects */

export interface Project {
  readonly slug: string;
  readonly title: string;
  readonly pitch: string;
  readonly role: string;
  readonly type: string;
  readonly date: string;
  readonly stack: readonly string[];
  readonly abstract: string;
  /** `[TODO]` — hide the "Live Preview" button while null. */
  readonly liveUrl: string | null;
  /** `[TODO]` — hide the repo link while null. */
  readonly repoUrl: string | null;
  /** `[TODO]` — hero image not supplied yet; render the placeholder treatment. */
  readonly image: ContentImage | null;
}

export const projects: readonly Project[] = [
  {
    slug: "pest-eye",
    title: "Pest Eye",
    pitch:
      "Worked as a Full-Stack Developer on a web application using ReactJS and FastAPI, integrating a trained EfficientNet model for crop pest classification and Firebase for authentication.",
    role: "Full-Stack Developer",
    type: "AI Web Application",
    date: "2024",
    stack: ["ReactJS", "FastAPI", "Firebase"],
    abstract:
      "Plants are affected by many pests, one of agriculture's biggest problems — roughly 40% of global crops are lost to pests annually (~$69B in economic loss). Rural farmers often lack the resources for effective pest control, and manual identification is slow, inaccurate, and costly. Pest Eye uses deep learning to classify crop pests from images across a cross-platform system, trained on a large pest dataset for quick identification. By analyzing past pest-attack data it also provides predictive insights to help prevent future infestations — giving farmers without direct expert access pesticide recommendations and automated, history-based notifications.",
    liveUrl: null,
    repoUrl: null,
    image: null,
  },
  {
    slug: "customer-segmentation-rfm-kmeans",
    title: "Customer Segmentation Using RFM and KMeans",
    pitch:
      "Built an end-to-end customer segmentation pipeline using RFM analysis and KMeans clustering, deployed with Gradio on Hugging Face Spaces.",
    role: "Machine Learning Engineer",
    type: "ML Pipeline & Deployment",
    date: "2024",
    stack: ["Python", "Gradio", "Hugging Face"],
    abstract:
      "Applies RFM (Recency, Frequency, Monetary) analysis combined with KMeans clustering to group customers by purchasing behavior, using the UCI Online Retail dataset. The goal is to surface distinct customer groups for targeted marketing — the pipeline covers data preprocessing, exploratory data analysis, unsupervised learning, model deployment, and feedback collection, with the final model deployed through a Gradio web interface on Hugging Face Spaces. Effectiveness is enhanced through interactive visualizations and iterative improvements based on real user feedback.",
    liveUrl: null,
    repoUrl: null,
    image: null,
  },
  {
    slug: "netflix-stock-price-predictor",
    title: "Netflix Stock Price Predictor",
    pitch:
      "Developed a web application with a Django backend and a Linear Regression model to predict Netflix stock prices using historical data.",
    role: "Full-Stack Developer",
    type: "Web App & Predictive Model",
    date: "2023 – 2024",
    stack: ["HTML", "CSS", "JS", "Django", "AI & ML"],
    abstract:
      "A web application that predicts Netflix's future stock price by training a linear regression model on historical price data, then serving predictions through a Django-backed web app.",
    liveUrl: null,
    repoUrl: null,
    image: null,
  },
];

export const projectSlugs: readonly string[] = projects.map((project) => project.slug);

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/* ----------------------------------------------------------------- skills */

/** The four scored skills — proficiency maps to node size/glow, never a progress bar. */
export interface CoreSkill {
  readonly id: string;
  readonly name: string;
  /** 0–100, revealed in the hover/info panel rather than printed as a bar label. */
  readonly proficiency: number;
}

export const coreSkills: readonly CoreSkill[] = [
  { id: "react", name: "React.js", proficiency: 95 },
  { id: "python-django-fastapi", name: "Python, Django & FastAPI", proficiency: 90 },
  { id: "html-css-js", name: "HTML, CSS & JS", proficiency: 80 },
  { id: "agentic-ai", name: "Agentic AI", proficiency: 80 },
];

/** Unscored stack — renders as a plain tag list, deliberately not as bars. */
export interface SkillGroup {
  readonly id: string;
  readonly label: string;
  readonly items: readonly string[];
}

export const skillGroups: readonly SkillGroup[] = [
  { id: "backend", label: "Backend", items: ["Django", "FastAPI", "Flask"] },
  { id: "frontend", label: "Frontend", items: ["React.js", "React Native"] },
  {
    id: "data-ai-ml",
    label: "Data / AI-ML",
    items: [
      "EfficientNet",
      "Linear Regression",
      "RFM analysis",
      "KMeans",
      "scikit-learn-style ML pipelines",
      "Agentic AI (n8n)",
    ],
  },
  { id: "databases", label: "Databases", items: ["PostgreSQL", "Oracle"] },
  {
    id: "tools",
    label: "Tools / Other",
    items: [
      "Firebase",
      "Gradio",
      "Hugging Face Spaces",
      "Git",
      "Pyzk (biometric devices)",
      "Tkinter",
    ],
  },
];

/** Rendered as circular badges. */
export const spokenLanguages: readonly string[] = ["Urdu", "Hindi", "English"];

/* ------------------------------------------------ certifications & awards */

export type CredentialKind = "certification" | "award";

export interface Credential {
  readonly id: string;
  readonly kind: CredentialKind;
  readonly title: string;
  /** Issuing organisation, where the brief states one legibly. */
  readonly issuer: string | null;
  /** `[TODO]` — open a lightbox instead of navigating while null. */
  readonly url: string | null;
  /** `[TODO]` — certificate/award images not supplied yet. */
  readonly image: ContentImage | null;
}

export const certifications: readonly Credential[] = [
  {
    id: "python-specialization",
    kind: "certification",
    title: "Python Specialization",
    issuer: "Coursera",
    url: null,
    image: null,
  },
  {
    id: "javascript-programming",
    kind: "certification",
    title: "JavaScript Prog.",
    issuer: "Meta, via Coursera",
    url: null,
    image: null,
  },
  {
    id: "django-framework",
    kind: "certification",
    title: "Django Framework",
    issuer: "Meta, via Coursera",
    url: null,
    image: null,
  },
  {
    id: "version-control",
    kind: "certification",
    title: "Version Control",
    issuer: "Meta, via Coursera",
    url: null,
    image: null,
  },
  {
    id: "n8n-no-code-ai-agent-builder",
    kind: "certification",
    title: "n8n Course: No Code AI Agent Builder",
    issuer: null,
    url: null,
    image: null,
  },
];

export const awards: readonly Credential[] = [
  {
    id: "best-developer",
    kind: "award",
    title: "Best Developer",
    issuer: null,
    url: null,
    image: null,
  },
  {
    id: "hult-prize",
    kind: "award",
    title: "Certificate of Participation",
    issuer: "HULT PRIZE",
    url: null,
    image: null,
  },
  {
    id: "data-fest-2024",
    kind: "award",
    title: "Participation, Data Fest 2024",
    issuer: "Bureau of Statistics",
    url: null,
    image: null,
  },
  {
    id: "visio-spark-2024",
    kind: "award",
    title: "Certificate of Participation (20th Episode of VisioSpark)",
    issuer: "Visio Spark 2024",
    url: null,
    image: null,
  },
  {
    id: "rebooting-the-future",
    kind: "award",
    title: "Certificate of Participation (AI competition)",
    issuer: "Rebooting the Future",
    url: null,
    image: null,
  },
  {
    id: "air-university-appreciation",
    kind: "award",
    title: "Certificate of Appreciation",
    issuer: "Air University Aerospace & Aviation Campus",
    url: null,
    image: null,
  },
];

/** Filter tabs above the combined gallery (Phase 9). */
export type GalleryFilter = "all" | "projects" | "certifications" | "awards";

export interface GalleryFilterTab {
  readonly id: GalleryFilter;
  readonly label: string;
}

export const galleryFilters: readonly GalleryFilterTab[] = [
  { id: "all", label: "All" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
  { id: "awards", label: "Awards" },
];

/* ---------------------------------------------------------------- contact */

export interface ContactMethod {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly href: string;
  readonly icon: IconName;
}

export interface ContactContent {
  readonly headline: string;
  readonly supportingLine: string;
  readonly methods: readonly ContactMethod[];
  /**
   * Whether the terminal-skinned message form ships alongside the direct links. Still
   * unconfirmed by Abdul (`CONTENT_BRIEF.md`'s last line) — a working form needs a backend
   * (Resend or a serverless function), so this stays `false` and the links ship on their own
   * until that call is made. Tracked in `PROGRESS.md` -> Known issues.
   */
  readonly formEnabled: boolean;
}

export const contact: ContactContent = {
  headline: "Contact",
  supportingLine:
    "I'm a Full Stack AI Engineer specializing in building intelligent web applications, integrating machine learning models, and developing robust backend systems. Whether you want to discuss a project, an opportunity, or just talk tech, my inbox is always open. Let's build something great together!",
  methods: [
    {
      id: "email",
      label: "Email",
      value: identity.email,
      href: `mailto:${identity.email}`,
      icon: "mail",
    },
    {
      id: "phone",
      label: "Phone",
      value: identity.phone,
      href: `tel:${identity.phone.replace(/\s+/g, "")}`,
      icon: "phone",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      value: "in/abd-ul-qadir",
      href: "https://www.linkedin.com/in/abd-ul-qadir/",
      icon: "linkedin",
    },
  ],
  formEnabled: false,
};

/* ------------------------------------------------------------- navigation */

export interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
}

/** Order matches `CLAUDE.md` §1 and drives the Phase 4 scroll-spy. */
export const navItems: readonly NavItem[] = [
  { id: "about", label: "About", href: "#about" },
  { id: "skills", label: "Skills", href: "#skills" },
  { id: "services", label: "Services", href: "#services" },
  { id: "experience", label: "Experience", href: "#experience" },
  { id: "projects", label: "Projects", href: "#projects" },
  { id: "contact", label: "Contact", href: "#contact" },
];

/**
 * Canonical origin, used by `generateMetadata`, the sitemap and OG tags in Phase 13.
 * [TODO] Replace once the production domain is confirmed — Vercel deploy is Phase 14.
 */
export const siteUrl = "https://abdulqadir.dev";
