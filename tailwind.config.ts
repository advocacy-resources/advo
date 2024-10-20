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
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
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
        "bg-main": "gray-100",
        "bg-main-dark": "gray-800",
      },
      boxShadow: {
        glow: "0 0 20px #FDF952",
      },
      textShadow: {
        glow: "0 0 5px #FDF952, 0 0 10px #FDF952, 0 0 15px #FDF952, 0 0 20px #FDF952",
      },
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
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        ".scrollbar-hide": {
          /* IE and Edge */
          "-ms-overflow-style": "none",
          /* Firefox */
          "scrollbar-width": "none",
          /* Safari and Chrome */
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        ".scrollbar-default": {
          /* IE and Edge */
          "-ms-overflow-style": "auto",
          /* Firefox */
          "scrollbar-width": "auto",
          /* Safari and Chrome */
          "&::-webkit-scrollbar": {
            display: "block",
          },
        },
      };
      addUtilities(newUtilities);
    }),
  ],
} satisfies Config;

export default config;
