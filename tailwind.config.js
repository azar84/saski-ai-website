/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
      },
      colors: {
        'saski-purple': '#5243E9',
        'saski-purple-light': '#6366F1',
        'saski-purple-dark': '#4338CA',
        'dark-900': '#0F1A2A',
        'dark-800': '#1E2A3B',
        'dark-700': '#27364B',
        'dark-600': '#475569',
        'dark-500': '#64748B',
        'dark-400': '#94A3B8',
        'light-100': '#F6F8FC',
        'light-200': '#E2E8F0',
        'light-300': '#CBD4E1',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
} 