import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { CursorMount } from "@/components/effects/CursorMount";
import { EasterEgg } from "@/components/effects/EasterEgg";
import { LoaderMount } from "@/components/effects/LoaderMount";
import { NoiseOverlay } from "@/components/effects/NoiseOverlay";
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
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        {/* Lenis is skipped entirely under reduced motion — see SmoothScrollProvider. */}
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        {/* Skipped entirely under reduced motion, and shown once per browser session. */}
        <LoaderMount />
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
