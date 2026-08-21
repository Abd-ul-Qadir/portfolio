import { ImageResponse } from "next/og";

import { identity } from "@/content/data";
import { palette } from "@/lib/tokens";

/**
 * The site's social preview card, generated at build time.
 *
 * Deliberately built from the same tokens as the site (`lib/tokens.ts`) rather than
 * hand-picked hexes, so it cannot drift from the palette.
 *
 * Note: `next/og` renders with Satori, which supports only a subset of CSS — no CSS
 * variables, no Tailwind classes, and every flex container needs an explicit `display`.
 * That is why this file uses inline styles with literal token values, and is the one place
 * outside `lib/tokens.ts` allowed to read them directly.
 */

export const alt = `${identity.fullName} — ${identity.roles[0]}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: palette["bg-base"],
          // Mirrors the site's ambient violet glow.
          backgroundImage: `radial-gradient(circle at 20% 20%, ${palette["accent-violet"]}33, transparent 55%), radial-gradient(circle at 85% 80%, ${palette["accent-cyan"]}22, transparent 55%)`,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: palette["accent-violet"],
          }}
        >
          {identity.location}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 104,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            color: palette["text-primary"],
          }}
        >
          {identity.fullName}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 44,
            color: palette["accent-indigo"],
          }}
        >
          {identity.roles[0]}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 36,
            maxWidth: 900,
            fontSize: 28,
            lineHeight: 1.4,
            color: palette["text-secondary"],
          }}
        >
          Building scalable, high-performance web applications powered by AI.
        </div>
      </div>
    ),
    size,
  );
}
