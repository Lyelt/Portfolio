const colors = require('tailwindcss/colors')

module.exports = {
    prefix: '',
    purge: {
      content: [
        './src/**/*.{html,ts}',
      ]
    },
    darkMode: 'class',
    theme: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        gray: colors.blueGray,
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
        }
      },
     
    },
    variants: {
      extend: {
        borderWidth: ['responsive', 'hover', 'focus', 'active', 'group-hover', 'last', 'first'],
        borderStyle: ['responsive', 'hover', 'focus', 'active', 'group-hover', 'last', 'first'],
        borderColor: ['responsive', 'hover', 'focus', 'active', 'group-hover', 'last', 'first', 'dark'],
        backgroundColor: ['responsive', 'hover', 'focus', 'odd', 'even', 'dark'],
        margin: ['responsive', 'first', 'last'],
        transitionProperty: ['hover', 'focus'],
        transitionTimingFunction: ['hover', 'focus'],
        transitionDuration: ['hover', 'focus'],
        opacity: ['disabled'],
        pointerEvents: ['disabled'],
      }
    },
  plugins: [
    require('@tailwindcss/forms')
  ],
};
