/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Add your custom color palette here
        'primary': 'rgb(var(--color-primary) / <alpha-value>)',
        'secondary': 'rgb(var(--color-secondary) / <alpha-value>)',
        'accent': 'rgb(var(--color-accent) / <alpha-value>)',
        'bg-primary': 'rgb(var(--color-bg-primary) / <alpha-value>)',
        'bg-secondary': 'rgb(var(--color-bg-secondary) / <alpha-value>)',
        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'glow': 'glow 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': {
            'filter': 'drop-shadow(0 0 5px rgb(var(--color-accent))) drop-shadow(0 0 10px rgb(var(--color-accent)))',
            'opacity': '0.7',
          },
          '50%': {
            'filter': 'drop-shadow(0 0 15px rgb(var(--color-accent))) drop-shadow(0 0 25px rgb(var(--color-accent)))',
            'opacity': '1',
          },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
