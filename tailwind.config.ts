import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF6F0",
        sand: "#F1E9DD",
        walnut: {
          50: "#F6EFE7",
          100: "#E9D9C4",
          200: "#D2B491",
          300: "#B98F65",
          400: "#8F6339",
          500: "#6B4423",
          600: "#553419",
          700: "#3F2612",
          800: "#2B1A0C",
          900: "#1A0F07",
        },
        terracotta: {
          50: "#FBEEE8",
          100: "#F3D2C1",
          200: "#E6AC8C",
          300: "#D8815A",
          400: "#C1663F",
          500: "#A85332",
          600: "#864128",
        },
        ink: "#2B2420",
      },
      fontFamily: {
        serif: [
          "Georgia",
          "Cambria",
          "'Times New Roman'",
          "Times",
          "serif",
        ],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(43, 26, 12, 0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
