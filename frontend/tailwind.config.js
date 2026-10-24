/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#070b14',
          900: '#0b1120',
          850: '#0d1527',
          800: '#111c35',
          750: '#162344',
          700: '#1e293b',
          border: '#1f2e4d',
          neonCyan: '#00f0ff',
          tealGlow: '#06b6d4',
          pulseGreen: '#10b981',
          alertRed: '#f43f5e',
          warningAmber: '#f59e0b',
          metricPurple: '#a855f7'
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px -2px rgba(0, 240, 255, 0.35)',
        'neon-teal': '0 0 20px -3px rgba(6, 182, 212, 0.3)',
        'neon-red': '0 0 20px -2px rgba(244, 63, 94, 0.45)',
        'neon-card': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}

