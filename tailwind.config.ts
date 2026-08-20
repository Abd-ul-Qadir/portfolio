import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

/**
 * Single source of truth for the design tokens in `docs/DESIGN_SYSTEM.md`.
 * Raw values live here and nowhere else — the `cssVariables` plugin at the
 * bottom emits them onto `:root` so non-Tailwind consumers (canvas, GSAP,
 * inline SVG) can read the exact same values via `var(--token)`.
 */
const tokens = {
  "bg-base": "#08090D",
  "bg-surface": "#0E1016",
  "bg-glass": "rgba(255,255,255,0.04)",
  "border-subtle": "rgba(255,255,255,0.08)",
  "border-hover": "rgba(124,58,237,0.4)",
  "text-primary": "#F5F6FA",
  "text-secondary": "#9CA3AF",
  "accent-violet": "#7C3AED",
  "accent-indigo": "#6366F1",
  "accent-cyan": "#22D3EE",
  "accent-pink": "#EC4899",
  "accent-emerald": "#34D399",
} as const;

const v = (name: keyof typeof tokens) => `var(--${name})`;

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
        accent: {
          violet: v("accent-violet"),
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
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        ":root": Object.fromEntries(
          Object.entries(tokens).map(([key, value]) => [`--${key}`, value]),
        ),
      });
    }),
  ],
};

export default config;
