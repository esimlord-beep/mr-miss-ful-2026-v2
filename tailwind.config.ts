import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "#f8fafc",
        primary: "#1e3a8a",
        navy: "#0f172a",
        accent: "#eab308"
      },
      boxShadow: {
        premium: "0 24px 70px rgba(15, 23, 42, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
