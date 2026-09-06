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

/**
 * The card's strapline: the **first sentence** of `identity.tagline`.
 *
 * **This used to be a hardcoded string, and it silently went stale.** When the tagline was
 * broadened on 2026-08-29 the card kept advertising "scalable, high-performance web
 * applications" — the one thing the new positioning was meant to stop saying — and nothing
 * caught it, because a literal cannot drift *detectably*. `CLAUDE.md` §3 forbids inline copy for
 * exactly this reason. Deriving it means the card can never disagree with the site again.
 *
 * Only the first sentence: the tagline closes on a call to action ("Let's turn your complex
 * ideas into...") that belongs on the page, not on a preview card, which is read at a glance.
 */
const strapline = identity.tagline.slice(0, identity.tagline.indexOf(". ") + 1);
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
          // Mirrors the site's ambient copper/teal glow.
          backgroundImage: `radial-gradient(circle at 20% 20%, ${palette["accent-copper"]}33, transparent 55%), radial-gradient(circle at 85% 80%, ${palette["accent-teal"]}22, transparent 55%)`,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: palette["accent-copper"],
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
            color: palette["accent-gold"],
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
          {strapline}
        </div>
      </div>
    ),
    size,
  );
}
