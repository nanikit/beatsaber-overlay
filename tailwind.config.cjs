/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "translate-diff": "translate-x-diff 10s linear infinite",
      },
      keyframes: {
        "onetime-fadeout": {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        "translate-x-diff": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
