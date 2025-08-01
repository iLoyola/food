/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

export default {
    content: [
        './index.html',
        './src/**/*.{vue,js,ts,jsx,tsx}',
        './node_modules/flowbite/**/*.js'
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter var', ...defaultTheme.fontFamily.sans],
            },
            spacing: {
                '128': '32rem',
                '144': '36rem',
            },
            borderRadius: {
                '4xl': '2rem',
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
            'damask': {
                '100': '#f9f0eb',
                '200': '#eed3c4',
                '300': '#e2b69d',
                '400': '#d69975',
                '500': '#CB7D4F',
                '600': '#b16334',
                '700': '#8a4d29',
                '800': '#62371d',
                '900': '#3b2111',
                '1000': '#140b06',
            }
        }
    },
    darkMode: 'selector',
    plugins: [
        require('flowbite/plugin'),
        require('@tailwindcss/forms'),
    ],
}

