/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        motoBg: '#12161A',
        motoSurface: '#1A2026',
        motoCard: '#1E252D',
        motoElevated: '#242D37',
        motoInteractive: '#2A3440',
        motoBorder: '#2E3844',
        motoBorderSubtle: '#222933',
        motoAccent: '#FFF174', // Signature MotoAssist Yellow
        motoYellow: '#FFF174',
        motoGold: '#FACC15',
        motoEmergency: '#EF4444',
        motoRed: '#EF4444',
        motoChartreuse: '#DFF127',
        motoBlue: '#60A5FA',
        motoLavender: '#A78BFA',
        motoOlive: '#545347',
        motoMedical: '#EF4444',
        motoSuccess: '#10B981',
        motoWarning: '#F59E0B',
        motoText: '#FFFFFF', // Crisp white text as requested
        motoTextSecondary: '#94A3B8',
        motoMuted: '#94A3B8',
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
