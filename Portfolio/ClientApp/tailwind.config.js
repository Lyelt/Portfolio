const colors = require('tailwindcss/colors')

module.exports = {
    prefix: '',
    content: [
      './src/**/*.{html,ts}',
    ],
    darkMode: 'class',
    theme: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        gray: colors.slate,
        darkGray: colors.gray,
        indigo: colors.indigo,
        pink: colors.pink,
        white: colors.white,
        black: colors.black,
        red: colors.red,
        green: colors.green,
        yellow: colors.yellow,
        blue: colors.blue,
        orange: colors.orange
      },
      extend: {
        height: {
          112: '28rem',
          128: '32rem',
          256: '64rem'
        },
        zIndex: {
          '999': 999,
          'topmost': 9999
        },
        flexGrow: {
          '1/2': 1 / 2
        },
        fontSize: {
          '2xs': '.5rem',
          '3xs': '.25rem'
        },
        transitionProperty: {
          'bg': 'background-color',
          'center': 'left, right',
        },
        scale: {
          200: '2',
          250: '2.5',
          300: '3',
          350: '3.5',
          400: '4'
        }
      },
     
    },
  plugins: [
    require('@tailwindcss/forms')
  ],
};
