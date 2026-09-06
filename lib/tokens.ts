/**
 * The single source of truth for every design-system value in `docs/DESIGN_SYSTEM.md`.
 *
 * `tailwind.config.ts` imports this to build the theme *and* to emit each entry onto `:root`
 * as a CSS custom property. Application code imports it directly where a literal is genuinely
 * needed at runtime — `viewport.themeColor` in the root layout, and the constellation canvas,
 * which has to paint with a real colour value rather than a class.
 *
 * Nothing else in the repo may contain a colour literal. Prefer a Tailwind class
 * (`text-accent-copper-text`) or `var(--accent-copper)` over importing from here.
 */

const accents = {
  copper: "#E8793E",
  "copper-text": "#F3A66F",
  gold: "#F2B84B",
  teal: "#42C7A5",
  /** Cool circuitry sampled from the robotic portrait; reserved for its activation state. */
  "robot-blue": "#4D8FE8",
  "robot-cyan": "#63DBFF",
  coral: "#E95D55",
  green: "#7BC96F",
} as const;

/** Plain colours. */
export const palette = {
  "bg-base": "#090B0A",
  "bg-surface": "#111511",
  /**
   * Deeper than `bg-base`, used only by the Phase 12 Projects->Contact darkening layer.
   * Overlaying `bg-base` on itself cannot darken anything, so the macro-layer needs a
   * genuinely darker value to fade toward.
   */
  "bg-deep": "#030504",
  "text-primary": "#F4F1E8",
  "text-secondary": "#A0A69F",
  "accent-copper": accents.copper,
  "accent-copper-text": accents["copper-text"],
  "accent-gold": accents.gold,
  "accent-teal": accents.teal,
  "accent-robot-blue": accents["robot-blue"],
  "accent-robot-cyan": accents["robot-cyan"],
  "accent-coral": accents.coral,
  "accent-green": accents.green,
  /**
   * Compatibility aliases for existing utilities and canvas code. Keeping these here makes the
   * palette switch one small, safe change instead of rewriting every component in a dirty tree;
   * new work should use the semantic copper/gold/teal names above.
   */
  "accent-violet": accents.copper,
  "accent-violet-text": accents["copper-text"],
  "accent-indigo": accents.gold,
  "accent-cyan": accents.teal,
  "accent-pink": accents.coral,
  "accent-emerald": accents.green,
} as const;

/**
 * `color-mix` keeps the translucent tokens derived from `palette` rather than restating the
 * same channels as an `rgba()` literal. Supported everywhere Next.js 16 targets
 * (Chrome/Edge/Firefox 111+, Safari 16.4+).
 */
export const brandAt = (percent: number) =>
  `color-mix(in srgb, ${palette["accent-copper"]} ${percent}%, transparent)`;

export const tokens = {
  ...palette,

  /* -- surfaces --------------------------------------------------------- */
  "bg-glass": "rgba(255,255,255,0.04)",

  /* -- borders ---------------------------------------------------------- */
  "border-subtle": "rgba(255,255,255,0.08)",
  "border-hover": brandAt(40),

  /* -- background texture ----------------------------------------------- */
  /**
   * Slightly brighter than `border-subtle`: a 1px dot needs more alpha than a 1px line to
   * read at all against `bg-base`. Still ambience, not decoration.
   */
  "dot-color": "rgba(255,255,255,0.14)",

  /* -- cursor ------------------------------------------------------------ */
  /** Fill of the expanded outer cursor ring. */
  "cursor-fill": "rgba(255,255,255,0.10)",
  /**
   * The cursor's inner dot.
   *
   * A small coral point against the copper/teal field. It is stated explicitly rather than
   * relying on blend-mode output, so the cursor remains consistent over every surface.
   */
  "cursor-dot": accents.coral,

  /* -- composites ------------------------------------------------------- */
  "gradient-primary": `linear-gradient(135deg, ${palette["accent-copper"]}, ${palette["accent-gold"]} 50%, ${palette["accent-teal"]})`,
  /** Diffused copper light behind headings/cards (`DESIGN_SYSTEM.md` #11). */
  "glow-primary": `0 0 40px ${brandAt(25)}`,
  /** Stronger version for the hover/active state on interactive surfaces. */
  "glow-strong": `0 0 60px ${brandAt(35)}`,
  /** Neutral elevation — drop shadows stay colourless unless something is hovered (#6). */
  "shadow-elevated": "0 20px 60px -20px rgba(0,0,0,0.7)",
} as const;

export type TokenName = keyof typeof tokens;

/**
 * `#RRGGBB` -> `rgba(r, g, b, alpha)`.
 *
 * For canvas code only: `<canvas>` needs a real colour string and cannot resolve
 * `var(--accent-copper)` or a Tailwind class. Everything that renders as DOM should keep
 * using a class or a custom property instead of calling this.
 */
export function withAlpha(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** `var(--token)` reference for a token, for use in CSS-in-JS and canvas code. */
export const cssVar = (name: TokenName) => `var(--${name})`;
