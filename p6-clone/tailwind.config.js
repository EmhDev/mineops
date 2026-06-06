/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        p6bg: '#18181b',
        p6panel: '#27272a',
        p6border: '#3f3f46',
        p6text: '#e4e4e7',
        p6accent: '#3b82f6',
      }
    },
  },
  plugins: [],
}
