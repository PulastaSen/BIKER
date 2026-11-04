/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        motoBg: '#F8F9FA',
        motoSurface: '#FFFFFF',
        motoCard: '#FFFFFF',
        motoElevated: '#FFFFFF',
        motoInteractive: '#F1F5F9',
        motoBorder: '#E5E7EB',
        motoBorderSubtle: '#F1F5F9',
        motoAccent: '#DC2626',
        motoEmergency: '#DC2626',
        motoRed: '#DC2626',
        motoGold: '#F59E0B',
        motoChartreuse: '#EAB308',
        motoBlue: '#2563EB',
        motoLavender: '#7C3AED',
        motoOlive: '#475569',
        motoMedical: '#DC2626',
        motoSuccess: '#10B981',
        motoWarning: '#F59E0B',
        motoText: '#111827',
        motoMuted: '#6B7280',
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
