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
        rakshak: {
          primary: '#2F9D68',
          accent: '#4CCB88',
          bg: '#F7FAF7',
          card: '#FFFFFF',
          secondaryBg: '#EEF5EF',
          darkBg: '#121815',
          text: '#18201B',
          secondaryText: '#65726B',
          border: '#E3ECE5',
          danger: '#E5484D',
          warning: '#F5A623',
          success: '#4CAF50',
          info: '#4B8DFF',
        },
      },
      fontFamily: {
        sora: ['var(--font-sora)', 'Sora', 'sans-serif'],
        inter: ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono: ['var(--font-ibm-plex)', 'IBM Plex Sans', 'monospace'],
      },
      borderRadius: {
        '24': '24px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(47, 157, 104, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 20px 40px -10px rgba(18, 24, 21, 0.08), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 25px rgba(76, 203, 136, 0.35)',
        'glow-danger': '0 0 25px rgba(229, 72, 77, 0.35)',
      },
    },
  },
  plugins: [],
}
