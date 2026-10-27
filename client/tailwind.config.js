/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        motoBg: '#090A08',
        motoSurface: '#151613',
        motoElevated: '#20211D',
        motoInteractive: '#2A2C26',
        motoBorder: '#383A32',
        motoBorderSubtle: '#262822',
        motoAccent: '#FFF174',
        motoChartreuse: '#DFF127',
        motoBlue: '#B1D8E3',
        motoLavender: '#95667F',
        motoOlive: '#545347',
        motoEmergency: '#EF4444',
        motoMedical: '#B1D8E3',
        motoSuccess: '#10B981',
        motoWarning: '#F59E0B',
        motoText: '#EFF2F7',
        motoMuted: '#A8A6A3',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
