import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Valorant-inspired palette
        valo: {
          bg: "#0a0e14",
          surface: "#0f1923",
          panel: "#131b24",
          border: "#1e2d3d",
          accent: "#00d4ff",
          "accent-dim": "#00a8cc",
          red: "#ff4655",
          "red-dim": "#cc3544",
          gold: "#f5a623",
          green: "#39d264",
          text: "#ecf0f5",
          muted: "#7b8fa8",
          "muted-2": "#4a5c6e",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "Consolas", "monospace"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-accent": "0 0 15px rgba(0, 212, 255, 0.3)",
        "glow-red": "0 0 15px rgba(255, 70, 85, 0.3)",
        "glow-gold": "0 0 12px rgba(245, 166, 35, 0.25)",
        "glow-green": "0 0 12px rgba(57, 210, 100, 0.25)",
        "panel": "0 4px 24px rgba(0,0,0,0.4)",
        "panel-hover": "0 8px 32px rgba(0,0,0,0.6)",
      },
      borderColor: {
        DEFAULT: "#1e2d3d",
      },
      backgroundImage: {
        "grid-dark":
          "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
        "panel-gradient":
          "linear-gradient(135deg, rgba(19,27,36,0.95) 0%, rgba(15,25,35,0.98) 100%)",
        "hero-gradient":
          "radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(255,70,85,0.06) 0%, transparent 50%)",
        "card-hover":
          "linear-gradient(135deg, rgba(0,212,255,0.05) 0%, rgba(0,0,0,0) 100%)",
      },
      backgroundSize: {
        grid: "32px 32px",
      },
      clipPath: {
        panel: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
        "panel-lg": "polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "flicker": {
          "0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%": { opacity: "1" },
          "20%, 21.999%, 63%, 63.999%, 65%, 69.999%": { opacity: "0.4" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "flicker": "flicker 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
