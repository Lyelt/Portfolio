module.exports = {
  theme: {
    extend: {
      zIndex: {
        '999': 999
      },
      flexGrow: {
        '1/2': 1/2
      }
    }
  },
  variants: {
    borderColor: ['responsive', 'hover', 'focus', 'active', 'group-hover']
  },
  plugins: [
    require('@tailwindcss/custom-forms')
  ]
};
