/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f3f9',
          100: '#e1e7f3',
          200: '#c3cfeb',
          500: '#334e85',
          700: '#1e293b',
          800: '#131b2e',
          900: '#0f172a',
        },
        gold: {
          50: '#fefcf3',
          100: '#fcf8e3',
          200: '#f8efb9',
          300: '#f3e386',
          400: '#ebd353',
          500: '#d4af37',
          600: '#ba9428',
          700: '#947220',
          800: '#775a1e',
          900: '#644b1d',
        },
        portal: {
          bg: '#f8fafc',
          card: '#ffffff',
          dark: '#0f172a',
          accent: '#d4af37',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans Ethiopic"', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
