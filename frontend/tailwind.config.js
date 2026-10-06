/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pine: { 50: '#f1f7f4', 100: '#e1eee8', 200: '#c3ddd1', 300: '#97c3b0', 400: '#64a38a', 500: '#418570', 600: '#2f6b5a', 700: '#0e4a3c', 800: '#0b3c31', 900: '#082d25' },
        brass: { 100: '#f4ead3', 300: '#dcc283', 400: '#c9a55a', 500: '#b08a3e', 600: '#8f6d2a' },
        ink: '#12211c',
        muted: '#5e6b66',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(14,74,60,0.18)',
        lift: '0 24px 60px -18px rgba(14,74,60,0.30)',
      },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        shine: { from: { transform: 'translateX(-120%) skewX(-20deg)' }, to: { transform: 'translateX(320%) skewX(-20deg)' } },
      },
      animation: {
        floaty: 'floaty 7s ease-in-out infinite',
        marquee: 'marquee 38s linear infinite',
      },
    },
  },
  plugins: [],
};
