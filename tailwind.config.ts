import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        horebe: {
          black: "#050505",
          green: "#122620",
          gold: "#b68d40",
          coffee: "#2B1D12",
          cream: "#F7EFE2",
          soft: "#F8F5EF",
          gray: "#A8A8A8"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-display)", "Playfair Display", "serif"]
      },
      boxShadow: {
        glow: "0 0 48px rgba(182, 141, 64, 0.22)",
        card: "0 24px 80px rgba(0, 0, 0, 0.36)"
      },
      backgroundImage: {
        "horebe-radial":
          "radial-gradient(circle at 50% 0%, rgba(182, 141, 64, 0.18), transparent 34%), radial-gradient(circle at 15% 18%, rgba(18, 38, 32, 0.95), transparent 42%), linear-gradient(180deg, #050505 0%, #0A0D0B 42%, #050505 100%)"
      }
    }
  },
  plugins: []
};

export default config;
