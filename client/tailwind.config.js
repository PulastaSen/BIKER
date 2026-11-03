/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        motoBg: '#101214',
        motoSurface: '#191D20',
        motoCard: '#22272B',
        motoElevated: '#22272B',
        motoInteractive: '#2D3339',
        motoBorder: '#343B42',
        motoBorderSubtle: '#262B30',
        motoAccent: '#FFF174',
        motoChartreuse: '#DFF127',
        motoBlue: '#B1D8E3',
        motoLavender: '#95667F',
        motoOlive: '#545347',
        motoEmergency: '#EF4444',
        motoMedical: '#B1D8E3',
        motoSuccess: '#10B981',
        motoWarning: '#F59E0B',
        motoText: '#FFFFFF',
        motoMuted: '#B8C0C5',
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
