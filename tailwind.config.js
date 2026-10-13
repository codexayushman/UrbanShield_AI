/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: 'rgb(var(--bg) / <alpha-value>)',
          900: 'rgb(var(--surface) / <alpha-value>)',
          850: 'rgb(var(--surface) / <alpha-value>)',
          800: 'rgb(var(--surface-alt) / <alpha-value>)',
          700: 'rgb(var(--border) / <alpha-value>)',
          600: 'rgb(var(--border-light) / <alpha-value>)',
          500: 'rgb(var(--text-muted) / <alpha-value>)',
        },
        cyan: {
          400: 'rgb(var(--accent) / <alpha-value>)',
          500: 'rgb(var(--accent-light) / <alpha-value>)',
          600: 'rgb(var(--accent-dark) / <alpha-value>)',
        },
        slate: {
          200: 'rgb(var(--surface-alt) / <alpha-value>)',
          300: 'rgb(var(--border-light) / <alpha-value>)',
          400: 'rgb(var(--text-muted) / <alpha-value>)',
          500: 'rgb(var(--text-muted) / <alpha-value>)',
          600: 'rgb(var(--text-secondary) / <alpha-value>)',
          800: 'rgb(var(--text) / <alpha-value>)',
        },
        green: {
          400: 'rgb(var(--green) / <alpha-value>)',
          500: 'rgb(var(--green) / <alpha-value>)',
        },
        red: {
          400: 'rgb(var(--red) / <alpha-value>)',
          500: 'rgb(var(--red) / <alpha-value>)',
        },
        orange: {
          400: 'rgb(var(--orange) / <alpha-value>)',
          500: 'rgb(var(--orange) / <alpha-value>)',
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'sos-pulse': 'sos-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
