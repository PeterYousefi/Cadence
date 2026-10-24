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
          bg: '#09090b',
          card: '#121217',
          border: '#27272a',
          neonCyan: '#06b6d4',
          neonEmerald: '#10b981',
          neonViolet: '#8b5cf6',
          neonPink: '#ec4899',
          neonAmber: '#f59e0b',
          glow: 'rgba(6, 182, 212, 0.15)'
        }
      },
      boxShadow: {
        'neon-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.35)',
        'neon-violet': '0 0 20px -3px rgba(139, 92, 246, 0.35)',
        'neon-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'neon-pink': '0 0 20px -3px rgba(236, 72, 153, 0.35)'
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.6)' },
        }
      }
    },
  },
  plugins: [],
};
