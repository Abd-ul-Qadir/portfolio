import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NoiseOverlay } from "@/components/effects/NoiseOverlay";
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
        {children}
        {/* One global grain layer for the whole page, not one per section. */}
        <NoiseOverlay />
      </body>
    </html>
  );
}
