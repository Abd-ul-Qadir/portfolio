import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

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
 * Runs before hydration through Next's supported script path. The loader shell is part of the
 * SSR HTML and its pending class covers the hero immediately; this script resolves whether the
 * visit should keep showing it before React becomes interactive.
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

    const decision = shouldShow ? "show" : "skip";
    window.__aqLoaderDecision = decision;
    root.dataset.loader = decision;
    window.dispatchEvent(new Event(eventName));

    if (!shouldShow) return;

    try {
      window.sessionStorage.setItem(key, "1");
    } catch {}

    performance.mark("aq-loader-start");

    const renderEarlyProgress = () => {
      if (window.__aqLoaderDecision !== "show") return;

      const elapsed = performance.now() -
        performance.getEntriesByName("aq-loader-start", "mark").at(-1).startTime;
      const value = Math.min(72, Math.round(72 * (1 - Math.exp(-elapsed / 3200))));
      window.__aqLoaderProgress = value;
    };

    window.__aqLoaderBootTimer = window.setInterval(renderEarlyProgress, 100);
    renderEarlyProgress();

    window.setTimeout(() => {
      if (window.__aqLoaderDecision !== "show") return;
      window.clearInterval(window.__aqLoaderBootTimer);
      window.__aqLoaderDecision = "skip";
      root.dataset.loader = "skip";
      window.dispatchEvent(new Event(eventName));
    }, 15000);
  } catch {
    window.__aqLoaderDecision = "skip";
    root.dataset.loader = "skip";
    window.dispatchEvent(new Event(eventName));
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
    // Attribution on shared links, and one more machine-readable tie between the site and
    // the X profile that `sameAs` already claims.
    site: "@AbdullQadir_",
    creator: "@AbdullQadir_",
    title: `${identity.fullName} — ${identity.roles[0]}`,
    description: identity.tagline,
  },
  /**
   * Google Search Console ownership verification.
   *
   * Emits `<meta name="google-site-verification" content="...">` into the homepage `<head>`,
   * which is the "HTML tag" method Search Console offers.
   *
   * **Read from the environment on purpose.** The token is not a secret (it ships in the HTML
   * either way), but keeping it out of the source means the value can be set in Vercel's
   * project settings without a code change, and a fork or a preview deploy does not silently
   * claim ownership of the production property. Unset -> the field is `undefined` and Next
   * emits no tag at all, so this is safe to ship before the value exists.
   *
   * `.vercel.app` cannot use the DNS method: that requires control of the `vercel.app` zone,
   * which belongs to Vercel. This is the right method for this domain.
   */
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
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
      className={`${sans.variable} ${mono.variable} loader-pending`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="aq-loader-gate"
          strategy="beforeInteractive"
        >
          {loaderGateScript}
        </Script>
      </head>
      <body>
        <noscript>
          <style>{`.loader-shell { display: none !important; }`}</style>
        </noscript>
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
