/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          lavender: '#EAE6FF',
          'lavender-light': '#F4F2FF',
          purple: '#6750A4',
          'purple-dark': '#4F378B',
          'purple-light': '#7D5260',
          navy: '#20243A',
          'navy-light': '#2E3452',
          'warm-white': '#FAF9F7',
          'soft-grey': '#F1F1F5',
          'powder-blue': '#DCEBFA',
          'powder-blue-light': '#EDF5FD',
          'muted-pink': '#F4DCE9',
          'muted-pink-light': '#FAEFF5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'premium': '0 10px 30px -5px rgba(103, 80, 164, 0.08), 0 0 0 1px rgba(103, 80, 164, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      }
    },
  },
  plugins: [],
}
