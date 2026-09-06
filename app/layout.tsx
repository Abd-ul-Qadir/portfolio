import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { CursorMount } from "@/components/effects/CursorMount";
import { EasterEgg } from "@/components/effects/EasterEgg";
import { LoaderMount } from "@/components/effects/LoaderMount";
import { NoiseOverlay } from "@/components/effects/NoiseOverlay";
import { SiteBackground } from "@/components/effects/SiteBackground";
import { SmoothScrollProvider } from "@/components/effects/SmoothScrollProvider";
import { identity, siteUrl } from "@/content/data";
import { palette } from "@/lib/tokens";

import "./globals.css";

const sans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Runs at the very start of the document body before first paint. The loader shell is part of the SSR HTML,
 * but CSS keeps it hidden unless this script opts the current visit in. That prevents both
 * failure modes: the hero cannot flash before a first-session loader, and no-JS/reduced-
 * motion/compact/returning visits cannot be trapped behind an overlay.
 */
const loaderGateScript = `
(() => {
  const root = document.documentElement;
  const key = "aq.loader.seen";
  const eventName = "aq:loader-decision";

  try {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(key) === "1";
    } catch {}

    const shouldShow =
      !seen &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !window.matchMedia("(max-width: 639px)").matches;

    root.dataset.loader = shouldShow ? "show" : "skip";

    if (!shouldShow) return;

    try {
      window.sessionStorage.setItem(key, "1");
    } catch {}

    performance.mark("aq-loader-start");

    const renderEarlyProgress = () => {
      if (root.dataset.loader !== "show") return;

      const elapsed = performance.now() -
        performance.getEntriesByName("aq-loader-start", "mark").at(-1).startTime;
      const value = Math.min(72, Math.round(72 * (1 - Math.exp(-elapsed / 3200))));
      const filled = Math.round((value / 100) * 16);
      const bar = document.querySelector("[data-loader-bar]");
      const empty = document.querySelector("[data-loader-bar-empty]");
      const percent = document.querySelector("[data-loader-percent]");

      if (bar) bar.textContent = "█".repeat(filled);
      if (empty) empty.textContent = "░".repeat(16 - filled);
      if (percent) percent.textContent = value + "%";

      document.querySelectorAll("[data-loader-line]").forEach((line, index) => {
        line.dataset.visible = String(value >= [0, 30, 60, 99][index]);
      });
    };

    window.__aqLoaderBootTimer = window.setInterval(renderEarlyProgress, 100);
    renderEarlyProgress();

    window.setTimeout(() => {
      if (root.dataset.loader !== "show") return;
      window.clearInterval(window.__aqLoaderBootTimer);
      root.dataset.loader = "skip";
      window.dispatchEvent(new Event(eventName));
    }, 15000);
  } catch {
    root.dataset.loader = "skip";
  }
})();`;

export const metadata: Metadata = {
  // `metadataBase` resolves the relative OG/Twitter image URLs Next generates from
  // `app/opengraph-image.tsx`. [TODO] Still the placeholder domain — see PROGRESS.md.
  metadataBase: new URL(siteUrl),
  title: {
    default: `${identity.fullName} — ${identity.roles[0]}`,
    // Project pages set their own title; this frames it.
    template: `%s — ${identity.fullName}`,
  },
  description: identity.tagline,
  applicationName: `${identity.fullName} — Portfolio`,
  authors: [{ name: identity.fullName, url: siteUrl }],
  creator: identity.fullName,
  keywords: [
    "Full Stack AI Engineer",
    "Machine Learning Engineer",
    "Agentic AI",
    "Django",
    "FastAPI",
    "React",
    identity.fullName,
  ],
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    siteName: identity.fullName,
    title: `${identity.fullName} — ${identity.roles[0]}`,
    description: identity.tagline,
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${identity.fullName} — ${identity.roles[0]}`,
    description: identity.tagline,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: palette["bg-base"],
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script
          id="aq-loader-gate"
          dangerouslySetInnerHTML={{ __html: loaderGateScript }}
        />
        {/* SSR-first: this must precede page content so the hero cannot paint ahead of it. */}
        <LoaderMount />
        {/* One continuous constellation field behind every section and route. */}
        <SiteBackground />
        {/* Lenis is skipped entirely under reduced motion — see SmoothScrollProvider. */}
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        {/* One global grain layer for the whole page, not one per section. */}
        <NoiseOverlay />
        {/* Unmounted (never merely hidden) on touch devices and under reduced motion. */}
        <CursorMount />
        {/* Undocumented on purpose — see DESIGN_SYSTEM.md. */}
        <EasterEgg />
      </body>
    </html>
  );
}
