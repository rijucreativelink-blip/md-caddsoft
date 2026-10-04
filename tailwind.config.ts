import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', lg: '2rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#bcdeff',
          300: '#8ecaff',
          400: '#59acff',
          500: '#338bff',
          600: '#1d6bf5',
          700: '#1554e1',
          800: '#1846b6',
          900: '#1a3f8f',
          950: '#142757',
        },
        accent: {
          50: '#fffbea',
          100: '#fff3c4',
          200: '#fce588',
          300: '#fadb5f',
          400: '#f7c948',
          500: '#f0b429',
          600: '#de911d',
          700: '#cb6e17',
          800: '#b44d12',
          900: '#8d2b0b',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b0b8c9',
          400: '#8591ab',
          500: '#667391',
          600: '#525d78',
          700: '#434c62',
          800: '#3a4153',
          900: '#0b1220',
          950: '#060a14',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Sora', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-light':
          'linear-gradient(to right, rgba(15,23,42,.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,.055) 1px, transparent 1px)',
        'grid-dark':
          'linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px)',
        'hero-glow':
          'radial-gradient(60% 60% at 50% 0%, rgba(51,139,255,.35) 0%, rgba(51,139,255,0) 70%)',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(11,18,32,.04), 0 8px 30px rgba(11,18,32,.07)',
        lift: '0 10px 40px -12px rgba(21,84,225,.35)',
        glow: '0 0 0 1px rgba(51,139,255,.25), 0 18px 50px -18px rgba(51,139,255,.55)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .6s cubic-bezier(.21,.6,.35,1) both',
        'fade-in': 'fade-in .5s ease both',
        marquee: 'marquee 32s linear infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
