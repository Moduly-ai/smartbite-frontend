/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontWeight: {
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
      colors: {
        // Primary Colors
        primary: '#7EC8E3',
        secondary: '#4A90B8',
        
        // Neutral Colors
        'cool-grey': '#6B7280',
        'pure-black': '#1A1A1A',
        'pure-white': '#FFFFFF',
        
        // Legacy support (mapped to new colors)
        'neutral-50': '#F9FAFB',
        'neutral-100': '#F3F4F6',
        'neutral-900': '#1A1A1A',
        white: '#FFFFFF',
        lightgray: '#E5E7EB',
      },
      animation: {
        'fade-in-up': 'fadeUp 0.8s ease-out',
      },
      keyframes: {
        fadeUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}
