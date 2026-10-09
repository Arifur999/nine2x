/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#E50914',
        'brand-accent': '#00D4FF',
        'brand-gold': '#FFD700',
        'brand-green': '#46d369',
        'bg-base': '#060608',
        'bg-surface': '#0e0e12',
        'bg-surface-2': '#16161c',
        'bg-surface-3': '#1e1e26',
        'bg-card': '#12121a',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      animation: {
        shimmer: 'shimmer 1.8s infinite',
        'pulse-mic': 'pulse-mic 1.2s ease-in-out infinite',
        'drop-in': 'dropIn 0.22s ease forwards',
        'slide-down': 'slideDown 0.3s ease',
        'fade-in': 'fadeIn 0.25s ease',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-mic': {
          '0%, 100%': { color: '#E50914' },
          '50%': { color: 'white', textShadow: '0 0 12px #E50914' },
        },
        dropIn: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
