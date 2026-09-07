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
  | "globe"
  | "smartphone"
  | "workflow"
  | "layout-dashboard"
  | "github"
  | "linkedin"
  | "instagram"
  | "x"
  | "mail"
  | "phone"
  | "file-text";

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
  readonly roles: readonly [string, string, string, string];
  readonly tagline: string;
  readonly bio: string;
  readonly email: string;
  readonly phone: string;
  /**
   * Supplied by Abdul 2026-08-27 as a Google Drive share link. It opens Drive's own preview
   * page rather than downloading the file, which is why every consumer treats it as an
   * external link (`target="_blank"`), not a `download`. Kept nullable: if the file is ever
   * unshared the field goes back to `null` rather than shipping a dead link.
   */
  readonly resumeUrl: string | null;
  /**
   * The same file, as a direct download rather than a preview page.
   *
   * **Two fields on purpose.** `resumeUrl` is for "let me read this" (the Contact panel row);
   * this one is for "give me the file" (the navbar button). Drive serves them from different
   * endpoints and there is no single URL that does both well.
   *
   * Verified 2026-08-27 against the live URL: it answers
   * `Content-Disposition: attachment; filename="Resume.pdf"` with a 155 KB body and **no
   * virus-scan interstitial** — Drive only interposes that page for large files. Because the
   * response is an attachment, the browser downloads it *without navigating away*, so the
   * button deliberately does **not** open a new tab (a `target="_blank"` here would leave a
   * blank tab behind). Re-check these headers if the file is ever replaced.
   */
  readonly resumeDownloadUrl: string | null;
  /**
   * The About-section portrait. Supplied 2026-08-21 at 1374x1727, which is almost exactly the
   * `aspect-portrait` (4:5) token the About layout was built against, so it dropped in without
   * a layout change. The portrait-tied constellation runs over it. Drop the file into `public/` and fill this in.
   */
  readonly portrait: ContentImage | null;
  /** Cut-out variant for the hero. See the note on the value. */
  readonly portraitCutout: ContentImage | null;
  /** AI/robotic counterpart of the hero cut-out, revealed under the cursor. */
  readonly portraitRobotic: ContentImage | null;
  readonly socials: readonly SocialLink[];
}

