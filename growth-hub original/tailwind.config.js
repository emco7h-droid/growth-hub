/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EAF2FB',
          100: '#B5D4F4',
          500: '#2E6DA4',
          700: '#1B3A5C',
          900: '#0D2137',
        }
      }
    },
  },
  plugins: [],
}
