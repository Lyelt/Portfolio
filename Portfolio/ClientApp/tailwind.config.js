module.exports = {
    theme: {
        extend: {
            zIndex: {
                '999': 999
            },
            flexGrow: {
                '1/2': 1 / 2
            },
            fontSize: {
                '2xs': '.5rem',
                '3xs': '.25rem'
            }
        }
    },
    variants: {
        borderWidth: ['responsive', 'hover', 'focus', 'active', 'group-hover', 'last', 'first'],
        borderStyle: ['responsive', 'hover', 'focus', 'active', 'group-hover', 'last', 'first'],
        borderColor: ['responsive', 'hover', 'focus', 'active', 'group-hover', 'last', 'first'],
        backgroundColor: ['responsive', 'hover', 'focus', 'odd', 'even'],
        margin: ['responsive', 'first', 'last']
    },
    plugins: [
        require('@tailwindcss/custom-forms'),
        require('glhd-tailwindcss-transitions')()
    ]
};
