import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

import { brandAt, tokens } from "./lib/tokens";

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
/**
 * The white highlights the glass surfaces are built from.
 *
 * Named here rather than repeated as literals across `.system-module`,
 * `.contact-orb-surface`, `.contact-orb-sheen` and `.liquid-bar`, so the whole glass family
 * shares one definition and a change lands everywhere at once — Phase 14's "no raw colour
 * outside the token layer" standard.
 */
const white = (alpha: number) => `rgba(255,255,255,${alpha})`;
/** Neutral drop shadows. Colourless unless something is hovered (`DESIGN_SYSTEM.md` #6). */
const shade = (alpha: number) => `rgba(0,0,0,${alpha})`;

const baseAt = (percent: number) =>
  `color-mix(in srgb, ${v("bg-base")} ${percent}%, transparent)`;

/**
 * Every `@keyframes` in the project, in one place.
 *
 * **These are emitted by the plugin's `addBase` below, not by Tailwind's `keyframes` theme
 * key, and that is deliberate.** Tailwind only writes an `@keyframes` block out when some
 * `animate-*` utility that references it is actually found in the source — so a keyframe used
 * *only* by a component class in `addComponents` (which is most of them here) silently never
 * reaches the stylesheet. `animation-name` still computes, so `getComputedStyle` reports the
 * animation as present while `element.getAnimations()` returns nothing and the element never
 * moves. Measured before this was fixed: `rise-in` (the hero's entrance stagger) and
 * `cursor-core-spin` (the cursor's counter-rotating arcs) were both dead in production for
 * exactly this reason, and both fail silently into a perfectly reasonable-looking static state.
 *
 * Emitting the lot unconditionally costs a few hundred bytes and removes the trap. If you add
 * a keyframe, add it here — it does not matter whether a utility or a component class uses it.
 */
