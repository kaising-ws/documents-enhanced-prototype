/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Primary colors from Figma
        primary: {
          50: '#eef3fc',
          100: '#d5e1f7',
          500: '#3c6cde',
          600: '#3560c7',
          700: '#2d52a8',
        },
        // Navigation dark theme
        nav: {
          DEFAULT: '#2f333e',
          light: '#464d5d',
          dark: '#1a1d24',
        },
        // Grays from Figma
        gray: {
          50: '#f9fafb',
          100: '#f3f5f9',
          200: '#f2f4f7',
          300: '#e4e4e7',
          400: '#d4d4d8',
          500: '#a0a2b2',
          600: '#787883',
          700: '#586074',
          800: '#2f333e',
          900: '#161a24',
        },
        // Accent colors
        accent: {
          red: {
            400: '#ee4052',
            500: '#e53e3e',
          },
          blue: {
            500: '#3c6cde',
            600: '#457cff',
          },
        },
        // Text colors
        text: {
          primary: '#2f333e',
          secondary: 'rgba(9,26,66,0.6)',
          disabled: '#d4d4d8',
          placeholder: 'rgba(7,26,71,0.4)',
        },
        // Border colors
        border: {
          DEFAULT: 'rgba(4,26,77,0.15)',
          light: '#e4e4e7',
          medium: 'rgba(6,26,74,0.3)',
        },
        // Surface colors
        surface: {
          container: '#ffffff',
          navigation: '#2f333e',
          gray: '#f2f4f7',
        },
      },
      boxShadow: {
        'card': '0px 1px 2px 0px rgba(35,39,47,0.06), 0px 1px 3px 1px rgba(35,39,47,0.1)',
        'dropdown': '0px 2px 2px 0px rgba(35,39,47,0.08), 0px 4px 8px 2px rgba(35,39,47,0.12)',
        'modal': '0px 4px 4px 0px rgba(35,39,47,0.08), 0px 8px 16px 3px rgba(35,39,47,0.12)',
        'topbar': '0px 1px 4px 0px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        'element': '8px',
        'container': '12px',
      },
    },
  },
  plugins: [],
}



