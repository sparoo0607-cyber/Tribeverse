import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        tribe: {
          blue:   '#1A6FFF',
          yellow: '#FFE600',
          lime:   '#D4FF00',
          pink:   '#FF2D87',
          purple: '#7B2FFF',
          orange: '#FF6B1A',
          teal:   '#00D9C4',
          cyan:   '#00FFD1',
          dark:   '#111418',
          navy:   '#0D1B4B',
        }
      },
      fontFamily: {
        display: ['Outfit', 'Nunito', 'sans-serif'],
        body: ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}

export default config
