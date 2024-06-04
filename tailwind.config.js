/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

export default {
    purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    content: [],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter var', ...defaultTheme.fontFamily.sans],
            }
        },
        colors: {
            transparent: 'transparent',
            current: 'currentColor',
            white: '#ffffff',
            'firefly': {
                '50': '#f0fbfb',
                '100': '#d9f2f4',
                '200': '#b7e6ea',
                '300': '#85d2db',
                '400': '#4cb5c4',
                '500': '#3099aa',
                '600': '#2b7d8f',
                '700': '#296675',
                '800': '#295561',
                '900': '#264753',
                '950': '#132b34',
            },

        }
    },
    plugins: [],
}

