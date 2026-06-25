import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#dbe4ff",
          200: "#bac8ff",
          300: "#91a7ff",
          400: "#748ffc",
          500: "#5c7cfa",
          600: "#4c6ef5",
          700: "#4263eb",
          800: "#3b5bdb",
          900: "#364fc7",
          950: "#2541b2",
        },
        surface: {
          900: "#0a0e1a",
          800: "#0f1629",
          700: "#151d35",
          600: "#1c2642",
          500: "#243050",
        },
        accent: {
          cyan: "#06b6d4",
          purple: "#8b5cf6",
          amber: "#f59e0b",
          green: "#10b981",
          red: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["Inter var", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-brand":
          "linear-gradient(135deg, #4c6ef5 0%, #06b6d4 100%)",
        "gradient-dark":
          "linear-gradient(180deg, #0a0e1a 0%, #0f1629 100%)",
        "card-glow":
          "radial-gradient(circle at top left, rgba(76,110,245,0.15), transparent 60%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(76, 110, 245, 0.3)",
        "glow-cyan": "0 0 20px rgba(6, 182, 212, 0.3)",
        card: "0 4px 24px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
