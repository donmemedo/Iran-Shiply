import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        brand: { DEFAULT: '#7C5CFF', 2: '#22D3EE', 3: '#A3E635' },
      },
      fontFamily: { sans: ['var(--font-ui)', 'system-ui', 'sans-serif'] },
      borderRadius: { xl2: '1.5rem' },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0) scale(1)' }, '50%': { transform: 'translateY(-24px) scale(1.06)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        float: 'float 14s ease-in-out infinite',
        marquee: 'marquee 38s linear infinite',
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
