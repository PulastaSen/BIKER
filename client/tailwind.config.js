/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        motoBg: '#090909',
        motoSurface: '#111111',
        motoAccent: '#FFF174',
        motoEmergency: '#EF4444',
        motoSuccess: '#22C55E',
        motoText: '#FFFFFF',
        motoMuted: '#A1A1AA',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
