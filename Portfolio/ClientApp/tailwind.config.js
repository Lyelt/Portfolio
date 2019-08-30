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
  variants: {},
  plugins: [
    require('@tailwindcss/custom-forms')
  ]
};
