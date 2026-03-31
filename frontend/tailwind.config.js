/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Qyro brand colors
        brand: "#E91E63",
        "brand-dark": "#C2185B",
        "brand-light": "#FCE4EC",
        surface: "#FDF2F7",
        card: "#FFFFFF",
        accent: "#111111",
        border: "#F1F1F1",
      },
      fontFamily: {
        sans: ["Poppins", "Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 20px rgba(233, 30, 99, 0.08)",
        "card-hover": "0 8px 40px rgba(233, 30, 99, 0.15)",
        soft: "0 2px 12px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        xl2: "16px",
        xl3: "20px",
      }
    },
  },
  plugins: [],
}