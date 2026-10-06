import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#FACC15',
        ink: '#111827',
        surface: '#F8FAFC',
      },
    },
  },
  plugins: [],
} satisfies Config;
