import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

import { tokens, violetAt } from "./lib/tokens";

/**
 * Single source of truth for the design tokens in `docs/DESIGN_SYSTEM.md`.
 *
 * Raw values live in `lib/tokens.ts` and nowhere else — the plugin at the bottom emits every one of
 * them onto `:root` as a CSS custom property, so non-Tailwind consumers (the constellation
 * canvas, GSAP timelines, inline SVG) read the identical value via `var(--token)` instead of
 * keeping a second copy. Do not re-declare any of these in `globals.css`, and do not inline
 * hex values or arbitrary Tailwind values in JSX.
 */
type TokenName = keyof typeof tokens;

const v = (name: TokenName) => `var(--${name})`;

/** Page background at a given alpha, derived from the token rather than restated. */
const baseAt = (percent: number) =>
  `color-mix(in srgb, ${v("bg-base")} ${percent}%, transparent)`;

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: v("bg-base"),
          deep: v("bg-deep"),
          surface: v("bg-surface"),
          glass: v("bg-glass"),
        },
        border: {
          subtle: v("border-subtle"),
          hover: v("border-hover"),
        },
        text: {
          primary: v("text-primary"),
          secondary: v("text-secondary"),
        },
        cursor: {
          fill: v("cursor-fill"),
        },
        accent: {
          violet: v("accent-violet"),
          /** Text/icon-safe violet — see the note in `lib/tokens.ts`. */
          "violet-text": v("accent-violet-text"),
          indigo: v("accent-indigo"),
          cyan: v("accent-cyan"),
          pink: v("accent-pink"),
          emerald: v("accent-emerald"),
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        primary: v("gradient-primary"),
      },
      boxShadow: {
        glow: v("glow-primary"),
        "glow-strong": v("glow-strong"),
        elevated: v("shadow-elevated"),
      },
      aspectRatio: {
        portrait: "4 / 5",
        /** Project card / detail hero. */
        project: "16 / 11",
        /** Certificate and award thumbnails — closer to a landscape document. */
        credential: "4 / 3",
      },
      gridTemplateColumns: {
        /** About: portrait column narrower than the text column. */
        about: "minmax(0, 0.8fr) minmax(0, 1.2fr)",
      },
      borderRadius: {
        card: "1rem",
        panel: "1.5rem",
        pill: "9999px",
      },
      /** Fluid, confident type for hero/section headings (`DESIGN_SYSTEM.md` Typography). */
      fontSize: {
        display: ["clamp(2.75rem, 8vw, 6rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        heading: ["clamp(2rem, 4.5vw, 3.25rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        eyebrow: ["0.75rem", { lineHeight: "1", letterSpacing: "0.3em" }],
        /** The contextual label inside the expanded cursor ring. */
        cursor: ["0.5rem", { lineHeight: "1", letterSpacing: "0.15em" }],
        /** Skill-ecosystem node labels — small enough to sit inside a circular node. */
        node: ["0.5625rem", { lineHeight: "1.2", letterSpacing: "0.02em" }],
      },
      /** Generous, consistent section rhythm — the whitespace is doing real work here. */
      spacing: {
        section: "clamp(6rem, 12vw, 10rem)",
      },
      /**
       * One z-scale for the whole site, so the stacking order is decided here and not by
       * whichever component was written last:
       * nav (30) < grain (40) < loader (45) < cursor (50).
       * The loader must cover the nav; the cursor must stay visible over everything.
       */
      zIndex: {
        nav: "30",
        grain: "40",
        loader: "45",
        cursor: "50",
      },
      letterSpacing: {
        /** Mono UI labels: nav items, badges, button text. */
        label: "0.15em",
        /** Wordmark and loader lettering. */
        mark: "0.2em",
        /** Section eyebrows. */
        eyebrow: "0.3em",
      },
      opacity: {
        /** The grain layer's resting opacity — barely perceptible by design. */
        grain: "0.035",
      },
      transitionProperty: {
        /** The navbar compacts on scroll; only its height animates. */
        height: "height",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "orb-drift": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(2%, -3%, 0) scale(1.06)" },
        },
        "rise-in": {
          from: { opacity: "0", transform: "translate3d(0, 24px, 0)" },
          to: { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        "caret-blink": {
          "0%, 45%": { opacity: "1" },
          "50%, 95%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "arrow-nudge": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
        "grain-shift": {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "25%": { transform: "translate3d(-1%, 1%, 0)" },
          "50%": { transform: "translate3d(1%, -1%, 0)" },
          "75%": { transform: "translate3d(1%, 1%, 0)" },
        },
      },
      animation: {
        /** Deliberately very slow — this is ambience, not motion you should notice. */
        "orb-drift": "orb-drift 24s ease-in-out infinite",
        "grain-shift": "grain-shift 12s steps(4, end) infinite",
        "caret-blink": "caret-blink 1.1s steps(1, end) infinite",
        "arrow-nudge": "arrow-nudge 2s ease-in-out infinite",
      },
    },
  },
  plugins: [
    plugin(({ addBase, addComponents }) => {
      addBase({
        ":root": Object.fromEntries(
          Object.entries(tokens).map(([key, value]) => [`--${key}`, value]),
        ),
      });

      addComponents({
        /** Glass only where it earns its place: cards and the nav bar. */
        ".glass-surface": {
          backgroundColor: v("bg-glass"),
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: v("border-subtle"),
        },
        /** Short headline phrases only — never body copy (`DESIGN_SYSTEM.md` Colour). */
        ".text-gradient-primary": {
          backgroundImage: v("gradient-primary"),
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
        },

        /**
         * Ambient background texture. Pure CSS — no per-frame JS — so it can run everywhere
         * without a measurable frame cost. `--dot-size` and `--dot-gap` are overridable per
         * instance; Phase 12 scrubs the element's opacity at the About boundary.
         */
        ".dot-grid": {
          "--dot-size": "1.25px",
          "--dot-gap": "28px",
          backgroundImage: `radial-gradient(${v("dot-color")} var(--dot-size), transparent var(--dot-size))`,
          backgroundSize: "var(--dot-gap) var(--dot-gap)",
        },

        /**
         * Ambient radial light (`DESIGN_SYSTEM.md` #11/#12). Size, position, opacity and the
         * stagger between orbs live here rather than as arbitrary values in JSX. The drift is
         * ambience, so it stops outright under `prefers-reduced-motion`.
         */
        ".ambient-orb": {
          position: "absolute",
          borderRadius: "9999px",
          filter: "blur(64px)",
          animation: "orb-drift 24s ease-in-out infinite",
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
          },
        },
        ".ambient-orb-a": {
          width: "28rem",
          height: "28rem",
          top: "0",
          left: "-8rem",
          opacity: "0.10",
        },
        ".ambient-orb-b": {
          width: "24rem",
          height: "24rem",
          top: "33%",
          right: "-6rem",
          opacity: "0.10",
          animationDelay: "-8s",
        },
        ".ambient-orb-c": {
          width: "20rem",
          height: "20rem",
          bottom: "0",
          left: "33%",
          opacity: "0.07",
          animationDelay: "-16s",
        },

        /**
         * The outer cursor ring. Only size and fill transition — position is driven by
         * Framer Motion springs on `transform`, so a blanket `transition-all` here would
         * fight them.
         */
        ".cursor-ring": {
          transitionProperty: "width, height, background-color, border-color",
          transitionDuration: "300ms",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        },

        /**
         * The hero's staggered entrance.
         *
         * Deliberately CSS rather than Framer Motion (see `PROGRESS.md`'s decision log): a
         * Framer entrance server-renders `style="opacity:0"` on the `<h1>`, which is the
         * page's LCP element — it would stay invisible until hydration, and forever without
         * JS. A CSS animation starts at first paint instead, with no JS involved, and the
         * markup is meaningful with scripting off.
         *
         * Stagger comes from an inline `animation-delay` per child.
         */
        ".rise-in": {
          animation: "rise-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
          "@media (prefers-reduced-motion: reduce)": {
            // No animation at all — the element simply renders in its final state.
            animation: "none",
          },
        },

        /**
         * Services cards (Phase 7). `card-tilt` supplies the perspective the 3D rotation is
         * read against; `card-spotlight` is the soft glow that follows the cursor inside the
         * card, positioned from the `--spot-x` / `--spot-y` custom properties that
         * `TiltCard` writes on pointer move.
         */
        ".card-tilt": {
          perspective: "900px",
          transformStyle: "preserve-3d",
        },
        ".card-spotlight": {
          "--spot-x": "50%",
          "--spot-y": "50%",
          backgroundImage: `radial-gradient(220px circle at var(--spot-x) var(--spot-y), ${violetAt(18)}, transparent 70%)`,
        },

        /**
         * Experience timeline rail (Phase 8). The offsets line the rail up with the centre of
         * the 16px/24px nodes, so they live here rather than as arbitrary values in JSX.
         */
        ".timeline-rail": {
          position: "absolute",
          left: "7px",
          top: "0.5rem",
          width: "1px",
          height: "calc(100% - 1rem)",
          "@media (min-width: 640px)": {
            left: "11px",
          },
        },

        /** Dimmed, blurred backdrop behind a modal dialog. */
        ".scrim-backdrop": {
          backgroundColor: baseAt(80),
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        },

        /**
         * Bottom-up scrim on a project card, so the title stays legible over any image.
         * A gradient rather than a flat tint — a flat one dulls the whole image.
         */
        ".project-scrim": {
          backgroundImage: `linear-gradient(to top, ${baseAt(92)} 0%, ${baseAt(55)} 35%, transparent 70%)`,
        },

        /**
         * The Phase 12 Hero -> About travelling glow. Size lives here rather than as an
         * arbitrary value in JSX; position and opacity are scrubbed by the hero timeline.
         */
        ".transition-blob": {
          width: "26rem",
          height: "26rem",
          borderRadius: "9999px",
          filter: "blur(64px)",
        },

        /** Fades a decorative layer out toward the edges so it never reads as a hard panel. */
        ".mask-radial-fade": {
          maskImage: "radial-gradient(ellipse at center, black 35%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 35%, transparent 75%)",
        },

        /**
         * The very faint, slow-moving grain that keeps flat dark sections from looking
         * sterile. One inline SVG turbulence tile, no particle system.
         */
        ".noise-overlay": {
          // Oversized so the drift never exposes an edge of the tile.
          inset: "-5%",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
        },
      });
    }),
  ],
};

export default config;
