/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary brand: violet. Swapped out from the original blue so the
        // whole app (buttons, links, active nav states, focus rings) reads
        // as a distinct, modern product rather than "default Tailwind blue".
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Secondary accent: teal. Used alongside brand for gradients and
        // to give the palette a second identity beyond a single hue.
        accent: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
        // The neutral scale every `gray-*` / `dark:` class in the app
        // already uses. Re-tinting it (instead of literally pure gray)
        // means dark mode becomes a rich deep-violet slate instead of
        // flat black, and it applies everywhere automatically — no need
        // to touch every component that references `gray-*`.
        gray: {
          50: '#f8f7fc',
          100: '#f0eef9',
          200: '#e0dcf1',
          300: '#c3bce0',
          400: '#9d93c4',
          500: '#7a70a8',
          600: '#5b4f87',
          700: '#453b69',
          800: '#2e2748',
          900: '#1c1730',
          950: '#110e21',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 0 rgb(0 0 0 / 0.04)',
        elevate: '0 2px 4px -2px rgb(0 0 0 / 0.08), 0 12px 24px -8px rgb(0 0 0 / 0.12)',
        'elevate-lg': '0 8px 16px -4px rgb(0 0 0 / 0.1), 0 24px 48px -12px rgb(0 0 0 / 0.2)',
        glow: '0 0 0 1px rgb(124 58 237 / 0.18), 0 8px 24px -4px rgb(124 58 237 / 0.45)',
        'glow-accent': '0 0 0 1px rgb(20 184 166 / 0.18), 0 8px 24px -4px rgb(20 184 166 / 0.4)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 45%, #14b8a6 100%)',
        'hero-mesh':
          'radial-gradient(at 15% 20%, rgba(124,58,237,0.30) 0, transparent 50%), radial-gradient(at 85% 0%, rgba(20,184,166,0.25) 0, transparent 50%), radial-gradient(at 50% 100%, rgba(217,70,239,0.18) 0, transparent 50%)',
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
        pageIn: {
          '0%': { opacity: '0', transform: 'translateY(18px) translateZ(-40px) rotateX(6deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) translateZ(0) rotateX(0deg)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        blob: 'blob 14s ease-in-out infinite',
        'pop-in': 'popIn 0.18s ease-out',
        'page-in': 'pageIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};
