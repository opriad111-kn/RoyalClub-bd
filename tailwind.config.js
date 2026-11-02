/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        dkwin: {
          yellow: '#F5BE00',
          yellowDark: '#D9A700',
          yellowLight: '#FFF4CC',
          yellowPale: '#FFFDF0',
          bg: '#F4F5F8',
          card: '#FFFFFF',
          textDark: '#1E2329',
          textGray: '#707A8A',
          textLight: '#9EA8B6',
        },
        pastel: {
          pink: '#FFF0F0',
          pinkBorder: '#FFD2D2',
          pinkText: '#FF4D4F',
          orange: '#FFF7E6',
          orangeBorder: '#FFE7BA',
          orangeText: '#FA8C16',
          blue: '#E6F7FF',
          blueBorder: '#BAE7FF',
          blueText: '#1890FF',
          teal: '#E6FFFB',
          tealBorder: '#B5F5EC',
          tealText: '#13C2C2',
          yellow: '#FEFFE6',
          yellowBorder: '#FFFB8F',
          yellowText: '#D4B106',
        },
        gold: {
          400: '#FBBF24',
          500: '#F5BE00',
          600: '#D97706',
        },
        wingo: {
          green: '#10B981',
          red: '#EF4444',
          violet: '#8B5CF6',
          bg: '#0B1120',
          card: '#111827',
          surface: '#1F2937',
        }
      },
      boxShadow: {
        'dkwin-card': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'dkwin-elevated': '0 6px 16px rgba(245, 190, 0, 0.25)',
        'dkwin-bottom': '0 -4px 16px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'bounce-short': 'bounce 0.5s ease-in-out 2',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}

