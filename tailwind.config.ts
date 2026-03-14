import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#f7f3ea",
          100: "#f0e6d3",
          200: "#e8d7b9",
          300: "#d9bd8d",
          400: "#be9560",
          500: "#a87743",
          600: "#8a5d33",
          700: "#6d482b",
          800: "#593d27",
          900: "#4b3424"
        },
        ink: "#1f1c18",
        moss: "#3e5a47",
        ember: "#b95e35"
      },
      boxShadow: {
        float: "0 16px 40px rgba(45, 30, 12, 0.18)"
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem"
      },
      fontFamily: {
        display: ["Georgia", "Times New Roman", "serif"],
        body: ["Trebuchet MS", "Verdana", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
