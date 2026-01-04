/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      /**
       * Brand palette (from your provided color scheme slide)
       * - blue   #083796
       * - gold   #f49728
       * - orange #fb904e
       */
      colors: {
        brand: {
          blue: '#083796',
          'blue-dark': '#062d78',
          gold: '#f49728',
          orange: '#fb904e',
        },
      },

      /** A softer shadow that still feels crisp on white backgrounds */
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.10)',
      },

      /** Small float animation used sparingly for “alive but not annoying” motion */
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        floaty: 'floaty 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
