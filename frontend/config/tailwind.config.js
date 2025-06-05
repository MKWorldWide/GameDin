const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
        display: ['Lexend', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: colors.blue,
        secondary: colors.gray,
        success: colors.green,
        warning: colors.yellow,
        error: colors.red,
        info: colors.blue,
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      screens: {
        'xs': '475px',
        ...defaultTheme.screens,
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
  ],
  future: {
    hoverOnlyWhenSupported: true,
    respectDefaultRingColorOpacity: true,
    disableColorOpacityUtilitiesByDefault: true,
    purgeLayersByDefault: true,
  },
  experimental: {
    optimizeUniversalDefaults: true,
    matchVariant: true,
    container: {
      center: true,
      padding: '1rem',
    },
  },
  variants: {
    extend: {
      backgroundColor: ['active', 'group-focus'],
      borderColor: ['active', 'group-focus'],
      boxShadow: ['active', 'group-focus'],
      opacity: ['group-hover', 'group-focus'],
      scale: ['group-hover', 'group-focus'],
      transform: ['group-hover', 'group-focus'],
    },
  },
};
