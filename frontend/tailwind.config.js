/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'rgba(255, 255, 255, 0.1)',
        input: 'rgba(255, 255, 255, 0.1)',
        ring: '#00F0FF',
        background: '#050505',
        foreground: '#FFFFFF',
        primary: {
          DEFAULT: '#7000FF',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#00F0FF',
          foreground: '#000000',
        },
        accent: {
          DEFAULT: '#FFB800',
          foreground: '#000000',
        },
        muted: {
          DEFAULT: '#0A0A0A',
          foreground: 'rgba(255, 255, 255, 0.5)',
        },
        destructive: {
          DEFAULT: '#FF0055',
          foreground: '#FFFFFF',
        },
        success: '#00FF94',
        card: {
          DEFAULT: '#0A0A0A',
          foreground: '#FFFFFF',
        },
        popover: {
          DEFAULT: '#111111',
          foreground: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['JetBrains Mono', 'Fira Code', 'Inter', 'monospace'],
        heading: ['Unbounded', 'Chivo', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 8s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(112, 0, 255, 0.3)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 40px rgba(112, 0, 255, 0.6)',
          },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};