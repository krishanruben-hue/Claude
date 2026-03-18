/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pg: {
          bg: 'var(--pg-bg)',
          card: 'var(--pg-card)',
          border: 'var(--pg-border)',
          accent: '#7c5cfc',
          'accent-hover': '#9b7fff',
        },
      },
    },
  },
  plugins: [],
};
