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
      fontSize: {
        'body': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'callout': ['13px', { lineHeight: '18px', fontWeight: '700' }],
        'headline': ['14px', { lineHeight: '20px', fontWeight: '700' }],
        'title-4': ['18px', { lineHeight: '24px', fontWeight: '700' }],
      },
      colors: {
        primary: {
          50: '#eef3fc',
          100: '#d5e1f7',
          500: '#3c6cde',
          600: '#3560c7',
          700: '#2d52a8',
        },
        nav: {
          DEFAULT: '#2f333e',
          light: '#464d5d',
          dark: '#1a1d24',
        },
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
        text: {
          primary: '#161a24',
          secondary: 'rgba(9,26,66,0.6)',
          disabled: '#d4d4d8',
          placeholder: 'rgba(7,26,71,0.4)',
        },
        border: {
          DEFAULT: 'rgba(4,26,77,0.15)',
          light: 'rgba(3,26,79,0.1)',
          medium: 'rgba(6,26,74,0.3)',
        },
        surface: {
          container: '#ffffff',
          navigation: '#2f333e',
          gray: '#f2f4f7',
        },
      },
      spacing: {
        'space-xs': '2px',
        'space-sm': '4px',
        'space-md': '6px',
        'space-lg': '8px',
        'space-xl': '10px',
        'space-2xl': '12px',
        'space-3xl': '16px',
      },
      boxShadow: {
        'card': '0px 1px 2px 0px rgba(35,39,47,0.06), 0px 1px 3px 1px rgba(35,39,47,0.1)',
        'dropdown': '0px 2px 2px 0px rgba(35,39,47,0.08), 0px 4px 8px 2px rgba(35,39,47,0.12)',
        'modal': '0px 2px 4px 1px rgba(22,26,36,0.08), 0px 2px 2px 0px rgba(22,26,36,0.06)',
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
