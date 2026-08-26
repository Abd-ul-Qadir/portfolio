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
        /** Hero: copy gets the majority, portrait sits beside it. */
        hero: "minmax(0, 1.15fr) minmax(0, 0.85fr)",
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
        /** Navbar wordmark. Below the artwork's native 156px so it stays sharp at 2x. */
        wordmark: "124px",
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
        /**
         * A short dash travelling the length of a skill connection, from the outer node in
         * toward the `AI ENGINEER` hub — the ecosystem's equivalent of the neural field's data
         * packets. The line is 40 viewBox units long, so the offset sweeps that full distance.
         */
        "synapse-flow": {
          // Distance comes from `--flow-span`, set per connection from its measured length —
          // the segments are no longer all the same length now that they stop at each circle's
          // edge and the circles differ in size.
          from: { strokeDashoffset: "var(--flow-span, 40)" },
          to: { strokeDashoffset: "0" },
        },
        /**
         * The ecosystem turning on its axis, and the exact inverse for each node's content.
         *
         * The two MUST share a duration and timing function: the node wrapper spins with the
         * orbit while its label counter-spins by the same amount, which is what keeps every
         * label upright and readable instead of tumbling upside down at the halfway point.
         */
        "ecosystem-spin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "ecosystem-counterspin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(-360deg)" },
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
        /** Deliberately unhurried — a signal passing, not a chase light. */
        "synapse-flow": "synapse-flow 3.2s linear infinite",
        /** Slow enough to read as a system idling, not as a carousel. Keep both in step. */
        "ecosystem-spin": "ecosystem-spin 48s linear infinite",
        "ecosystem-counterspin": "ecosystem-counterspin 48s linear infinite",
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
        /**
         * **Never hand-write a `WebkitBackdropFilter` alongside `backdropFilter` here.**
         *
         * Every glass class used to declare both. The production minifier deduplicated them
         * down to **only `-webkit-backdrop-filter`** and dropped the standard property — which
         * Chrome still honours (so it looked fine in every screenshot) but Firefox does not
         * support at all, leaving every glass surface on the site — nav, cards, the contact
         * panel, the lightbox, the skills hub — as a flat translucent film with no blur for
         * those users. Declaring only the standard property lets autoprefixer add whatever
         * prefix the browserslist targets actually need, and it cannot be deduped away.
         *
         * If you change one of these, re-check the built CSS, not just Chrome:
         *   grep -o "\.glass-surface{[^}]*}" .next/static/chunks/*.css
         */

        /** Glass only where it earns its place: cards and the nav bar. */
        ".glass-surface": {
          backgroundColor: v("bg-glass"),
          backdropFilter: "blur(16px)",
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
        /** Bloom behind the hero portrait. */
        ".ambient-orb-hero": {
          width: "30rem",
          height: "30rem",
          right: "-4rem",
          bottom: "-2rem",
          opacity: "0.13",
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
          // 0.5s, not 0.7s: this class animates the hero copy, and the tagline is the page's
          // LCP element. Because `rise-in` starts at `opacity: 0` with `both` fill, the text
          // is not painted until the animation has progressed, so its duration and delay are
          // added directly to LCP. Measured at 0.7s + a 0.24s stagger, LCP element render
          // delay was 1,206ms. Keep this short.
          animation: "rise-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
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

        /**
         * The navbar's scrolled state.
         *
         * Deliberately **not** `.glass-surface`, which is a 4%-*white* film: that works over
         * the calm card surfaces it was designed for, but the nav bar sits over a live neural
         * mesh whose activated connections are bright cyan, and a white wash at 16px blur does
         * not stop a lit line reading straight through 12px mono labels. This tints *down*
         * toward the page background instead, so the labels always have a dark ground.
         * `saturate` keeps the blurred violet/cyan behind it from going grey and lifeless.
         */
        ".glass-nav": {
          backgroundColor: baseAt(72),
          backdropFilter: "blur(20px) saturate(140%)",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: v("border-subtle"),
        },

        /**
         * The navbar's at-rest state over the hero.
         *
         * `DESIGN_SYSTEM.md` asks for the bar to be transparent there, but transparent cannot
         * mean illegible. This keeps the design intent — no border, no visible edge, the hero
         * still reads as full-bleed — while blurring and darkening just enough behind the
         * labels.
         *
         * The mask is what makes it invisible as a band: both the tint *and* the backdrop blur
         * fade to nothing before the element ends, so there is no hard edge where the blur
         * stops. It must therefore live on its own element rather than on `<header>` — a mask
         * applies to an element's children too, and on the header it would fade out the bottom
         * of the nav text itself.
         */
        ".nav-veil": {
          backdropFilter: "blur(12px)",
          backgroundImage: `linear-gradient(to bottom, ${baseAt(88)} 0%, ${baseAt(50)} 55%, transparent 100%)`,
          maskImage: "linear-gradient(to bottom, black 0%, black 45%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 45%, transparent 100%)",
        },

        /**
         * A soft local well behind the skill ecosystem.
         *
         * The site-wide neural field is deliberately dense and bright, and its `clusters` stage
         * puts its densest knots at roughly the radius the skill nodes orbit at — so the
         * ecosystem's own nodes were being visually swallowed by the decoration behind them.
         * This dims the field just under the ecosystem and fades to nothing well before its
         * edge, so the background stays dense everywhere else and the foreground wins where it
         * needs to. Radial rather than a flat panel precisely so it has no visible boundary.
         */
        /**
         * A local well in the background field so the ecosystem is not lost in it.
         *
         * **Kept deliberately shallow.** At the 90% it started at, this covered the middle of
         * the Skills section almost completely — and since the neural field is the layer it
         * covers, the field's cursor interaction was invisible exactly where a reader's pointer
         * spends its time. Abdul reported the background as "not interactive" for this reason;
         * it was reacting the whole time, under an opaque lid. Raise this only as far as the
         * ecosystem actually needs.
         */
        ".ecosystem-scrim": {
          backgroundImage: `radial-gradient(circle at 50% 50%, ${baseAt(56)} 0%, ${baseAt(42)} 34%, ${baseAt(18)} 58%, transparent 76%)`,
        },

        /** Dimmed, blurred backdrop behind a modal dialog. */
        ".scrim-backdrop": {
          backgroundColor: baseAt(80),
          backdropFilter: "blur(4px)",
        },

        /**
         * Bottom-up scrim on a project card, so the title stays legible over any image.
         * A gradient rather than a flat tint — a flat one dulls the whole image.
         */
        ".project-scrim": {
          backgroundImage: `linear-gradient(to top, ${baseAt(92)} 0%, ${baseAt(55)} 35%, transparent 70%)`,
        },

        /**
         * Loader status lines. All four are rendered up front and revealed by the timeline
         * setting `data-visible`, so staging them costs a style recalculation rather than a
         * React re-render — see the performance note in `Loader.tsx`.
         */
        ".loader-line": {
          opacity: "0",
          transform: "translateY(4px)",
          transition: "opacity 200ms ease-out, transform 200ms ease-out",
          '&[data-visible="true"]': {
            opacity: "1",
            transform: "translateY(0)",
          },
        },

        /**
         * Hero portrait treatment. The source photo is a subject on near-black, **not** a
         * background-removed cutout (its alpha channel is fully opaque). `mix-blend-mode:
         * screen` composites black to nothing against the dark page, so it reads as a cutout
         * without keying — which matters because the hair is nearly as dark as the
         * background and any luminance key would eat it. The mask feathers the crop edges so
         * it dissolves into the page instead of ending on a hard line.
         */
        ".hero-portrait": {
          // The source is a real cut-out (see `identity.portraitCutout`), so no blend mode is
          // needed — an earlier `mix-blend-mode: screen` version lifted the image's near-black
          // rectangle above the page background and left a visible box. This only feathers the
          // bottom crop so the subject dissolves into the section instead of ending on a line.
          maskImage: "linear-gradient(to bottom, black 76%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 76%, transparent 100%)",
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
