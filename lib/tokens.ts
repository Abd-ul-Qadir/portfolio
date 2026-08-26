/**
 * The single source of truth for every design-system value in `docs/DESIGN_SYSTEM.md`.
 *
 * `tailwind.config.ts` imports this to build the theme *and* to emit each entry onto `:root`
 * as a CSS custom property. Application code imports it directly where a literal is genuinely
 * needed at runtime — `viewport.themeColor` in the root layout, and the constellation canvas,
 * which has to paint with a real colour value rather than a class.
 *
 * Nothing else in the repo may contain a colour literal. Prefer a Tailwind class
 * (`text-accent-violet`) or `var(--accent-violet)` over importing from here.
 */

/** Plain colours. */
export const palette = {
  "bg-base": "#08090D",
  "bg-surface": "#0E1016",
  /**
   * Deeper than `bg-base`, used only by the Phase 12 Projects->Contact darkening layer.
   * Overlaying `bg-base` on itself cannot darken anything, so the macro-layer needs a
   * genuinely darker value to fade toward.
   */
  "bg-deep": "#03040A",
  "text-primary": "#F5F6FA",
  "text-secondary": "#9CA3AF",
  "accent-violet": "#7C3AED",
  /**
   * A lighter violet used **only for text and icons**. `accent-violet` is the brand accent for
   * fills, borders and glows, but at 12px it measures 3.49:1 on `bg-base` and 3.03:1 over the
   * section-heading glow — both below WCAG AA's 4.5:1, which Lighthouse flagged. This tint is
   * the same hue at 7.31:1 and 6.34:1 respectively. Use `text-accent-violet` for type; keep
   * `bg-accent-violet` / `border-accent-violet` for the brand accent itself.
   */
  "accent-violet-text": "#A78BFA",
  "accent-indigo": "#6366F1",
  "accent-cyan": "#22D3EE",
  "accent-pink": "#EC4899",
  "accent-emerald": "#34D399",
} as const;

/**
 * `color-mix` keeps the translucent tokens derived from `palette` rather than restating the
 * same channels as an `rgba()` literal. Supported everywhere Next.js 16 targets
 * (Chrome/Edge/Firefox 111+, Safari 16.4+).
 */
export const violetAt = (percent: number) =>
  `color-mix(in srgb, ${palette["accent-violet"]} ${percent}%, transparent)`;

export const tokens = {
  ...palette,

  /* -- surfaces --------------------------------------------------------- */
  "bg-glass": "rgba(255,255,255,0.04)",

  /* -- borders ---------------------------------------------------------- */
  "border-subtle": "rgba(255,255,255,0.08)",
  "border-hover": violetAt(40),

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
   * This is the colour the old `mix-blend-mode: difference` used to *produce* when the white
   * dot fell over the neural field's cyan core — `|255-34|, |255-211|, |255-238|`. That warm
   * point against the cool field is the look Abdul asked to keep, so now that the cursor no
   * longer blends, it is stated outright instead of being an artefact that only appeared where
   * the core happened to be visible.
   */
  "cursor-dot": "#DD2C11",

  /* -- composites ------------------------------------------------------- */
  "gradient-primary": `linear-gradient(135deg, ${palette["accent-violet"]}, ${palette["accent-indigo"]} 50%, ${palette["accent-cyan"]})`,
  /** Diffused violet light behind headings/cards (`DESIGN_SYSTEM.md` #11). */
  "glow-primary": `0 0 40px ${violetAt(25)}`,
  /** Stronger version for the hover/active state on interactive surfaces. */
  "glow-strong": `0 0 60px ${violetAt(35)}`,
  /** Neutral elevation — drop shadows stay colourless unless something is hovered (#6). */
  "shadow-elevated": "0 20px 60px -20px rgba(0,0,0,0.7)",
} as const;

export type TokenName = keyof typeof tokens;

/**
 * `#RRGGBB` -> `rgba(r, g, b, alpha)`.
 *
 * For canvas code only: `<canvas>` needs a real colour string and cannot resolve
 * `var(--accent-violet)` or a Tailwind class. Everything that renders as DOM should keep
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
