/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        brand: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: {
          50: '#FDF8E7',
          100: '#FCF0C4',
          200: '#F9E18A',
          300: '#F5CF4F',
          400: '#E8B923',
          500: '#D4AF37',
          600: '#B8962E',
          700: '#957725',
          800: '#7A5F1F',
          900: '#644D1A',
        },
        luxury: {
          white: '#FFFFFF',
          light: '#F8F9FA',
          gray: '#E5E7EB',
          dark: '#1F2937',
          black: '#111827',
        }
      },
      boxShadow: {
        'luxury': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'luxury-lg': '0 8px 40px rgba(0, 0, 0, 0.12)',
        'luxury-gold': '0 4px 20px rgba(212, 175, 55, 0.25)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'luxury': '20px',
        'luxury-lg': '24px',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #B8962E 50%, #D4AF37 100%)',
        'gold-shimmer': 'linear-gradient(90deg, #D4AF37, #F5CF4F, #D4AF37)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'gauge-fill': 'gauge-fill 1.5s ease-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)' },
        },
        'gauge-fill': {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--gauge-offset)' },
        },
      },
    },
  },
  plugins: [],
}