const keyframes = {
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
   * The About system modules' idle drift. Translate-only so it stays on the compositor, and
   * deliberately tiny — this is a panel settling in space, not a floating balloon.
   */
  "module-float": {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-6px)" },
  },
  /** The scanning sheen that crosses a module's surface on hover. */
  "module-sheen": {
    from: { transform: "translateX(-120%)" },
    to: { transform: "translateX(220%)" },
  },
  /**
   * A short dash travelling the length of a skill connection, from the outer node in
   * toward the `AI ENGINEER` hub — the ecosystem's equivalent of the neural field's data
   * packets. The line is 40 viewBox units long, so the offset sweeps that full distance.
   */
  /** The cursor core's counter-rotating arcs. Transform-only, so it stays on the GPU. */
  "cursor-core-spin": {
    from: { transform: "translate(-50%, -50%) rotate(0deg)" },
    to: { transform: "translate(-50%, -50%) rotate(360deg)" },
  },
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
  /* ---- The signal language (AI motion pass) --------------------------
   *
   * Everything below says one thing in a different place: this page is a running
   * system, not a document. They are all either transform-only or a single registered
   * custom property, so the compositor carries them, and each one is switched off by
   * its component class under `prefers-reduced-motion`.
   */

  /** A charge running the perimeter of a card. Drives the registered `--trace-angle`. */
  "circuit-trace": {
    from: { "--trace-angle": "0deg" },
    to: { "--trace-angle": "360deg" },
  },
  /** The live status node beside every section eyebrow: its core, and its ping ring. */
  "node-core": {
    "0%, 100%": { transform: "scale(0.52)", opacity: "1" },
    "50%": { transform: "scale(0.74)", opacity: "0.7" },
  },
  "node-ping": {
    "0%": { transform: "scale(0.52)", opacity: "0.8" },
    "70%, 100%": { transform: "scale(1.2)", opacity: "0" },
  },
  /**
   * A light passing through the gradient accent words. Only the highlight layer moves —
   * the brand gradient beneath it is held still, so the words keep their colour and are
   * simply lit. It rests off the glyphs for most of the cycle, which is what makes it
   * read as an occasional pass rather than a constant shimmer.
   */
  "gradient-scan": {
    "0%, 10%": { backgroundPosition: "130% 0, 0 0" },
    "55%, 100%": { backgroundPosition: "-30% 0, 0 0" },
  },
  /** A visible colour wave across display text; deliberately slow to avoid visual noise. */
  "display-gradient-flow": {
    "0%, 100%": { backgroundPosition: "100% 50%" },
    "50%": { backgroundPosition: "0% 50%" },
  },
  /** Draws the hero name's signature rail once, using only a compositor transform. */
  "name-signal-draw": {
    from: { transform: "scaleX(0)" },
    to: { transform: "scaleX(1)" },
  },
  /** Brings the terminal point online after the hero name's rail reaches it. */
  "name-node-online": {
    from: { transform: "translateY(-50%) scale(0)", opacity: "0" },
    to: { transform: "translateY(-50%) scale(1)", opacity: "1" },
  },
  /** A packet falling down the Experience rail. The packet is 22% tall, so 455% clears it. */
  "packet-fall": {
    "0%": { transform: "translate3d(0, -100%, 0)", opacity: "0" },
    "12%, 88%": { opacity: "1" },
    "100%": { transform: "translate3d(0, 455%, 0)", opacity: "0" },
  },
  /** The analysis pass over a project image. The line is 18% tall, so 555% clears the frame. */
  "scan-pass": {
    "0%": { transform: "translate3d(0, -120%, 0)" },
    "100%": { transform: "translate3d(0, 555%, 0)" },
  },
  /** A signal travelling the footer's bus line. The light is 22% wide, so 455% clears it. */
  "bus-signal": {
    "0%": { transform: "translate3d(-100%, 0, 0)" },
    "100%": { transform: "translate3d(455%, 0, 0)" },
  },

  "grain-shift": {
    "0%, 100%": { transform: "translate3d(0, 0, 0)" },
    "25%": { transform: "translate3d(-1%, 1%, 0)" },
    "50%": { transform: "translate3d(1%, -1%, 0)" },
    "75%": { transform: "translate3d(1%, 1%, 0)" },
  },
};

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
          dot: v("cursor-dot"),
        },
        accent: {
          copper: v("accent-copper"),
          "copper-text": v("accent-copper-text"),
          gold: v("accent-gold"),
          teal: v("accent-teal"),
          coral: v("accent-coral"),
          green: v("accent-green"),
          /** Compatibility aliases; new work should use the semantic palette names above. */
          violet: v("accent-violet"),
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
        /**
         * About, with the copy first in the DOM: the copy takes the wider first track and the
         * system composition the narrower second one. `about` is kept because other layouts
         * still read portrait-first.
         */
        "about-reversed": "minmax(0, 1.05fr) minmax(0, 0.95fr)",
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
        /**
         * The two sizes below `eyebrow`, for the About system panels and the contact orb
         * captions. Named rather than written inline: `CLAUDE.md` §2 puts type scale in the
         * theme, and Phase 14 recorded "zero Tailwind arbitrary values" as a standard.
         */
        meta: ["0.6875rem", { lineHeight: "1.35" }],
        micro: ["0.625rem", { lineHeight: "1.4" }],
        /** The contextual label inside the expanded cursor ring. */
        cursor: ["0.5rem", { lineHeight: "1", letterSpacing: "0.15em" }],
        /** Skill-ecosystem node labels — small enough to sit inside a circular node. */
        node: ["0.5625rem", { lineHeight: "1.2", letterSpacing: "0.02em" }],
      },
      /** Generous, consistent section rhythm — the whitespace is doing real work here. */
      spacing: {
        /**
         * Vertical breathing room per section, applied as `py-section` — so **adjacent sections
         * stack two of these**, and that total is what a reader actually sees as the gap.
         *
         * Was `clamp(6rem, 12vw, 10rem)`: 160px a side at desktop, so **320px of dead space
         * between every section** — more than a third of a 900px viewport showing nothing, which
         * is exactly what it looked like. Now 108px a side at 1440 (216px combined) and 64px on a
         * phone (128px combined). Still generous; no longer a void.
         *
         * If this is ever raised again, remember to reason about the *doubled* figure.
         */
        section: "clamp(4rem, 7.5vw, 7rem)",
        /** Navbar wordmark. Slightly below the artwork's native 156px to preserve clarity. */
        wordmark: "136px",
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
      keyframes,
      animation: {
        "grain-shift": "grain-shift 12s steps(4, end) infinite",
        "caret-blink": "caret-blink 1.1s steps(1, end) infinite",
        "arrow-nudge": "arrow-nudge 2s ease-in-out infinite",
        /** Deliberately unhurried — a signal passing, not a chase light. */
        "synapse-flow": "synapse-flow 3.2s linear infinite",
        /** Slow enough to read as a system idling, not as a carousel. Keep both in step. */
        "ecosystem-spin": "ecosystem-spin 56s linear infinite",
        "ecosystem-counterspin": "ecosystem-counterspin 56s linear infinite",
        /** Signal bars orbit their circular tracks without animating SVG stroke paint. */
        "ecosystem-track": "ecosystem-spin 14s linear infinite",
        "ecosystem-track-reverse": "ecosystem-counterspin 18s linear infinite",
      },
    },
  },
  plugins: [
    plugin(({ addBase, addComponents }) => {
      addBase({
        /**
         * `--trace-angle` has to be *registered* for `.circuit-trace` to animate: an
         * unregistered custom property has no type, so the browser can only interpolate it
         * discretely — it would jump from 0deg to 360deg at the halfway mark instead of
         * sweeping. Registered as an `<angle>` it interpolates smoothly, and the whole effect
         * stays off the main thread.
         *
         * Where `@property` is unsupported the gradient still resolves (the class declares
         * its own `--trace-angle` fallback) and the card simply gets a static gradient edge on
         * hover. A degradation, not a break.
         */
        // See the note on `keyframes` above: Tailwind will not emit these on its own for
        // the ones only `addComponents` consumes, so they are written out here instead.
        ...Object.fromEntries(
          Object.entries(keyframes).map(([name, frames]) => [`@keyframes ${name}`, frames]),
        ),

        "@property --trace-angle": {
          syntax: '"<angle>"',
          inherits: "false",
          "initial-value": "0deg",
        },
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
         * Hero-name signature. The readable glyphs never disappear or move: a slow gradient
         * travels through them while the decorative rail draws once. The name remains real,
         * server-rendered text, so neither the initial paint nor meaning waits for hydration.
         */
        ".hero-name": {
          position: "relative",
          display: "inline-block",
          paddingBottom: "0.18em",
          isolation: "isolate",
        },
        ".hero-name-copy": {
          position: "relative",
          zIndex: "1",
          display: "inline-block",
          textWrap: "balance",
          backgroundImage: `linear-gradient(110deg, ${v("text-primary")} 0%, ${v(
            "text-primary",
          )} 30%, ${v("accent-copper")} 46%, ${v("accent-teal")} 62%, ${v(
            "text-primary",
          )} 78%, ${v("text-primary")} 100%)`,
          backgroundSize: "240% 100%",
          backgroundPosition: "100% 50%",
          backgroundRepeat: "no-repeat",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          animation: "display-gradient-flow 5.8s ease-in-out infinite",
          filter: `drop-shadow(0 0 18px ${brandAt(18)})`,
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
            backgroundPosition: "45% 50%",
            filter: "none",
          },
        },
        ".hero-name-signal": {
          position: "absolute",
          left: "0.04em",
          right: "0.04em",
          bottom: "0",
          height: "2px",
          transformOrigin: "left center",
          transform: "scaleX(0)",
          backgroundImage: `linear-gradient(to right, ${v("accent-copper")}, ${v(
            "accent-teal",
          )} 72%, transparent)`,
          animation: "name-signal-draw 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards",
          "&::after": {
            content: '\"\"',
            position: "absolute",
            right: "0",
            top: "50%",
            width: "0.14em",
            height: "0.14em",
            minWidth: "0.55rem",
            minHeight: "0.55rem",
            borderRadius: "9999px",
            backgroundColor: v("accent-cyan"),
            boxShadow: v("glow-primary"),
            transform: "translateY(-50%) scale(0)",
            opacity: "0",
            animation:
              "name-node-online 0.35s cubic-bezier(0.22, 1, 0.36, 1) 1.02s forwards",
          },
          "@media (prefers-reduced-motion: reduce)": {
            transform: "scaleX(1)",
            animation: "none",
            "&::after": {
              transform: "translateY(-50%) scale(1)",
              opacity: "1",
              animation: "none",
            },
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
          backgroundImage: `radial-gradient(220px circle at var(--spot-x) var(--spot-y), ${brandAt(18)}, transparent 70%)`,
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
         * `saturate` keeps the blurred copper/teal behind it from going grey and lifeless.
         */
        ".glass-nav": {
          backgroundImage: `linear-gradient(135deg, ${baseAt(88)} 0%, ${baseAt(
            72,
          )} 55%, ${baseAt(82)} 100%)`,
          backdropFilter: "blur(18px) saturate(135%)",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: v("border-subtle"),
          boxShadow: `0 18px 54px -28px ${shade(0.92)}, inset 0 1px 0 ${white(0.06)}`,
          isolation: "isolate",
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
        /**
         * A deeper well than `.ecosystem-scrim`, behind the About system composition.
         *
         * The ecosystem's scrim tops out at 56% of the page colour, which is enough for a ring
         * of labelled nodes. It is not enough here: the site-wide field's bright copper mesh
         * runs straight under these glass modules, and translucent surfaces over a busy
         * background read as dirty rather than as glass. Sinking the field to 88% locally is
         * what gives the panels something clean to sit on.
         */
        ".system-scrim": {
          backgroundImage: `radial-gradient(circle at 50% 50%, ${baseAt(88)} 0%, ${baseAt(
            76,
          )} 42%, ${baseAt(34)} 68%, transparent 86%)`,
        },

        /**
         * The liquid-glass bar holding the visible email and phone.
         *
         * Heavier and wetter than `.glass-surface`: a stronger blur with a saturation lift, a
         * diagonal gradient so the surface has a direction, and a one-pixel inner highlight
         * along the top edge — which is what reads as a meniscus rather than a flat tint. It
         * carries the two values a visitor is most likely to copy, so it is the one element in
         * the group that should feel like a physical object you could pick up.
         *
         * **Only the standard `backdrop-filter` is declared, never a hand-written
         * `-webkit-` twin.** Writing both lets the production minifier dedupe them down to the
         * prefixed one alone, which Chrome honours and Firefox does not — that bug flattened
         * every glass surface on the site once already. See the note above `.glass-surface`.
         */
        ".liquid-bar": {
          position: "relative",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: v("border-subtle"),
          backgroundImage: `linear-gradient(150deg, ${white(0.085)} 0%, ${white(0.025)} 46%, ${white(0.06)} 100%), linear-gradient(${baseAt(
            58,
          )}, ${baseAt(58)})`,
          backdropFilter: "blur(22px) saturate(140%)",
          boxShadow:
            `inset 0 1px 0 ${white(0.14)}, inset 0 -1px 0 ${shade(0.35)}, 0 22px 44px -26px ${shade(0.95)}`,
          transition: "border-color 380ms cubic-bezier(0.22, 1, 0.36, 1)",
        },
        ".liquid-bar:hover, .liquid-bar:focus-within": {
          borderColor: v("border-hover"),
        },
        /** The hairline between the two values. Vertical on a row, horizontal when stacked. */
        ".liquid-bar-divider": {
          backgroundColor: v("border-subtle"),
        },

        /**
         * The convex highlight that turns a skill node from a flat disc into a sphere.
         *
         * Same three-layer construction the contact orbs use — fill, then highlight, then
         * content — so the reflection sits above the body but below the number. A radial
         * highlight lit from the upper left plus an inset floor shadow is what reads as
         * curvature; the previous flat fill read as a coloured circle.
         *
         * Kept as a separate layer rather than folded into the node's inline `boxShadow`,
         * because that value is a function of proficiency and an inline shadow would silently
         * win over a class-based one.
         */
        ".skill-node-sheen": {
          position: "absolute",
          inset: "0",
          borderRadius: "9999px",
          pointerEvents: "none",
          backgroundImage: `radial-gradient(68% 54% at 34% 24%, ${white(0.17)} 0%, transparent 66%)`,
          boxShadow: `inset 0 1px 1px ${white(0.16)}, inset 0 -10px 20px -8px ${shade(0.6)}`,
        },

        /** The ecosystem's sole idle-motion carrier. Every orbit layer and node rides this
         * compositor transform instead of owning another ring animation. */
        ".ecosystem-rotor": {
          backfaceVisibility: "hidden",
          willChange: "transform",
          "@media (prefers-reduced-motion: reduce)": {
            willChange: "auto",
          },
        },
        ".ecosystem-track-runner": {
          transformBox: "view-box",
          transformOrigin: "center",
          willChange: "transform",
          "@media (prefers-reduced-motion: reduce)": {
            willChange: "auto",
          },
        },
        /** Freeze the coupled rotor/counter-rotors together while a person is inspecting it.
         * Besides making moving targets easier to use, this suspends every transform
         * animation in the assembly for the duration of pointer or keyboard interaction. */
        ".ecosystem-stage:hover .ecosystem-rotor, .ecosystem-stage:hover .ecosystem-counterrotor, .ecosystem-stage:hover .ecosystem-track-runner, .ecosystem-stage:hover .ecosystem-hub-bezel, .ecosystem-stage:focus-within .ecosystem-rotor, .ecosystem-stage:focus-within .ecosystem-counterrotor, .ecosystem-stage:focus-within .ecosystem-track-runner, .ecosystem-stage:focus-within .ecosystem-hub-bezel":
          {
            animationPlayState: "paused",
          },

        /**
         * The ecosystem's hub. A *well* rather than a disc: lit slightly from above, floor
         * shadowed, so the axis reads as something the orbit is anchored into. `glass-surface`
         * gave it a flat 4% film that made it the least substantial thing in its own composition.
         */
        ".ecosystem-hub": {
          isolation: "isolate",
          backgroundImage: `radial-gradient(circle at 50% 32%, ${v("bg-surface")} 0%, ${baseAt(
            90,
          )} 58%, ${baseAt(97)} 100%)`,
          boxShadow: `inset 0 1px 0 ${white(0.1)}, inset 0 -14px 28px -14px ${shade(0.85)}, ${v(
            "glow-primary",
          )}`,
        },
        ".ecosystem-hub-bezel": {
          position: "absolute",
          inset: "-0.7rem",
          borderRadius: "9999px",
          padding: "1px",
          pointerEvents: "none",
          backgroundImage: `conic-gradient(from -28deg, ${v("accent-copper")} 0deg 72deg, transparent 72deg 156deg, ${v("accent-teal")} 156deg 232deg, transparent 232deg 318deg, ${v("accent-gold")} 318deg 360deg)`,
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
          opacity: "0.82",
          animation: "ecosystem-spin 22s linear infinite",
          willChange: "transform",
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
            willChange: "auto",
          },
        },

        /**
         * The proficiency gauge around a skill node.
         *
         * **Why this replaced "size and glow carry the number".** Encoding proficiency only as
         * diameter and halo meant the actual figure — the most interesting thing the ecosystem
         * knows — was invisible until you hovered, and four softly-glowing discs read as
         * decoration rather than as instrumentation. This draws the value as an arc, so a 95
         * and an 80 differ *legibly* and not just in brightness.
         *
         * Same masking trick as `.circuit-trace`: paint a conic gradient over the border box and
         * punch out the content box, leaving a 2px ring. `--pct` is a unitless number set inline
         * per node. Nothing animates, so the gradient needs no `@property` registration — this
         * is one static paint per node, no JS and no per-frame work.
         */
        ".skill-ring": {
          position: "absolute",
          inset: "-0.4rem",
          borderRadius: "9999px",
          padding: "2px",
          pointerEvents: "none",
          backgroundImage: `conic-gradient(from -90deg, ${v("accent-teal")} 0%, ${v(
            "accent-copper",
          )} calc(var(--pct) * 1%), transparent calc(var(--pct) * 1%))`,
          /* Alpha-only stencils. `#000` here is a mask, not a design colour. */
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
          opacity: "0.75",
          transition: "opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)",
        },
        /** The unfilled remainder of the gauge, so the arc reads against a track. */
        ".skill-ring-track": {
          position: "absolute",
          inset: "-0.4rem",
          borderRadius: "9999px",
          padding: "2px",
          pointerEvents: "none",
          backgroundImage: `linear-gradient(${v("border-subtle")}, ${v("border-subtle")})`,
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
        },

        /**
         * A contact orb: a glass interface node, not a social button.
         *
         * Three layers on purpose. The anchor owns the size, the perspective and the tilt; the
         * *surface* is the sphere (a gradient lit from the top-left plus an inner highlight, so
         * it reads as convex rather than as a flat disc); the *sheen* is the reflection that
         * only appears on hover. Splitting them lets the reflection sit above the glass and
         * below the glyph, which is the ordering real glass has.
         *
         * The tilt defaults to 0deg here and is overwritten per-orb from `pointermove`, so the
         * resting state is correct with no JS having run at all — and clearing the properties
         * on leave lets this transition ease it home.
         */
        ".contact-orb": {
          "--tilt-x": "0deg",
          "--tilt-y": "0deg",
          position: "relative",
          display: "grid",
          placeItems: "center",
          width: "4.5rem",
          height: "4.5rem",
          borderRadius: "9999px",
          perspective: "520px",
          transformStyle: "preserve-3d",
          transform:
            "perspective(520px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) translateZ(0)",
          transition:
            "transform 380ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 380ms cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "transform",
          "@media (prefers-reduced-motion: reduce)": {
            transform: "none",
            transition: "box-shadow 200ms linear",
          },
        },
        /** Lifts toward the reader. `translateZ` rather than `scale` so the tilt stays true. */
        ".contact-orb:hover, .contact-orb:focus-visible": {
          transform:
            "perspective(520px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) translateZ(14px)",
          "@media (prefers-reduced-motion: reduce)": { transform: "none" },
        },
        ".contact-orb-surface": {
          position: "absolute",
          inset: "0",
          borderRadius: "9999px",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: v("border-subtle"),
          backgroundImage: `radial-gradient(120% 120% at 30% 22%, ${white(0.11)} 0%, ${white(0.035)} 42%, ${white(0.015)} 70%), linear-gradient(${baseAt(
            72,
          )}, ${baseAt(72)})`,
          backdropFilter: "blur(14px)",
          boxShadow:
            `inset 0 1px 1px ${white(0.13)}, 0 16px 30px -18px ${shade(0.95)}`,
          transition:
            "border-color 380ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 380ms cubic-bezier(0.22, 1, 0.36, 1)",
        },
        ".group:hover .contact-orb-surface, .contact-orb:focus-visible .contact-orb-surface": {
          borderColor: v("border-hover"),
          boxShadow: `inset 0 1px 1px ${white(0.2)}, 0 20px 34px -18px ${shade(0.95)}, ${v(
            "glow-primary",
          )}`,
        },
        /**
         * The reflection. A soft crescent across the upper-left of the sphere, faded in on
         * hover — restrained on purpose: a full specular highlight on four orbs at once is the
         * "excessive sci-fi" the brief rules out.
         */
        ".contact-orb-sheen": {
          position: "absolute",
          inset: "0",
          borderRadius: "9999px",
          pointerEvents: "none",
          opacity: "0",
          backgroundImage:
            `radial-gradient(60% 45% at 32% 24%, ${white(0.22)} 0%, transparent 70%)`,
          transition: "opacity 380ms cubic-bezier(0.22, 1, 0.36, 1)",
        },
        ".group:hover .contact-orb-sheen, .contact-orb:focus-visible .contact-orb-sheen": {
          opacity: "1",
        },

        /**
         * The About composition's 3D stage.
         *
         * Perspective lives on this wrapper and `preserve-3d` on the layer inside it, which is
         * what makes the depth *real* rather than simulated: each module carries a static
         * `translateZ`, and the single rotation written to the inner layer on pointer move
         * therefore parallaxes them by different amounts for free. One animated transform for
         * the whole composition — no per-module JS, no rAF loop, nothing for React to re-render.
         */
        ".system-stage": {
          perspective: "1400px",
          perspectiveOrigin: "50% 45%",
        },
        ".system-space": {
          transformStyle: "preserve-3d",
          // The pointer writes these; the defaults are the resting state, so the composition is
          // correct before any pointer has ever moved and on touch devices that have none.
          "--sx": "0",
          "--sy": "0",
          transform:
            "rotateX(calc(var(--sy) * -5deg)) rotateY(calc(var(--sx) * 5.5deg))",
          transition: "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "transform",
        },
        /**
         * A floating information panel.
         *
         * Glass, but a *quieter* glass than `.glass-surface`: these sit in front of the
         * portrait, so the same 4% white fill that reads as a card on the page reads as a smear
         * over a photograph. The gradient gives the surface a direction — lit from the top-left,
         * like every other panel in the composition — which is most of what separates "premium
         * glass" from "translucent rectangle".
         */
        ".system-module": {
          position: "relative",
          borderRadius: "0.9rem",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: v("border-subtle"),
          backgroundImage: `linear-gradient(140deg, ${white(0.07)} 0%, ${white(0.025)} 42%, ${white(0.045)} 100%), linear-gradient(${baseAt(
            88,
          )}, ${baseAt(88)})`,
          backdropFilter: "blur(14px)",
          boxShadow: `0 18px 40px -24px ${shade(0.9)}`,
          transition:
            "border-color 320ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 320ms cubic-bezier(0.22, 1, 0.36, 1), transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
          overflow: "hidden",
        },
        ".system-module:hover, .system-module:focus-within": {
          borderColor: v("border-hover"),
          boxShadow: `0 18px 40px -24px rgba(0,0,0,0.9), ${v("glow-primary")}`,
        },
        /**
         * The sheen that crosses a module on hover. Authored `paused` and started by the
         * parent, so a resting composition animates nothing at all — the same discipline
         * `.circuit-trace` uses.
         */
        ".system-sheen": {
          position: "absolute",
          top: "0",
          bottom: "0",
          width: "45%",
          pointerEvents: "none",
          opacity: "0",
          backgroundImage:
            `linear-gradient(100deg, transparent 0%, ${white(0.09)} 50%, transparent 100%)`,
          transition: "opacity 260ms ease-out",
          animation: "module-sheen 1.1s ease-out",
          animationPlayState: "paused",
          "@media (prefers-reduced-motion: reduce)": { animation: "none" },
        },
        ".system-module:hover .system-sheen, .system-module:focus-within .system-sheen": {
          opacity: "1",
          animationPlayState: "running",
        },
        /**
         * Idle drift. Each module sets its own `--float-delay` so they never move in lockstep,
         * which is the difference between "a system idling" and "a carousel".
         */
        ".system-float": {
          animation: "module-float 7s ease-in-out infinite",
          animationDelay: "var(--float-delay, 0s)",
          "@media (prefers-reduced-motion: reduce)": { animation: "none" },
        },

        /**
         * Sinks the About portrait's own studio backdrop into the page.
         *
         * The source photograph has a *light grey* backdrop. Cropped to a circle and dropped on
         * a near-black page it reads as a flat grey disc stuck onto the layout — the same
         * "pasted on rather than lit by the scene" problem `scripts/cutout.py` grades away for
         * the hero, except here the raw photo is used deliberately (the circle wants a filled
         * frame, not a floating cut-out).
         *
         * The fix is a vignette, not a filter: the face stays completely untouched — the
         * gradient is transparent across the middle 40% — and only the backdrop around it is
         * carried down to the page colour. Off-centre vertically because the subject is not
         * centred in a 4:5 crop.
         */
        ".portrait-well": {
          backgroundImage: `radial-gradient(circle at 50% 38%, transparent 20%, ${baseAt(
            46,
          )} 46%, ${baseAt(86)} 74%, ${baseAt(97)} 100%)`,
        },

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
        /**
         * The hero portrait's cursor-following AI reveal.
         *
         * The window is a `radial-gradient` mask driven by four custom properties that
         * `HeroPortraitReveal` writes from a rAF loop — `--rx`/`--ry` for the cursor, `--rr`
         * for the radius, `--ro` for how far open it is. Masking rather than clipping is what
         * gives the soft edge: the gradient's middle stop feathers the boundary over ~40% of
         * the radius, so the two versions of the subject dissolve into each other instead of
         * meeting on a hard circle.
         *
         * **`--rr` is a length, never a percentage.** An explicit radius on a `circle` gradient
         * must be a `<length>`; percentages are only valid for `ellipse`. Writing a percentage
         * makes the whole `mask-image` declaration invalid, and an invalid mask does not fail
         * closed — it fails *open*, so the entire layer paints unmasked. The component computes
         * the radius in px from the measured box for exactly this reason.
         *
         * `--rr: 0px` at rest collapses the window to nothing, so the layer is invisible until
         * the pointer arrives without needing a separate opacity switch.
         */
        /**
         * Lets the hero portrait run out to the right edge of the screen.
         *
         * It sits inside `Container` (`max-w-6xl`, `sm:px-8`), so at rest it stops at the
         * content gutter with ~175px of page margin to its right — which made the shoulder
         * look cropped, ending in mid-air rather than continuing off-screen.
         *
         * The negative margin cancels exactly two things: the container's own right padding,
         * and half of whatever the viewport has over `max-w-6xl` (the centring margin).
         * `max()` clamps the second term to zero below 72rem, where the container is already
         * full-width and only the padding needs cancelling. The hero section is
         * `overflow-hidden`, so this can never produce a horizontal scrollbar.
         *
         * Values are tied to `Container`'s: change them together.
         */
        /**
         * The cursor layer's legibility, now that it no longer uses `mix-blend-mode`.
         *
         * Drop-shadows rather than an extra ring or outline: they follow the ring's and the
         * dot's own shapes, so one declaration keeps both readable over the dark page and over
         * a bright image without changing the cursor's colour in either place.
         */
        /**
         * The AI processing core that rides the cursor.
         *
         * A DOM copy of what the neural field used to draw on its canvas. It had to move: the
         * field is the page background at `-z-20`, so the core disappeared behind every card
         * and image, which is precisely where a pointer spends its time. Here it sits on the
         * cursor layer and is visible over anything.
         *
         * Built from borders rather than a canvas or an SVG: a circle whose border is
         * transparent on all but one or two sides *is* an arc, and rotating it costs the
         * compositor nothing. Two arcs counter-rotate, which is what reads as "processing"
         * rather than "a spinner".
         */
        /**
         * Body copy that sits directly over the neural field.
         *
         * The field is deliberately dense and bright, so its lines and nodes run straight
         * through long-form text — Abdul reported the Experience descriptions as "not visible",
         * and they were rendering perfectly: `opacity: 1`, correct colour, real dimensions. The
         * problem was the mesh crossing the glyphs.
         *
         * A halo in the page's own background colour separates the text from whatever is behind
         * it, rather than dimming the field or covering it with a scrim. That matters: the last
         * scrim added for a similar reason hid the field's cursor interaction, which was worse
         * than the problem. This costs the background nothing.
         */
        ".text-on-field": {
          textShadow: `0 0 4px ${v("bg-base")}, 0 0 10px ${v("bg-base")}, 0 0 18px ${v("bg-base")}`,
        },

        /* ---- The signal language (AI motion pass) --------------------------
         *
         * These classes extend the neural field's vocabulary — nodes, synapses, travelling
         * packets — into the content layer, so the sections read as parts of one running
         * system rather than as a document laid over an animated backdrop. All of it is CSS:
         * no per-frame JS, nothing for React to re-render, and every class carries its own
         * `prefers-reduced-motion` off-switch.
         */

        /**
         * A charge running the perimeter of an interactive card, on hover and on focus.
         *
         * Two things make this cheap enough to put on every card. It is **idle until pointed
         * at** — the animation is authored `paused` and the parent's `:hover`/`:focus-within`
         * sets it `running`, so an untouched grid of cards costs nothing at all. And the only
         * moving value is a registered custom property, so the browser interpolates an angle
         * rather than anything re-running layout.
         *
         * The ring is the standard two-layer mask: paint the border box, punch out the
         * content box, and the 1px padding between them is what remains visible. **`mask` is
         * a shorthand and resets `mask-composite`, so those two must stay in this order.**
         */
        ".circuit-card": {
          position: "relative",
        },
        ".circuit-trace": {
          position: "absolute",
          inset: "0",
          borderRadius: "inherit",
          padding: "1px",
          pointerEvents: "none",
          opacity: "0",
          transition: "opacity 320ms ease-out",
          /* Fallback for browsers without `@property`; see the registration in `addBase`. */
          "--trace-angle": "0deg",
          backgroundImage: `conic-gradient(from var(--trace-angle), transparent 0deg, ${v(
            "accent-cyan",
          )} 24deg, ${v("accent-violet")} 50deg, transparent 92deg, transparent 180deg, ${v(
            "accent-cyan",
          )} 204deg, ${v("accent-violet")} 230deg, transparent 272deg)`,
          /* Alpha-only stencils. `#000` here is a mask, not a design colour. */
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
          animation: "circuit-trace 4.5s linear infinite",
          animationPlayState: "paused",
          "@media (prefers-reduced-motion: reduce)": {
            // The edge still lights on hover — it just stops travelling.
            animation: "none",
          },
        },
        ".circuit-card:hover .circuit-trace, .circuit-card:focus-visible .circuit-trace, .circuit-card:focus-within .circuit-trace":
          {
            opacity: "1",
            animationPlayState: "running",
          },

        /**
         * Shared section-heading frame. A fine vertical rail and fading horizontal signal give
         * the heading a recognizable silhouette without placing it inside another card. All
         * decoration is static, token-derived and rendered by CSS on the Server Component.
         */
        ".section-heading": {
          position: "relative",
          width: "100%",
          paddingLeft: "clamp(1rem, 2vw, 1.5rem)",
          "&::before": {
            content: '\"\"',
            position: "absolute",
            left: "0",
            top: "0",
            bottom: "0",
            width: "1px",
            backgroundImage: `linear-gradient(to bottom, ${v("accent-teal")}, ${brandAt(
              52,
            )} 58%, transparent)`,
          },
          "&::after": {
            content: '\"\"',
            position: "absolute",
            left: "0",
            top: "0",
            width: "0.75rem",
            height: "1px",
            backgroundColor: v("accent-cyan"),
          },
        },
        ".section-heading-kicker": {
          position: "relative",
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: "0.625rem",
          minHeight: "0.75rem",
        },
        ".section-heading-rule": {
          flex: "1 1 auto",
          maxWidth: "9rem",
          height: "1px",
          marginLeft: "0.25rem",
          backgroundImage: `linear-gradient(to right, ${brandAt(55)}, transparent)`,
        },
        ".section-heading-title": {
          position: "relative",
          textWrap: "balance",
        },
        ".section-heading .section-heading-accent": {
          backgroundImage: `linear-gradient(100deg, ${v("accent-copper")} 0%, ${v(
            "accent-teal",
          )} 42%, ${v("text-primary")} 52%, ${v("accent-copper")} 64%, ${v(
            "accent-teal",
          )} 100%)`,
          backgroundSize: "220% 100%",
          backgroundPosition: "100% 50%",
          animation: "display-gradient-flow 5.2s ease-in-out infinite",
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
            backgroundPosition: "45% 50%",
          },
        },
        ".section-heading-description": {
          position: "relative",
          maxWidth: "42rem",
        },

        /**
         * The live status node beside every section eyebrow — the page's smallest recurring
         * "the system is on" signal, in the same node-and-ping language the ecosystem and the
         * field already speak. Built from two pseudo-elements rather than two spans, so
         * `SectionHeading` stays a server component and gains no extra markup.
         */
        ".status-node": {
          position: "relative",
          display: "inline-block",
          flex: "none",
          width: "0.5rem",
          height: "0.5rem",
          "&::before, &::after": {
            content: '""',
            position: "absolute",
            inset: "0",
            borderRadius: "9999px",
          },
          "&::before": {
            backgroundColor: v("accent-cyan"),
            animation: "node-core 2.6s ease-in-out infinite",
          },
          "&::after": {
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: v("accent-cyan"),
            animation: "node-ping 2.6s ease-out infinite",
          },
          "@media (prefers-reduced-motion: reduce)": {
            // Still a lit node inside a ring — just a still one. These are the animations'
            // own resting frames, so nothing jumps when the motion is switched off.
            "&::before": { animation: "none", transform: "scale(0.52)" },
            "&::after": { animation: "none", opacity: "0.3" },
          },
        },

        /**
         * The gradient accent words, with a light passing through them. Two stacked
         * backgrounds, both clipped to the glyphs: the highlight on top, the brand gradient
         * beneath. Under reduced motion the highlight parks off the glyphs, so the words
         * render as plain `.text-gradient-primary` and nothing is lost.
         */
        ".text-gradient-scan": {
          backgroundImage: `linear-gradient(100deg, transparent 44%, color-mix(in srgb, ${v(
            "text-primary",
          )} 70%, transparent) 50%, transparent 56%), ${v("gradient-primary")}`,
          backgroundSize: "300% 100%, 100% 100%",
          backgroundPosition: "130% 0, 0 0",
          backgroundRepeat: "no-repeat",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          animation: "gradient-scan 7s cubic-bezier(0.22, 1, 0.36, 1) infinite",
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
          },
        },

        /**
         * Data packets falling down the Experience rail — the field's synapse traffic, on the
         * one line in the content layer that is literally a connection. It sits inside a
         * clipped copy of `.timeline-rail`, so it can never run past the rail's ends.
         * `packet-fall`'s 455% is the rail's length expressed in packet heights: **change the
         * height here and that number changes with it.**
         */
        ".timeline-packet": {
          position: "absolute",
          left: "0",
          right: "0",
          top: "0",
          height: "22%",
          backgroundImage: `linear-gradient(to bottom, transparent, ${v("accent-cyan")}, transparent)`,
          animation: "packet-fall 5.4s linear infinite",
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
            opacity: "0",
          },
        },

        /**
         * An analysis pass over a project image, on hover and on keyboard focus. Paused until
         * the card is pointed at, exactly like `.circuit-trace`, so a full grid sits idle.
         * `scan-pass`'s 555% is the frame expressed in scan-line heights (18%).
         */
        ".scan-line": {
          position: "absolute",
          left: "0",
          right: "0",
          top: "0",
          height: "18%",
          pointerEvents: "none",
          opacity: "0",
          transition: "opacity 260ms ease-out",
          backgroundImage: `linear-gradient(to bottom, transparent, color-mix(in srgb, ${v(
            "accent-cyan",
          )} 45%, transparent) 46%, color-mix(in srgb, ${v(
            "text-primary",
          )} 70%, transparent) 50%, color-mix(in srgb, ${v(
            "accent-cyan",
          )} 45%, transparent) 54%, transparent)`,
          animation: "scan-pass 2.8s ease-in-out infinite",
          animationPlayState: "paused",
          "@media (prefers-reduced-motion: reduce)": {
            // A scan line with no travel is just a bright band sitting on the image, so it goes.
            display: "none",
          },
        },
        ".group:hover .scan-line, .group:focus-within .scan-line": {
          opacity: "1",
          animationPlayState: "running",
        },

        /**
         * A signal travelling the footer's top edge — the last thing the page does, and a
         * quiet restatement that the system is still running once the content has ended.
         * `bus-signal`'s 455% is the full width in light-widths (22%).
         */
        /**
         * The footer's closing panel uses an opaque-enough token-derived surface instead of a
         * second large backdrop-filter region. It therefore stays crisp over the live field
         * without adding another expensive full-width blur.
         */
        ".footer-panel": {
          position: "relative",
          isolation: "isolate",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: v("border-subtle"),
          backgroundImage: `radial-gradient(circle at 8% 12%, ${brandAt(
            13,
          )}, transparent 34%), radial-gradient(circle at 92% 88%, color-mix(in srgb, ${v(
            "accent-cyan",
          )} 7%, transparent), transparent 30%), linear-gradient(145deg, ${baseAt(
            96,
          )}, ${baseAt(88)})`,
          boxShadow: `0 28px 80px -42px ${shade(0.92)}, inset 0 1px 0 ${white(0.045)}`,
        },

        ".signal-bus": {
          position: "absolute",
          top: "-1px",
          left: "0",
          right: "0",
          height: "1px",
          overflow: "hidden",
          pointerEvents: "none",
          backgroundImage: `linear-gradient(90deg, transparent, ${brandAt(
            36,
          )} 28%, color-mix(in srgb, ${v(
            "accent-cyan",
          )} 48%, transparent) 50%, ${brandAt(36)} 72%, transparent)`,
          "&::after": {
            content: '""',
            position: "absolute",
            top: "0",
            left: "0",
            height: "100%",
            width: "22%",
            backgroundImage: `linear-gradient(90deg, transparent, ${v("accent-cyan")}, transparent)`,
            animation: "bus-signal 7.5s ease-in-out infinite",
            animationPlayState: "paused",
            opacity: "0",
            transition: "opacity 240ms ease-out",
          },
          "@media (prefers-reduced-motion: reduce)": {
            "&::after": { animation: "none", opacity: "0" },
          },
        },
        ".group:hover .signal-bus::after, .group:focus-within .signal-bus::after": {
          opacity: "1",
          animationPlayState: "running",
          "@media (prefers-reduced-motion: reduce)": {
            opacity: "0",
            animationPlayState: "paused",
          },
        },

        ".cursor-core": {
          position: "absolute",
          left: "0",
          top: "0",
          width: "3.75rem",
          height: "3.75rem",
        },
        ".cursor-core-halo, .cursor-core-ring, .cursor-core-arc, .cursor-core-arc-inner": {
          position: "absolute",
          left: "50%",
          top: "50%",
          borderRadius: "9999px",
          transform: "translate(-50%, -50%)",
        },
        /** The soft bloom. Matches the glow the field still paints at the same point. */
        ".cursor-core-halo": {
          width: "100%",
          height: "100%",
          backgroundImage: `radial-gradient(circle, color-mix(in srgb, ${v("accent-cyan")} 22%, transparent) 0%, transparent 68%)`,
        },
        ".cursor-core-ring": {
          width: "3.75rem",
          height: "3.75rem",
          border: "1px solid color-mix(in srgb, var(--accent-cyan) 34%, transparent)",
        },
        /** Outer arc: two opposite segments, clockwise. */
        ".cursor-core-arc": {
          width: "2.75rem",
          height: "2.75rem",
          border: "1.5px solid transparent",
          borderTopColor: "color-mix(in srgb, var(--accent-cyan) 80%, transparent)",
          borderBottomColor: "color-mix(in srgb, var(--accent-cyan) 80%, transparent)",
          animation: "cursor-core-spin 3s linear infinite",
        },
        /** Inner arc: a single segment, counter-clockwise, violet. */
        ".cursor-core-arc-inner": {
          width: "1.9rem",
          height: "1.9rem",
          border: "1.5px solid transparent",
          borderLeftColor: "color-mix(in srgb, var(--accent-violet) 70%, transparent)",
          animation: "cursor-core-spin 2.2s linear infinite reverse",
        },

        ".cursor-layer": {
          filter: "drop-shadow(0 0 2px rgba(0,0,0,0.85)) drop-shadow(0 0 6px rgba(0,0,0,0.55))",
        },

        ".bleed-right": {
          marginRight: "calc(-1 * (max(0px, (100vw - 72rem) / 2) + 2rem))",
        },

        ".portrait-reveal": {
          "--rx": "50%",
          "--ry": "50%",
          "--rr": "0px",
          "--ro": "0",
          position: "absolute",
          inset: "0",
          // **The silhouette clip, applied once to the whole subtree.**
          //
          // The robotic image is alpha-limited to the subject, but the rim and scanline layers
          // are plain boxes — nothing stopped them painting into the empty space beside the
          // shoulder, which showed up as cyan crescents floating outside the portrait whenever
          // the cursor neared an edge. Masking the container clips every child at once, so
          // containment holds for anything added here later too.
          //
          // `contain` / `right bottom` mirror the `object-contain object-right-bottom` the images
          // inside are laid out with, so the mask lands exactly on the rendered subject.
          // **These must change together**: the cut-out is letterboxed inside its box by
          // `contain`, and any disagreement in object-position slides the clip off the subject
          // by exactly that gap.
          // A dedicated alpha-only stencil, not the full-colour cut-out. A CSS mask samples only
          // the alpha channel, so pointing this at the cut-out made the browser download a ~1 MB
          // PNG *raw* — outside `next/image` — purely to use as a shape. Lighthouse measured it
          // as 980 KiB of wasted payload and the page's largest single download. Same matte,
          // same crop, black RGB, half resolution: 9 KB. Regenerate both with
          // `python scripts/cutout.py`.
          maskImage: "url('/portrait-reveal-mask.png')",
          WebkitMaskImage: "url('/portrait-reveal-mask.png')",
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskPosition: "right bottom",
          WebkitMaskPosition: "right bottom",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        },
        ".portrait-reveal-layer, .portrait-reveal-scan": {
          position: "absolute",
          inset: "0",
          pointerEvents: "none",
          maskImage:
            "radial-gradient(circle var(--rr) at var(--rx) var(--ry), black 0%, black 42%, rgba(0,0,0,0.75) 62%, rgba(0,0,0,0.35) 80%, rgba(0,0,0,0.1) 92%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(circle var(--rr) at var(--rx) var(--ry), black 0%, black 42%, rgba(0,0,0,0.75) 62%, rgba(0,0,0,0.35) 80%, rgba(0,0,0,0.1) 92%, transparent 100%)",
        },
        /** Faint horizontal sampling lines over the revealed area — a readout, not a CRT. */
        ".portrait-reveal-scan": {
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.055) 0px, rgba(255,255,255,0.055) 1px, transparent 1px, transparent 4px)",
          opacity: "calc(var(--ro) * 0.45)",
          mixBlendMode: "screen",
        },

        ".hero-portrait": {
          // The source is a real cut-out (see `identity.portraitCutout`), so no blend mode is
          // needed — an earlier `mix-blend-mode: screen` version lifted the image's near-black
          // rectangle above the page background and left a visible box. This only feathers the
          // bottom crop so the subject dissolves into the section instead of ending on a line.
          //
          // Was 76% when the asset was a near-full-length portrait with a lot of torso to
          // spare. The 2026-08-27 head-and-chest crop is far tighter, and at 76% the fade
          // started around the tie knot and ate most of the chest. 88% keeps the soft edge
          // while leaving the framing that crop was chosen for.
          maskImage: "linear-gradient(to bottom, black 88%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 88%, transparent 100%)",
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

        /**
         * A contact-form field row: the bordered line an `<input>`/`<textarea>` sits inside.
         *
         * The control itself stays a plain, unstyled, fully native element (transparent
         * background, no outline of its own) and *this* is what renders as the field. That
         * split is what makes the terminal skin a skin — `CLAUDE.md` §4 — rather than a
         * lookalike built out of divs.
         *
         * Focus lives here rather than on the input because the row is what the user sees as
         * the field. `:focus-within` fires for keyboard and pointer alike, so the focus state
         * cannot be lost by tabbing instead of clicking, and it is a border + glow (not an
         * `outline: none` with nothing put back).
         */
        ".terminal-field": {
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: v("border-subtle"),
          backgroundColor: v("bg-glass"),
          transition: "border-color 300ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 300ms cubic-bezier(0.22, 1, 0.36, 1)",
        },
        ".terminal-field:focus-within": {
          borderColor: v("border-hover"),
          boxShadow: v("glow-primary"),
        },
        /**
         * Invalid state. Colour is never the only signal — the row also gets a written error
         * message wired up with `aria-describedby`, and the control carries `aria-invalid`, so
         * the state survives both colour-blindness and a screen reader.
         */
        ".terminal-field[data-invalid='true']": {
          borderColor: v("accent-pink"),
        },
        ".terminal-field[data-invalid='true']:focus-within": {
          borderColor: v("accent-pink"),
          boxShadow: `0 0 24px color-mix(in srgb, ${v("accent-pink")} 22%, transparent)`,
        },
      });
    }),
  ],
};

export default config;
