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
        // Squash before the jump, stretch in the air, squash on landing.
        'avatar-hop': {
          '0%, 100%': { transform: 'translateY(0) scale(1, 1)' },
          '15%': { transform: 'translateY(0) scale(1.08, 0.9)' },
          '40%': { transform: 'translateY(-14%) scale(0.95, 1.07) rotate(-3deg)' },
          '62%': { transform: 'translateY(0) scale(1.06, 0.93)' },
          '80%': { transform: 'translateY(-3%) scale(0.99, 1.02)' },
        },
        // Turns its head slowly in 3D and breathes.
        'avatar-idle': {
          '0%, 100%': { transform: 'perspective(320px) rotateY(-14deg) rotateX(2deg) translateY(0) scale(1)' },
          '50%': { transform: 'perspective(320px) rotateY(14deg) rotateX(-3deg) translateY(-3%) scale(1.03)' },
        },
        // Slumps down and to the side, like a sigh.
        'avatar-droop': {
          '0%': { transform: 'perspective(320px) rotateX(0deg) rotate(0deg) translateY(0) scale(1, 1)' },
          '40%': { transform: 'perspective(320px) rotateX(10deg) rotate(-4deg) translateY(4%) scale(1.03, 0.94)' },
          '100%': { transform: 'perspective(320px) rotateX(16deg) rotate(-9deg) translateY(5%) scale(1, 0.97)' },
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
        'avatar-hop': 'avatar-hop 800ms cubic-bezier(0.3, 0.7, 0.4, 1) 1',
        'avatar-droop': 'avatar-droop 900ms cubic-bezier(0.3, 0.6, 0.3, 1) forwards',
        'avatar-idle': 'avatar-idle 4.8s ease-in-out infinite',
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
