import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sunny yellow — brand pop (from Hasobaby packaging)
        sun: {
          100: "#FFF4CC",
          200: "#FFEBA3",
          300: "#FFDE70",
          400: "#FFD23F",
          500: "#FBC02D",
          600: "#E8A800",
        },
        // Dr.Maya green — natural & safe
        leaf: {
          100: "#E3F3E5",
          200: "#C3E6C8",
          300: "#9FD8A8",
          500: "#3DA35D",
          600: "#2F8A4A",
          700: "#236B39",
        },
        // Mint / cyan — the "cooling" feeling (core emotion of a fever spray)
        mint: {
          50: "#ECFBFA",
          100: "#D2F4F2",
          200: "#A9EAE7",
          300: "#7FDDD9",
          400: "#3FCFC9",
          500: "#22B8B2",
          600: "#179B96",
          700: "#0E7470",
        },
        // Warm coral — CTA + "hot/fever" pain accent
        coral: {
          100: "#FFE3D6",
          200: "#FFC9B0",
          400: "#FF8A5B",
          500: "#FF6B35",
          600: "#ED5424",
        },
        cream: "#FFFCF3",
        ink: {
          DEFAULT: "#143B39",
          soft: "#4F6F6C",
          line: "#E6E9DF",
        },
      },
      fontFamily: {
        display: ["var(--font-baloo)", "system-ui", "sans-serif"],
        sans: ["var(--font-be-vietnam)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 34px -12px rgba(20, 59, 57, 0.18)",
        card: "0 6px 24px -10px rgba(20, 59, 57, 0.14)",
        glow: "0 0 50px -8px rgba(63, 207, 201, 0.45)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
