/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@mariojgt/wind-notify/packages/toasts/messages.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
