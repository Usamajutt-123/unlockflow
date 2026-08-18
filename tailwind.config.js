/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        display: ["var(--font-sora)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef5ff",
          100: "#d9e7ff",
          200: "#bcd5ff",
          300: "#8ebaff",
          400: "#5994ff",
          500: "#3370ff",
          600: "#1d4ff0",
          700: "#173cd4",
          800: "#1933ab",
          900: "#1a3187",
        },
        ink: "#0b1220",
        night: {
          950: "#06090f",
          900: "#0a0f1c",
          800: "#0f1626",
          700: "#182132",
        },
        gold: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(51,112,255,0.15), 0 10px 40px -10px rgba(51,112,255,0.35)",
        card: "0 1px 2px rgba(16,24,40,0.04), 0 8px 30px rgba(16,24,40,0.06)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};
