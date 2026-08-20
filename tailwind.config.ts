import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme-aware (see globals.css for the light/dark variable
        // values) — page background, secondary background, and card
        // surface. Everything else (walnut/terracotta/danger, and
        // "ink" below) is a brand/semantic color and stays constant
        // across themes by design: a badge or button shouldn't change
        // color just because the page switched themes.
        cream: "rgb(var(--color-cream) / <alpha-value>)",
        sand: "rgb(var(--color-sand) / <alpha-value>)",
        white: "rgb(var(--color-surface) / <alpha-value>)",
        // Golden Wood brand style guide v1.0 — Ebony Oak primary dark.
        // Token kept as "walnut" for compatibility with existing
        // component classes; 500/600/700 are the guide's exact Ebony
        // Oak (#1B1610), the 50-400 light neutrals are unspecified by
        // the guide and left as warm off-white/gray support tints.
        walnut: {
          50: "#F5F4F2",
          100: "#E7E4DF",
          200: "#CDC8C0",
          300: "#A29A8E",
          400: "#6E655A",
          500: "#1B1610",
          600: "#120D09",
          700: "#0A0705",
          800: "#060403",
          900: "#030201",
        },
        // Gold foil gradient — Foil Gold -> Antique Gold -> Deep
        // Bronze, the guide's exact three primary/support gold stops
        // (200/400/600 below), never used flat per the guide.
        terracotta: {
          50: "#FBF6E9",
          100: "#F3E4B8",
          200: "#E8C468",
          300: "#D9B664",
          400: "#C9A15C",
          500: "#9E7D48",
          600: "#7A5C2E",
        },
        // True error/warning red — kept separate from the gold accent
        // scale above so low-stock/validation messaging still reads as
        // a warning rather than brand gold.
        danger: {
          50: "#FBEEE8",
          400: "#C1663F",
          500: "#A85332",
        },
        // Theme-aware body text — flips light/dark with the page
        // background above. Never used as a background for anything
        // meant to stay a fixed dark chip (badges/overlays use the
        // constant walnut-700 instead — see components using bg-ink
        // historically, now bg-walnut-700).
        ink: "rgb(var(--color-ink) / <alpha-value>)",
      },
      fontFamily: {
        // Display — wordmark, headlines, price tags (always uppercase,
        // tight tracking per the brand guide). Reuses the existing
        // "font-serif" utility class already applied to every headline
        // across the app, so the whole site picks this up without
        // touching each call site.
        serif: ["var(--font-display)", "Impact", "sans-serif"],
        // Body — descriptions, labels, UI.
        sans: ["var(--font-body)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        // Accent — pull quotes, taglines, the "Furniture" wordmark
        // subline. Italic only.
        accent: ["var(--font-accent)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(27, 22, 16, 0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
        // Sharper, more formal corners than the template default —
        // heirloom/quiet-confidence per the brand guide, not the soft
        // rounded look other branches on this template use.
        lg: "0.375rem",
        xl: "0.5rem",
        "2xl": "0.625rem",
      },
    },
  },
  plugins: [],
};
export default config;
