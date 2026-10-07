/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gov: {
          darkGreen: "#134e35",
          primary: "#1b6f48",
          emerald: "#2e8b57",
          lightGreen: "#e8f5e9",
          cream: "#fbfaf5",
          sand: "#f4f1ea",
          gold: "#d97706",
          accent: "#b45309",
          slate: "#334155",
          charcoal: "#1e293b",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "sans-serif",
        ],
        display: [
          "Outfit",
          "Inter",
          "-apple-system",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
}
