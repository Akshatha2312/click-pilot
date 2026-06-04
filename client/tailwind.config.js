/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        accent: {
          cyan: "#22d3ee",
          emerald: "#10b981",
          pink: "#ec4899",
          orange: "#f97316",
          amber: "#f59e0b",
          danger: "#ef4444",
        },
        customBg: "#EAEFEF",
        customSec: "#BFC9D1",
        customDark: "#25343F",
        customAccent: "#FF9B51",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Outfit", "Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(99,102,241,.28), 0 20px 40px rgba(79,70,229,.22)",
        card: "0 15px 45px rgba(2, 6, 23, 0.12)",
        cardDark: "0 20px 55px rgba(2, 6, 23, 0.45)",
      },
      backgroundImage: {
        "hero-light": "radial-gradient(circle at 10% 20%, rgba(99,102,241,.22), transparent 40%), radial-gradient(circle at 90% 10%, rgba(34,211,238,.2), transparent 35%), linear-gradient(160deg, #f8fafc 0%, #eef2ff 60%, #fdf4ff 100%)",
        "hero-dark": "radial-gradient(circle at 10% 20%, rgba(99,102,241,.3), transparent 40%), radial-gradient(circle at 90% 10%, rgba(34,211,238,.2), transparent 35%), linear-gradient(160deg, #020617 0%, #0f172a 55%, #111827 100%)",
      },
    },
  },
  plugins: [],
};

