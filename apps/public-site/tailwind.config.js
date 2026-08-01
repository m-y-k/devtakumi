/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        primary: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        night: {
          950: "#05070d",
          900: "#0a0e17",
          850: "#0c1220",
          800: "#111827",
          700: "#1a2233",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(249,115,22,0.14), 0 20px 60px -20px rgba(249,115,22,0.4)",
        "glow-sm": "0 0 24px -6px rgba(249,115,22,0.45)",
        "glow-cyan": "0 0 24px -8px rgba(6,182,212,0.5)",
        card: "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 24px 60px -35px rgba(0,0,0,0.9)",
      },
      keyframes: {
        aurora: {
          "0%,100%": { transform: "translate(0,0) scale(1)", opacity: "0.55" },
          "50%": { transform: "translate(40px,-30px) scale(1.18)", opacity: "0.85" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "spin-slow": {
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-soft": {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        aurora: "aurora 9s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 32s linear infinite",
        shimmer: "shimmer 2.4s infinite",
        "spin-slow": "spin-slow 14s linear infinite",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(148,163,184,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.055) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
}
