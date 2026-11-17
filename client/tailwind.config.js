/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        motoBg: '#0A0D12',
        motoSurface: '#12161D',
        motoCard: '#181D24',
        motoElevated: '#1F242C',
        motoInteractive: '#262D36',
        motoBorder: 'rgba(255, 255, 255, 0.08)',
        motoBorderSubtle: 'rgba(255, 255, 255, 0.05)',
        motoAccent: '#F5B041', // Signature MotoAssist Amber-Yellow Accent
        motoYellow: '#F5B041',
        motoGold: '#F5B041',
        motoEmergency: '#E53935',
        motoRed: '#E53935',
        motoChartreuse: '#DFF127',
        motoBlue: '#60A5FA',
        motoLavender: '#A78BFA',
        motoOlive: '#545347',
        motoMedical: '#E53935',
        motoSuccess: '#10B981',
        motoWarning: '#F59E0B',
        motoText: '#FFFFFF', // Crisp white text
        motoTextSecondary: '#9CA3AF',
        motoMuted: '#9CA3AF',
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
