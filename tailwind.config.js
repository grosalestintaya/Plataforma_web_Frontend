/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  extend: {
  colors: {
    "app-bg": "var(--app-bg)",
    primary: "var(--primary)",
    accent: "var(--accent)",
    "bg-primary-100": "rgb(var(--bg-primary-100) / <alpha-value>)",
  },
}

};
