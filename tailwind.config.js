/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dark theme colors matching existing dashboard
        dark: {
          bg: "#0f1923",
          card: "#1a2733",
          border: "#1e2d3d",
          hover: "#2a3f52",
        },
        accent: {
          blue: "#4fc3f7",
          red: "#ef5350",
          green: "#66bb6a",
          orange: "#ffa726",
          purple: "#ab47bc",
          teal: "#26a69a",
        },
      },
    },
  },
  plugins: [],
};
