import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ec4899",
        secondary: "#8b5cf6",
        accent: "#f59e0b",
        dark: "#0f172a"
      },
      backgroundImage: {
        hero: "radial-gradient(circle at top, rgba(236,72,153,0.25), transparent 35%), radial-gradient(circle at bottom right, rgba(139,92,246,0.18), transparent 25%)"
      },
      boxShadow: {
        glow: "0 20px 80px rgba(236,72,153,0.22)"
      }
    }
  },
  plugins: []
};

export default config;
