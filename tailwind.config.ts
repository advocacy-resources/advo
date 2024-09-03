import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./stories/**/*.{js,jsx,ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        "hero-pattern": "url('/src/assets/AdvoHomeHeroBanner.png')",
        "gradient-yellow-pink": "linear-gradient(to right, #FDF952, #EB59AB)",
      },
      colors: {
        "advo-pink": "#EB59AB",
      },
      boxShadow: {
        glow: "0 0 20px #FDF952",
      },
      textShadow: {
        glow: "0 0 5px #FDF952, 0 0 10px #FDF952, 0 0 15px #FDF952, 0 0 20px #FDF952",
      },
      // fontFamily: {
      //   "anonymous-pro": ["var(--font-anonymous-pro)", "monospace"],
      //   univers: ["var(--font-univers)", "sans-serif"],
      // },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(function ({ addUtilities, theme }) {
      addUtilities({
        ".text-glow": {
          textShadow: theme("textShadow.glow"),
        },
        ".parallelogram-btn": {
          backgroundColor: "#eb59ab",
          color: "white",
          padding: "0.75rem 1rem",
          transform: "skewX(-12.5deg)",
          fontWeight: "bold",
          border: "none",
          transition: "all 0.3s ease",
        },
        ".parallelogram-btn:hover": {
          backgroundColor: "#FDF952",
          color: "#000",
          boxShadow: "0 0 15px #FDF952",
        },
      });
    }),
  ],
};

export default config;
