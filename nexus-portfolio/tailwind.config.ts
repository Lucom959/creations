import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          DEFAULT: "#D4A574",
          light: "#E4C199",
          dark: "#B8895A",
        },
        terracota: {
          DEFAULT: "#B85C3C",
          light: "#CF7355",
          dark: "#9A4A2F",
        },
        cream: {
          DEFAULT: "#F5F1E8",
          dark: "#EAE3D4",
        },
        lavanda: {
          DEFAULT: "#A89BD2",
          light: "#BFB4E0",
          dark: "#8A7BBE",
        },
        ink: {
          DEFAULT: "#2B2620",
          soft: "#4A4238",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1200px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "progress-grow": {
          "0%": { width: "0%" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "fade-in": "fade-in 0.5s ease-out both",
        "progress-grow": "progress-grow 1s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
