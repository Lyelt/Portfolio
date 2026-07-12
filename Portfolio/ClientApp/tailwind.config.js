const colors = require('tailwindcss/colors')

const gray = {
  ...colors.slate,
  800: '#252c3b',
  900: '#202634',
  950: '#171b24',
}

const indigo = {
  ...colors.indigo,
  700: '#5152a6',
  800: '#444487',
  900: '#393970',
}

const pink = {
  ...colors.pink,
  700: '#a53b69',
  800: '#843653',
  900: '#6b3047',
}

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
        gray,
        darkGray: colors.gray,
        indigo,
        pink,
        white: colors.white,
        black: colors.black,
        red: colors.red,
        green: colors.green,
        yellow: colors.yellow,
        blue: colors.blue,
        orange: colors.orange
      },
      extend: {
        fontFamily: {
          sans: ['Raleway', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        },
        boxShadow: {
          soft: '0 18px 45px -24px rgba(30, 41, 59, 0.32)',
        },
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
