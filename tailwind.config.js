/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'Inter', 'ui-sans-serif', 'system-ui'],
        nunito: ['Nunito', 'Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        riva: {
          blue: '#3B82F6', // Electric Blue
          violet: '#8B5CF6', // Violet
          teal: '#06B6D4', // Teal
          gray: '#F3F4F6', // Light Gray
          dark: '#18181B', // Deep Black
          white: '#FFFFFF',
        },
        background: {
          DEFAULT: '#FFFFFF',
          light: '#F9FAFB',
        },
        accent: {
          blue: '#3B82F6',
          violet: '#8B5CF6',
          teal: '#06B6D4',
        },
        dark: {
          bg: '#0a0a0a',
          card: '#1a1a1a',
          border: '#2a2a2a',
          text: '#e5e5e5',
          muted: '#a0a0a0',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(24, 119, 242, 0.3)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(24, 119, 242, 0.6)',
            transform: 'scale(1.05)'
          },
        },
      },
      boxShadow: {
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)',
        'professional': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'riva-glow': '0 4px 32px 0 rgba(59, 130, 246, 0.25)',
      },
      backgroundImage: {
        'riva-gradient': 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)',
      },
    },
  },
  plugins: [],
}; 