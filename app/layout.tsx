import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { CursorMount } from "@/components/effects/CursorMount";
import { NoiseOverlay } from "@/components/effects/NoiseOverlay";
import { SmoothScrollProvider } from "@/components/effects/SmoothScrollProvider";
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
  title: "Abdul Qadir — Full Stack AI Engineer",
  description:
    "Full Stack AI Engineer building scalable, high-performance web applications powered by AI.",
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
        {/* One global grain layer for the whole page, not one per section. */}
        <NoiseOverlay />
        {/* Unmounted (never merely hidden) on touch devices and under reduced motion. */}
        <CursorMount />
      </body>
    </html>
  );
}
