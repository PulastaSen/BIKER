/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        motoBg: '#151515',
        motoSurface: '#1D1D1D',
        motoElevated: '#252525',
        motoInteractive: '#2D2D2D',
        motoAccent: '#FFF174',
        motoEmergency: '#EF4444',
        motoMedical: '#38BDF8',
        motoSuccess: '#10B981',
        motoWarning: '#F59E0B',
        motoText: '#FFFFFF',
        motoMuted: '#C5C5C5',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
