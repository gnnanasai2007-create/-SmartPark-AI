/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        parking: {
          available: '#10B981', // Green
          occupied: '#EF4444',  // Red
          reserved: '#F59E0B',  // Yellow
          ev: '#3B82F6',        // Blue
          women: '#EC4899',     // Pink / Purple
          emergency: '#DC2626', // High alert red
          dark: '#0F172A',
          darkcard: '#1E293B',
          darkborder: '#334155'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
