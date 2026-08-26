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
   * The About-section portrait. Supplied 2026-08-21 at 1374x1727, which is almost exactly the
   * `aspect-portrait` (4:5) token the About layout was built against, so it dropped in without
   * a layout change. The portrait-tied constellation runs over it. Drop the file into `public/` and fill this in.
   */
  readonly portrait: ContentImage | null;
  /** Cut-out variant for the hero. See the note on the value. */
  readonly portraitCutout: ContentImage | null;
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
  /**
   * Background-removed variant of the portrait, used by the hero where the subject has to sit
   * directly on the page with no frame.
   *
   * Derived from `portrait2.jpeg` (supplied 2026-08-26, 832x1248) by `scripts/cutout.py`. That
   * source keys far more cleanly than the previous one: the subject sits against a smooth slate
   * backdrop with a strong silhouette edge, so an edge-barrier flood fill from the frame border
   * separates them without the luminance tricks the old near-black photo needed.
   */
  portraitCutout: {
    src: "/portrait2-cutout.png",
    alt: "Abdul Qadir, wearing a grey suit and navy tie.",
  },
  /**
   * The framed About portrait. **Also the cut-out, not the raw photo.**
   *
   * The source's backdrop is a mid-grey (L~100), which against `bg-base` reads as a bright
   * rectangle punched into a dark page — and, more concretely, it hid the portrait-tied
   * constellation that Phase 6 layers over this frame: violet nodes on light grey are invisible.
   * With the background keyed out the subject sits on the glass panel, the frame stays dark, and
   * that field is legible again.
   */
  portrait: {
    src: "/portrait2-cutout.png",
    alt: "Abdul Qadir, wearing a grey suit and navy tie.",
  },
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
  /** Hide the "Live Preview" button while null. */
  readonly liveUrl: string | null;
  /** `[TODO]` — hide the repo link while null. */
  readonly repoUrl: string | null;
  /**
   * The landing-page card thumbnail: the square system-overview graphic from
   * `assets/images/portfolio/`. The card frame is square (`aspect-square`) to match, so the
   * graphic is never cropped.
   */
  readonly cardImage: ContentImage | null;
  /**
   * The detail-page hero: the wide screenshot of the running application from
   * `assets/images/project-detail/`.
   */
  readonly heroImage: ContentImage | null;
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
    cardImage: {
      src: "/projects/pest-eye-card.jpeg",
      alt: "Diagram of the Pest Eye system: field images feed a leaf-mounted camera node that identifies aphids, ladybird predators and larvae, then reports pest monitoring counts, a predator-to-prey ecosystem balance assessment, and actionable spraying recommendations. Built with React, FastAPI and Firebase.",
    },
    heroImage: {
      src: "/projects/pest-eye-hero.jpg",
      alt: "The Pest Eye web app's landing screen — the headline \u201cWith AI, identify pests instantly\u201d over a photograph of a tractor in a wheat field at sunset, with Upload Image and View History buttons.",
    },
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
    // Read off the deployment screenshot Abdul supplied and confirmed live (HTTP 200).
    liveUrl: "https://huggingface.co/spaces/abdulqadir12511/Customer_Segmentation",
    repoUrl: null,
    cardImage: {
      src: "/projects/customer-segmentation-card.jpeg",
      alt:
        "Infographic titled “RFM Customer Segmentation”: four customer groups — 34% loyal customers, 21% high spenders, 28% recent and frequent, and 17% at risk — radiating from a central RFM Intelligence Centre, with Python, Gradio and Hugging Face logos along the bottom.",
    },
    heroImage: {
      src: "/projects/customer-segmentation-hero.jpg",
      alt: "The Customer Segmentation Gradio app running on Hugging Face Spaces, with Recency, Frequency and Monetary input fields, a Predict Segment button, and a bar chart of average RFM values per cluster.",
    },
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
    cardImage: {
      src: "/projects/netflix-stock-price-card.jpeg",
      alt:
        "Infographic titled “Netflix (NFLX) Stock Predictor” showing a current price of $450.23 USD: subscriber growth, content performance, global market trends and macroeconomic data feed an AI model core that outputs a median forecast of $472.00 with a $430–$495 range, with HTML, CSS, JavaScript and Django logos along the bottom.",
    },
    heroImage: {
      src: "/projects/netflix-stock-price-hero.png",
      alt: "The Netflix Stock Price Prediction System web app, showing a form for open, high, low and adjusted close price plus volume, over a large red Netflix wordmark on black.",
    },
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
  /** Issuing organisation, transcribed from the certificate itself. */
  readonly issuer: string | null;
  /** When it was awarded, as printed on the certificate. */
  readonly date: string | null;
  /** `[TODO]` — open a lightbox instead of navigating while null. */
  readonly url: string | null;
  /** `[TODO]` — certificate/award images not supplied yet. */
  readonly image: ContentImage | null;
}

/**
 * Titles, issuers and dates below are transcribed from the certificate images Abdul supplied
 * on 2026-08-21, which are more precise than the screenshot-derived wording in
 * `CONTENT_BRIEF.md`. Where the two disagree, the certificate wins — it is the primary source.
 * Every `url` is a real verification link, checked to return HTTP 200.
 */
