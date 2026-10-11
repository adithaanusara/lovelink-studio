import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem"
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px"
      }
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"]
      },
      colors: {
        primary: "#ec4899",
        secondary: "#8b5cf6",
        accent: "#f59e0b",
        dark: "#0f172a"
      },
      backgroundImage: {
        hero: "radial-gradient(circle at top, rgba(236,72,153,0.25), transparent 35%), radial-gradient(circle at bottom right, rgba(139,92,246,0.18), transparent 25%)",
        brand: "linear-gradient(90deg, #ec4899 0%, #d946ef 50%, #7c3aed 100%)"
      },
      boxShadow: {
        glow: "0 20px 80px rgba(236,72,153,0.22)",
        soft: "0 10px 40px rgba(15,23,42,0.07)",
        brand: "0 14px 40px rgba(217,70,239,0.28)"
      }
    }
  },
  plugins: []
};

export default config;
