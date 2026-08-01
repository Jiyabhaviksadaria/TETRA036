/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        forest: {
          950: '#0B1F16',
          800: '#123626',
          600: '#1F5A3D',
        },
        sunrise: {
          400: '#F2C879',
        },
        field: {
          100: '#F4F1E8',
        },
        status: {
          safe: '#4ADE80',
          caution: '#FACC15',
          alert: '#EF4444',
        },
        ink: {
          900: '#101512',
        },
        rakshak: {
          primary: '#1F5A3D',
          accent: '#4ADE80',
          bg: '#0B1F16',
          card: '#123626',
          secondaryBg: '#123626',
          darkBg: '#0B1F16',
          text: '#F4F1E8',
          secondaryText: '#A3B8AD',
          border: '#1F5A3D/40',
          danger: '#EF4444',
          warning: '#FACC15',
          success: '#4ADE80',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Sans"', 'monospace'],
      },
      borderRadius: {
        '24': '24px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(31, 90, 61, 0.15)',
        'soft-lg': '0 20px 40px -10px rgba(11, 31, 22, 0.5)',
        'glow-safe': '0 0 35px rgba(74, 222, 128, 0.45)',
        'glow-alert': '0 0 45px rgba(239, 68, 68, 0.65)',
        'glow-caution': '0 0 35px rgba(250, 204, 21, 0.45)',
      },
    },
  },
  plugins: [],
}
