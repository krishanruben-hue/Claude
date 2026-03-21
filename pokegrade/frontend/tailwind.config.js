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
          accent: '#C4AF88',
          'accent-hover': '#D4BF9C',
        },
      },
      letterSpacing: {
        yeezy: '0.25em',
        'yeezy-lg': '0.4em',
      },
    },
  },
  plugins: [],
};