export const certifications: readonly Credential[] = [
  {
    id: "python-for-everybody",
    kind: "certification",
    // The brief called this "Python Specialization"; the certificate is the individual
    // course, so the exact course name is used rather than the broader claim.
    title: "Programming for Everybody (Getting Started with Python)",
    issuer: "University of Michigan · Coursera",
    date: "Dec 2023",
    url: "https://coursera.org/verify/2CCTQBHBYKRE",
    image: {
      src: "/credentials/python-for-everybody.jpeg",
      alt: "Coursera course certificate awarding Abdul Qadir completion of Programming for Everybody (Getting Started with Python), authorised by the University of Michigan, dated 23 December 2023.",
    },
  },
  {
    id: "programming-with-javascript",
    kind: "certification",
    title: "Programming with JavaScript",
    issuer: "Meta · Coursera",
    date: "Aug 2023",
    url: "https://coursera.org/verify/5NHZQ49GDDUS",
    image: {
      src: "/credentials/programming-with-javascript.jpeg",
      alt: "Coursera course certificate awarding Abdul Qadir completion of Programming with JavaScript, authorised by Meta, dated 16 August 2023.",
    },
  },
  {
    id: "django-web-framework",
    kind: "certification",
    title: "Django Web Framework",
    issuer: "Meta · Coursera",
    date: "Mar 2024",
    url: "https://coursera.org/verify/AVVJCNWSY23C",
    image: {
      src: "/credentials/django-web-framework.jpeg",
      alt: "Coursera course certificate awarding Abdul Qadir completion of Django Web Framework, authorised by Meta, dated 19 March 2024.",
    },
  },
  {
    id: "version-control",
    kind: "certification",
    title: "Version Control",
    issuer: "Meta · Coursera",
    date: "Feb 2024",
    url: "https://coursera.org/verify/LCVD2YSDVLZM",
    image: {
      src: "/credentials/version-control.jpeg",
      alt: "Coursera course certificate awarding Abdul Qadir completion of Version Control, authorised by Meta, dated 24 February 2024.",
    },
  },
  {
    id: "n8n-no-code-ai-agent-builder",
    kind: "certification",
    title: "n8n Course: No Code AI Agent Builder",
    issuer: "Simplilearn SkillUp",
    date: "Nov 2025",
    // Simplilearn prints a certificate code (9479107) rather than a verification URL, so this
    // one opens the image lightbox instead of a link.
    url: null,
    image: {
      src: "/credentials/n8n-no-code-ai-agent-builder.jpg",
      alt: "Simplilearn SkillUp certificate of completion awarding Abdul Qadir the n8n Course: No Code AI Agent Builder, dated 26 November 2025.",
    },
  },
];

/**
 * Awards, ordered strongest first — the two wins lead. None of the award certificates carry a
 * public verification URL, so every one opens the image lightbox.
 */
export const awards: readonly Credential[] = [
  {
    id: "air-robotronics-cpp-winner",
    kind: "award",
    title: "Winner — Programming in C++, AIR ROBOTRONICS '24",
    issuer: "Robotics & Automation Society, Air University AACK",
    date: "2024",
    url: null,
    image: {
      src: "/credentials/air-robotronics-cpp-winner.png",
      alt: "Certificate of appreciation naming Abdul Qadir the winner of Programming in C++ at AIR ROBOTRONICS '24, organised by the Robotics & Automation Society at Air University Aerospace & Aviation Campus Kamra.",
    },
  },
  {
    id: "hult-prize",
    kind: "award",
    title: "Hult Prize — Winning Team, OnCampus Program",
    issuer: "Hult Prize Foundation · Air University AACK",
    date: "Feb 2025",
    url: null,
    image: {
      src: "/credentials/hult-prize-winning-team.png",
      alt: "Hult Prize certificate recognising Abdul Qadir as a member of the winning team at the 2024-2025 OnCampus Program, Air University Aerospace and Aviation Campus Kamra, dated 27 February 2025.",
    },
  },
  {
    id: "pbs-data-fest-2024",
    kind: "award",
    title: "Certificate of Participation — Data Fest 2024",
    issuer: "Pakistan Bureau of Statistics",
    date: "Oct 2024",
    url: null,
    image: {
      src: "/credentials/pbs-data-fest-2024.png",
      alt: "Pakistan Bureau of Statistics certificate of participation awarded to Abdul Qadir for presenting a project at Data Fest 2024, Pak China Friendship Centre Islamabad, 21 to 22 October 2024.",
    },
  },
  {
    id: "rebooting-the-future",
    kind: "award",
    title: "Certificate of Participation — Rebooting the Future",
    issuer: "Air University",
    date: "May 2025",
    url: null,
    image: {
      src: "/credentials/rebooting-the-future.png",
      alt: "Air University certificate of participation awarded to Abdul Qadir in recognition of research and presentation at Rebooting the Future, 23 May 2025.",
    },
  },
  {
    id: "visiospark-2024",
    kind: "award",
    title: "Certificate of Participation — 20th Episode of VisioSpark",
    issuer: "VisioSpark 2024 · COMSATS University Islamabad, Wah Campus",
    date: "2024",
    url: null,
    image: {
      src: "/credentials/visiospark-2024.png",
      alt: "VisioSpark 2024 certificate of participation presented to Abdul Qadir for the 20th episode of VisioSpark at COMSATS University Islamabad, Wah Campus.",
    },
  },
  {
    id: "air-university-appreciation",
    kind: "award",
    title: "Certificate of Appreciation — Students' Orientation Day",
    issuer: "Air University Aerospace & Aviation Campus, Kamra",
    date: "2024",
    url: null,
    image: {
      src: "/credentials/air-university-appreciation.png",
      alt: "Air University Aerospace & Aviation Campus Kamra certificate of appreciation awarded to Abdul Qadir for assisting in management of the Students' Orientation Day function 2024.",
    },
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
