/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF8F4F',
          dark: '#E6763A',
          light: '#FFA76B',
        },
        accent: {
          DEFAULT: '#3CD3A8',
          dark: '#2BAF8A',
          light: '#5FE0C0',
        },
        secondary: {
          DEFAULT: '#0A4B70',
          dark: '#073A57',
          light: '#0D5C8A',
        },
        surface: {
          DEFAULT: '#EFEFEF',
          white: '#FFFFFF',
        },
        text: {
          primary: '#2B3D3F',
          secondary: '#6B7280',
        },
        border: {
          DEFAULT: '#E5E7EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

