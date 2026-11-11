/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48', // primary brand
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        blush: {
          50: '#fffdfd',
          100: '#fff5f6',
          200: '#ffecee',
          300: '#ffdbe0',
          400: '#ffb9c4',
          500: '#f88c9e',
        },
        gold: {
          50: '#fbf9f1',
          100: '#f5f1dc',
          400: '#d4af37',
          500: '#c59b27',
          600: '#a37e1b',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(225, 29, 72, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 10px 30px -5px rgba(225, 29, 72, 0.07), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'float': '0 20px 40px -15px rgba(225, 29, 72, 0.25)',
      }
    },
  },
  plugins: [],
}
