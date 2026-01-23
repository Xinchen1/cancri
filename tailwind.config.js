/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './services/**/*.{js,ts,jsx,tsx}',
    './App.tsx',
    './index.tsx',
    './*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        crystal: {
          idle: '#a5f3fc',     // Cyan-200
          thinking: '#d8b4fe', // Purple-300
          reflecting: '#fbbf24', // Amber-400
          evolving: '#f43f5e', // Rose-500
        }
      }
    },
  },
  plugins: [],
}

