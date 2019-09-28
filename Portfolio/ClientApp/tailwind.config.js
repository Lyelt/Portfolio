module.exports = {
  theme: {
    extend: {
      zIndex: {
        '999': 999
      },
      flexGrow: {
        '1/2': 1/2
      },
      fontSize: {
        '2xs': '.5rem',
        '3xs': '.25rem'
      }
    }
  },
  variants: {
    borderColor: ['responsive', 'hover', 'focus', 'active', 'group-hover'],
    backgroundColor: ['responsive', 'hover', 'focus', 'odd', 'even']
  },
  plugins: [
    require('@tailwindcss/custom-forms'),
    require('glhd-tailwindcss-transitions')()
  ]
};
