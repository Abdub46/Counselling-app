/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf6',
          100: '#dcfce9',
          200: '#bbf7d3',
          300: '#86efb0',
          400: '#4ade87',
          500: '#22c565',
          600: '#16a34e',
          700: '#15803e',
          800: '#166534',
          900: '#14532b',
        },
        accent: {
          500: '#2563eb',
          600: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
};
