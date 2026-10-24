/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cad: {
          paper: '#F4F3EF',
          grid: '#E2E0D8',
          black: '#111111',
          panel: '#EBEAE5',
          panelDark: '#DDDBD3',
          orange: '#FF4F00',
          orangeLight: '#FFF0EA',
          green: '#008A4B',
          greenLight: '#E8F5EE',
          gray: '#767676',
          border: '#111111',
          crimson: '#DC2626'
        }
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'cad': '4px 4px 0px #111111',
        'cad-sm': '2px 2px 0px #111111',
        'cad-lg': '6px 6px 0px #111111',
        'cad-orange': '4px 4px 0px #FF4F00',
        'cad-green': '4px 4px 0px #008A4B',
      }
    },
  },
  plugins: [],
};