export const identity: Identity = {
  fullName: "Abdul Qadir",
  initials: "AQ",
  location: "Pakistan",
  roles: [
    "Full Stack AI Engineer",
    "Full Stack Web Engineer",
    "Full Stack Mobile App Engineer",
    "Agentic AI Builder",
  ],
  /**
   * Broadened 2026-08-29 at Abdul's request: the old line said "web applications" only, which
   * undersold four fifths of what he actually builds. It now names the full range and lands on
   * the same closing sentence, which was the good half.
   *
   * Watch the length if this is edited again — it sits under the hero typewriter in a `max-w-xl`
   * column, where it runs to three lines. Much longer and it starts pushing the CTAs down.
   */
  tagline:
    "I build AI-powered web and mobile apps, AI agents and automations, and AI SaaS, ERP and CRM platforms. Let's turn your complex ideas into seamless digital experiences.",
  bio: "I am a Full Stack AI Engineer based in Pakistan. I build AI-powered web and mobile applications, AI agents and automations, and full business platforms — SaaS products, ERP and CRM systems — pairing modern front ends with robust Python backends like Django and FastAPI. I help convert complex data ideas into meaningful and useful digital products. Having a strong foundation in both modern front-end technologies and data science allows me to build comprehensive solutions, prioritize tasks effectively, and iterate fast.",
  email: "abdulqadir12511@gmail.com",
  phone: "+92 324 542 24298",
  resumeUrl:
    "https://drive.google.com/file/d/1ZLB5BreWeAJCiNlU4_8QRwpSTVQFEeAy/view?usp=sharing",
  resumeDownloadUrl:
    "https://drive.google.com/uc?export=download&id=1ZLB5BreWeAJCiNlU4_8QRwpSTVQFEeAy",
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
   * The AI/robotic counterpart of the hero cut-out, revealed under the cursor by
   * `HeroPortraitReveal`. Keyed with the **same matte** as `portraitCutout` (eroded a few px),
   * so the two silhouettes cannot disagree and the reveal can never paint outside the subject.
   *
   * Derived by `scripts/cutout.py` from `public/portrait-robotic.jpg` (Abdul replaced the
   * earlier `robotic_portrait.jpeg` on 2026-08-29). **A replacement source has one hard
   * requirement: it must be the same 832x1248 frame with the head in the same place**, because
   * the photo's matte is applied to it unchanged — the script raises if the dimensions differ,
   * but only the eye can catch a pose that has drifted. Verified for this one: hair, jaw, collar
   * and tie all land within a couple of pixels of the photograph's.
   */
  portraitRobotic: {
    src: "/robotic-portrait-cutout.png",
    alt: "Abdul Qadir reimagined as an AI: chrome plating and blue circuitry over the same portrait.",
  },
  /**
   * The framed About portrait — the **raw photo, background intact**, at Abdul's request.
   *
   * The trade being accepted: the backdrop is a mid-grey (L~100), so the portrait-tied
   * constellation Phase 6 layers over this frame is close to invisible against it. The frame
   * provides the edge, so nothing spills.
   */
  portrait: {
    src: "/portrait2.jpeg",
    alt: "Abdul Qadir, wearing a grey suit and navy tie, against a grey studio backdrop.",
  },
  socials: [
    { label: "GitHub", href: "https://github.com/Abd-ul-Qadir", icon: "github" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/abd-ul-qadir/",
      icon: "linkedin",
    },
    // X/Twitter. Confirmed live (HTTP 200) before being added: a dead profile in `sameAs`
    // actively harms entity consolidation rather than being merely useless.
    { label: "X", href: "https://x.com/AbdullQadir_", icon: "x" },
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
  /** Checkmark-bulleted sub-points (`DESIGN_SYSTEM.md` #10) — what the client gets. */
  readonly points: readonly string[];
  /**
   * What it is built with, rendered as `Badge`s at the foot of the card — the same treatment
   * project cards give their stacks, so a technology reads identically wherever it appears.
   *
   * **Kept to four entries, using Abdul's own slash notation** (`Django / Flask / FastAPI`)
   * rather than one badge per technology. Spelling all nine out turned the 1-column bento
   * cards into a wall of chips that buried the description above them; grouping by role keeps
   * the row to a single line on the wide cards and two on the narrow ones.
   */
  readonly stack: readonly string[];
}

/**
 * The four offers, rewritten to Abdul's brief of 2026-08-29:
 *
 *   1 web apps, 2 cross-platform mobile apps, 3 AI agents, 4 AI SaaS / ERP / CRM.
 *
 * **This replaces the previous split of web / app / n8n agents / "AI-ML powered apps".** That
 * last card was the problem: "integrating trained ML models for predictive analytics" is a
 * *technique*, not something a client buys, and it overlapped the other three rather than
 * standing beside them. The new fourth card is the business-platform work Abdul actually ships
 * — the ICPS ERP and the Pyora CRM are both in `experience` above — which is a distinct offer.
 *
 * **AI is now the through-line rather than one card's subject.** Every card names a model layer,
 * because that is Abdul's positioning: not "web development, and separately some AI", but
 * AI-powered products in four shapes.
 *
 * **Card 3 is titled "AI Agents & Automations".** The brief lists the two separately in its
 * opening line but gives one card for them, and n8n and Make are automation platforms — so they
 * are one offer with two names, not two offers.
 *
 * **Card 4's stack is derived, not invented.** The brief gives no technologies for it; these are
 * the ones Abdul's own ERP and CRM entries in `experience` name (React, Django, PostgreSQL),
 * plus Next.js from `skillGroups` and the same model layer as the other three cards.
 */
export const services: readonly Service[] = [
  {
    id: "web-apps",
    title: "AI-Powered Web Apps",
    description:
      "Web applications with a React or Next.js front end and a Python back end, wired to Gemini, OpenAI or Claude so the intelligence is part of the product rather than a feature bolted on beside it.",
    icon: "globe",
    points: [
      "React & Next.js front ends",
      "Django, Flask & FastAPI back ends",
      "LLM features built into the core flow",
      // Carried over from the card this replaced. Four bullets rather than three is also what
      // fills the wide bento cell: at three, the narrow card beside it was taller and this one
      // showed a hollow band between the list and its stack row.
      "Responsive by default",
    ],
    stack: ["React.js", "Next.js", "Django / Flask / FastAPI", "Gemini / OpenAI / Claude"],
  },
  {
    id: "mobile-apps",
    title: "Cross-Platform Mobile Apps",
    description:
      "One React Native codebase shipping to both Android and iOS, backed by a Python API and the same model layer as the web work.",
    icon: "smartphone",
    points: ["One codebase, Android & iOS", "Python API back ends"],
    // "Android & iOS" deliberately is *not* a badge here. The stack row is technologies; the
    // platforms are a capability, and the bullet above already says "One codebase, Android &
    // iOS". It also cost real layout: as a narrow bento cell this card wrapped to three badge
    // rows, which made it the tallest in its row and left a hollow gap in the wide card beside
    // it. Three badges wrap to two rows and the pair sit level.
    stack: ["React Native", "Django / Flask / FastAPI", "Gemini / OpenAI / Claude"],
  },
  {
    id: "ai-agents",
    title: "AI Agents & Automations",
    description:
      "Autonomous agents and automated workflows: retrieval over your own data, orchestration across the tools you already run, and the model layer of your choice.",
    icon: "workflow",
    points: ["Retrieval-augmented agents", "n8n & Make orchestration"],
    stack: ["Pinecone", "n8n", "Make", "Gemini / OpenAI / Claude"],
  },
  {
    id: "ai-saas-erp-crm",
    title: "AI SaaS, ERP & CRM",
    description:
      "Complete business platforms — SaaS products, ERP and CRM systems — with role-based access, analytics dashboards and automated workflows. The kind of system I have already built and shipped in production.",
    icon: "layout-dashboard",
    points: [
      "Role-based access & permissions",
      "Analytics dashboards",
      "Automated business workflows",
    ],
    stack: ["React.js", "Next.js", "Django", "PostgreSQL", "Gemini / OpenAI / Claude"],
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

/**
 * Work history, taken from Abdul's CV (`Resume (2).pdf`, supplied 2026-08-27).
 *
 * **The CV is the source of truth for this array, not `CONTENT_BRIEF.md`.** It is newer and it
 * is the document he sends to employers, so where the two disagree the CV wins. Two entries the
 * brief had are deliberately gone as a result — see the note on the Pyora entry below and the
 * session log.
 */
export const experience: readonly TimelineEntry[] = [
  {
    id: "icps-full-stack",
    kind: "work",
    title: "Full-Stack Web Developer",
    organization: "ICPS Pvt. Ltd.",
    period: "July 2026 – Present",
    startYear: 2026,
    arrangement: "Onsite · Full-time",
    bullets: [
      "ERP System — React, Django, PostgreSQL, Hostinger VPS: developed a full-stack ERP system using ReactJS and Django to manage Administration, Sales, Operations, Course Management, HR, and Accounts through a centralized web platform with role-based access and automated workflows.",
    ],
  },
  {
    /**
     * The CV folds what used to be two separate Pyora entries — a 2024 internship and an
     * "Aug 2025 – Present" full-stack role — into one full-time role running July 2025 to July
     * 2026, and it carries the Pyzk attendance work as a bullet of that role rather than of an
     * internship. This follows the CV.
     */
    id: "pyora-full-stack",
    kind: "work",
    title: "Full-Stack Web Developer",
    organization: "Pyora Solutions",
    period: "July 2025 – July 2026",
    startYear: 2025,
    arrangement: "Hybrid · Full-time",
    bullets: [
      "Pyzk Attendance Machine Application — Python, Pyzk, Oracle, PostgreSQL: built a GUI-based biometric attendance system using Pyzk to interface with ZKTeco devices, integrating automated/manual attendance synchronization, error logging, and centralized machine management.",
      "POS System — Django, Oracle, PostgreSQL: built a Django-based POS system with modules for dashboard, customer orders, kitchen orders, checkout, stock management, and table booking, with data transfer between Oracle and PostgreSQL databases.",
      "CRM System — Django, React, PostgreSQL: developed a full-stack CRM with analytics dashboard, customer and CRM staff management, lead and task tracking, and role-based permissions.",
    ],
  },
  {
    id: "octanet-intern",
    kind: "work",
    title: "Python Developer Intern",
    organization: "OctaNet Services Pvt. Ltd",
    period: "April 2024 – May 2024",
    startYear: 2024,
    arrangement: "Internship",
    bullets: [
      "Developed an ATM application using Python with five classes to manage transaction history, withdrawals, deposits, transfers, and account exit functionality.",
    ],
  },
  {
    /**
     * **Not on the CV, and kept on purpose.** It was removed when Experience was synced to
     * `Resume (2).pdf`, and Abdul asked for it back on 2026-08-27 — the CV omits it for space,
     * it is not a correction to his history. The site is longer-form than a one-page CV, so it
     * can carry it. Content is the original from `CONTENT_BRIEF.md`, unchanged.
     *
     * Sits after OctaNet because both start in 2024 and the timeline's sort is stable: OctaNet
     * (April–May) is the later of the two.
     */
    id: "cognorise-intern",
    kind: "work",
    title: "Python Development Intern",
    organization: "CognoRise InfoTech",
    period: "March 2024 – April 2024",
    startYear: 2024,
    arrangement: "Internship",
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
  /**
   * Human-readable year or range. `null` where the CV gives none — the detail page drops the
   * row rather than showing a guessed date.
   */
  readonly date: string | null;
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
    /**
     * New in the 2026-08-27 CV.
     *
     * **`liveUrl` is null because there is no live demo — confirmed by Abdul, not unknown.** It
     * is a mobile app, so there is nothing to link to; the "Live Preview" button stays hidden,
     * which is Phase 9's rule (a missing link is a hidden button, never a dead click).
     *
     * `cardImage`, `heroImage` and `date` are **pending** — Abdul is supplying them. Until then
     * `MediaFrame` renders a labelled placeholder occupying exactly the space the real asset
     * will, so dropping the files in cannot shift the layout, and the detail page omits the
     * Date row rather than showing a guess.
     *
     * `role` and `type` are derived from the CV's own description, the way the other three
     * entries were.
     */
    slug: "calorie-counter-ai",
    title: "Calorie Counter AI",
    pitch:
      "AI-powered calorie tracking mobile app built with React Native and the Gemini API — add and analyse meals, estimate calories and nutrition, and track daily intake.",
    role: "Full-Stack Developer",
    type: "AI Mobile Application",
    date: null,
    stack: ["React Native", "Gemini API", "JavaScript", "Supabase"],
    abstract:
      "Developed an AI-powered calorie tracking mobile application using React Native and the Gemini API, enabling users to add and analyze meals, estimate calorie and nutritional values, log daily food intake, and monitor nutrition progress through an interactive dashboard.",
    liveUrl: null,
    repoUrl: null,
    cardImage: {
      src: "/projects/calorie-counter-ai-card.jpeg",
      alt:
        "Infographic for NutriAI, an AI-powered calorie tracking mobile app built with React Native and the Gemini API: two phone mockups show a daily-calorie ring reading 560 calories with protein, carbs and fat macros, and a camera view identifying grilled chicken and vegetables totalling 350 kcal. Four surrounding panels read Add Meals Effortlessly, AI Nutrition Analysis, Track Daily Intake and Set Personalized Goals.",
    },
    heroImage: null,
  },
  {
    slug: "pest-eye",
    title: "Pest Eye",
    pitch:
      "Developed a full-stack pest identification system with a React Native mobile app and ReactJS web application, integrating a trained EfficientNet model through FastAPI for crop pest classification and using Firebase for authentication, data storage, and notifications.",
    role: "Full-Stack Developer",
    type: "AI Mobile & Web Application",
    date: "2024",
    stack: ["React Native", "ReactJS", "FastAPI", "Firebase", "PyTorch", "EfficientNet"],
    abstract:
      "Plants are affected by many pests, one of agriculture's biggest problems — roughly 40% of global crops are lost to pests annually (~$69B in economic loss). Rural farmers often lack the resources for effective pest control, and manual identification is slow, inaccurate, and costly. Pest Eye uses deep learning to classify crop pests from images across a cross-platform system, trained on a large pest dataset for quick identification. By analyzing past pest-attack data it also provides predictive insights to help prevent future infestations — giving farmers without direct expert access pesticide recommendations and automated, history-based notifications.",
    liveUrl: "https://pesteyee.netlify.app/",
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
    stack: ["Python", "Pandas", "Scikit-learn", "KMeans", "PCA", "Gradio", "Hugging Face"],
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
    stack: ["HTML", "CSS", "JavaScript", "Django", "Python", "Linear Regression"],
    abstract:
      "A web application that predicts Netflix's future stock price by training a linear regression model on historical price data, then serving predictions through a Django-backed web app.",
    liveUrl: "https://netflix-stock-price-predictor-p9li.onrender.com/",
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

/**
 * The unscored stack, in the CV's own five categories plus one for tooling.
 *
 * **Taken from `Resume (2).pdf`'s Technical Skills (2026-08-27), which is the source of truth
 * here.** The site's previous grouping (backend / frontend / data-ai-ml / databases / tools) was
 * the brief's, and it both missed a lot — Java, C#, Next.js, MySQL, SQLite, NumPy, Matplotlib,
 * Seaborn, Make, OpenAI API, Pinecone — and split the same technologies differently from how
 * Abdul presents them to employers.
 *
 * **"Tools & platforms" is the one group the CV does not name.** Everything in it is still drawn
 * from the CV — Firebase and Supabase from the project stacks, Gradio and Hugging Face from
 * Customer Segmentation, Pyzk from the Pyora role, Hostinger VPS from the ICPS role — plus Git,
 * which the site already listed and the CV does not contradict. Nothing here is invented.
 *
 * **The modelling techniques are deliberately not repeated here.** KMeans, PCA, RFM analysis,
 * Linear Regression and EfficientNet live in the individual project stacks, which is exactly
 * where the CV puts them, and they render as tags on those project cards. Listing them twice
 * would pad this section rather than inform it.
 *
 * Six groups is also what the layout wants: `Skills.tsx` tiles these three-up on `lg`, so six
 * fills two clean rows with no orphan.
 */
export const skillGroups: readonly SkillGroup[] = [
  {
    id: "languages",
    label: "Languages",
    items: ["Python", "Java", "C++", "C#", "SQL", "JavaScript", "HTML/CSS"],
  },
  {
    id: "frameworks",
    label: "Frameworks",
    items: ["Django", "FastAPI", "Flask", "React", "React Native", "Next.js"],
  },
  {
    id: "databases",
    label: "Databases",
    items: ["PostgreSQL", "Oracle", "MySQL", "SQLite"],
  },
  {
    id: "libraries",
    label: "Libraries",
    items: [
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Scikit-learn",
      "Seaborn",
      "PyTorch",
      "Tkinter",
    ],
  },
  {
    id: "agentic-ai",
    label: "Agentic AI",
    items: ["n8n", "Make", "OpenAI API", "Gemini API", "Pinecone"],
  },
  {
    id: "tools",
    label: "Tools & platforms",
    items: [
      "Firebase",
      "Supabase",
      "Gradio",
      "Hugging Face Spaces",
      "Git",
      "Pyzk (biometric devices)",
      "Hostinger VPS",
    ],
  },
];


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
   * Whether the terminal-skinned message form ships alongside the direct links.
   *
   * `CONTENT_BRIEF.md`'s last open question — form or links only — was **answered by Abdul on
   * 2026-08-27: ship the working form**, with each submission emailed to him. It posts to
   * `app/api/contact/route.ts`, which sends through Resend.
   *
   * Kept as a flag rather than deleted: it is the switch that takes the form down (falling
   * back to the direct links, which never stop working) without touching component code.
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
  formEnabled: true,
};

/**
 * The four contact nodes the Contact section renders as orbs.
 *
 * **Assembled from what already exists, never restated.** GitHub lives in `identity.socials`
 * (it is a profile, not a contact method); the other three come straight out of
 * `contact.methods`. Deriving the list rather than writing a fourth literal is what guarantees
 * the orbs cannot drift out of sync with the rest of the site — change the email in `identity`
 * and the orb follows.
 *
 * Order is deliberate: the two things a recruiter opens first, then the two direct lines.
 */
/** Short supporting lines for the social orbs. Captions only. */
const NODE_HINTS: Record<string, string> = {
  github: "View work",
  linkedin: "Connect",
  instagram: "Follow",
  x: "Follow",
};

/**
 * The social profiles the Contact section renders as orbs — GitHub, LinkedIn, Instagram.
 *
 * **Orbs are for profiles, not for reachable values.** An orb hides what it points at behind an
 * icon, which is right for a profile you click through to and wrong for an email address or a
 * phone number: those are things a visitor needs to *read*, copy, or dial from a printed page.
 * Those two live in `directContacts` below and are rendered as their actual values.
 *
 * Built straight from `identity.socials`, in that order, and an entry with no matching social is
 * skipped rather than faked — a removed profile means one fewer orb, never a dead link.
 */
export interface ContactNode {
  readonly id: string;
  readonly label: string;
  readonly hint: string;
  readonly href: string;
  readonly icon: IconName;
}

export const contactNodes: readonly ContactNode[] = identity.socials.map((social) => ({
  id: social.icon,
  label: social.label,
  hint: NODE_HINTS[social.icon] ?? "",
  href: social.href,
  icon: social.icon,
}));

/**
 * Email and phone, shown as their real values rather than hidden behind an icon.
 *
 * Sourced from `contact.methods`, so the address and number stay in one place — `identity` — and
 * the `mailto:` / `tel:` hrefs are the ones the rest of the site already uses.
 */
export type DirectContact = ContactMethod;

export const directContacts: readonly DirectContact[] = contact.methods.filter(
  (method) => method.id === "email" || method.id === "phone",
);

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
 * The technologies used to build this portfolio, rendered in the footer as a compact build
 * signature. Keep this focused on the parts a visitor can meaningfully inspect rather than
 * mirroring every utility package in `package.json`.
 */
export const portfolioStack = [
  { id: "nextjs", label: "Next.js" },
  { id: "tailwind", label: "Tailwind CSS" },
  { id: "gsap", label: "GSAP" },
  { id: "framer-motion", label: "Framer Motion" },
] as const;

/**
 * Canonical origin, used by `generateMetadata`, the sitemap and OG tags in Phase 13.
 * [TODO] Replace once the production domain is confirmed — Vercel deploy is Phase 14.
 */
export const siteUrl = "https://abdullqadir.vercel.app";
