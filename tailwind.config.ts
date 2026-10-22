import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'count-pop': {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '30%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0.15', transform: 'scale(1.04)' },
        },
        'avatar-hop': {
          '0%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-6px)' },
          '70%': { transform: 'translateY(0)' },
          '85%': { transform: 'translateY(-2px)' },
        },
        'avatar-idle': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-2px) rotate(-2deg)' },
        },
        'avatar-droop': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-8deg) translateY(2px)' },
        },
        'float-up': {
          '0%': { opacity: '0', transform: 'translateY(0) scale(0.8)' },
          '15%': { opacity: '1', transform: 'translateY(-20px) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-220px) scale(1.05)' },
        },
        nudge: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        rise: { from: { transform: 'scaleY(0)' }, to: { transform: 'scaleY(1)' } },
        'grow-x': { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
      },
      animation: {
        'fade-up': 'fade-up 400ms ease-out both',
        'fade-in': 'fade-in 300ms ease-out both',
        'count-pop': 'count-pop 1000ms ease-out both',
        'avatar-hop': 'avatar-hop 700ms ease-out 1',
        'avatar-droop': 'avatar-droop 500ms ease-out forwards',
        'avatar-idle': 'avatar-idle 3.6s ease-in-out infinite',
        'float-up': 'float-up 2200ms ease-out forwards',
        nudge: 'nudge 300ms ease-in-out 1',
        rise: 'rise 700ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        'grow-x': 'grow-x 600ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
      },
    },
  },
  plugins: [],
}

export default config
