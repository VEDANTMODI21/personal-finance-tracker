/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 0 rgb(0 0 0 / 0.04)',
        elevate: '0 2px 4px -2px rgb(0 0 0 / 0.08), 0 12px 24px -8px rgb(0 0 0 / 0.12)',
        'elevate-lg': '0 8px 16px -4px rgb(0 0 0 / 0.1), 0 24px 48px -12px rgb(0 0 0 / 0.2)',
        glow: '0 0 0 1px rgb(37 99 235 / 0.15), 0 8px 24px -4px rgb(37 99 235 / 0.45)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2563eb 0%, #4f46e5 55%, #7c3aed 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(24px, -32px) scale(1.1)' },
          '66%': { transform: 'translate(-18px, 18px) scale(0.95)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(6px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        blob: 'blob 14s ease-in-out infinite',
        'pop-in': 'popIn 0.18s ease-out',
      },
    },
  },
  plugins: [],
};
