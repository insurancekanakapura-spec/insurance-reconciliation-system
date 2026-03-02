/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4F8A',
          light: '#2563EB',
          dark: '#0F3A6D',
        },
        secondary: '#0EA5A5',
        accent: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#2563EB',
        success: '#10B981',
        dark: '#0B1426',
        gray: {
          50: '#F7F9FC',
          100: '#EEF2F8',
          200: '#DDE4EF',
          300: '#C5D0E0',
          400: '#8A9DC0',
          500: '#5E73A0',
          600: '#3D5278',
          700: '#253550',
          800: '#16243C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Sora', 'sans-serif'],
      },
      borderRadius: {
        'sm': '8px',
        DEFAULT: '12px',
        'lg': '16px',
        'xl': '20px',
      },
      boxShadow: {
        DEFAULT: '0 2px 8px rgba(11,20,38,0.06), 0 0 0 1px rgba(11,20,38,0.04)',
        lg: '0 12px 40px rgba(11,20,38,0.12), 0 0 0 1px rgba(11,20,38,0.04)',
        xl: '0 24px 60px rgba(11,20,38,0.16)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in': 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'spin': 'spin 0.8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        spin: {
          'to': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
