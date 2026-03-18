/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pg: {
          bg: '#0f1117',
          card: '#1a1d27',
          border: '#2a2d3d',
          accent: '#7c5cfc',
          'accent-hover': '#9b7fff',
        },
      },
    },
  },
  plugins: [],
};
