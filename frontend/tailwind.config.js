/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": '#0078D4',
                "primary-dark": '#004578',
                "neutral": "#d6d6d6",
                "neutral-primary": "#323130",
                "neutral-light": "#e3e3e3",
                "neutral-dark": "#adadad",
                themePrimary: '#0392ff',
                themeLighterAlt: '#00060a',
                themeLighter: '#001729',
                themeLight: '#012c4d',
                themeTertiary: '#025799',
                themeSecondary: '#0280e0',
                themeDarkAlt: '#1c9dff',
                themeDark: '#3facff',
                themeDarker: '#72c2ff',
                neutralLighterAlt: '#323232',
                neutralLighter: '#3a3a3a',
                neutralLight: '#484848',
                neutralQuaternaryAlt: '#505050',
                neutralQuaternary: '#575757',
                neutralTertiaryAlt: '#747474',
                neutralTertiary: '#ececec',
                neutralSecondary: '#efefef',
                neutralPrimaryAlt: '#f2f2f2',
                neutralPrimary: '#e3e3e3',
                neutralDark: '#f9f9f9',
            }
        },
        // height: {
		// 	"10v": "10vh",
		// 	"20v": "20vh",
		// 	"30v": "30vh",
		// 	"40v": "40vh",
		// 	"50v": "50vh",
		// 	"60v": "60vh",
		// 	"70v": "70vh",
		// 	"80v": "80vh",
		// 	"90v": "90vh",
		// 	"100v": "100vh",
		// },
    },
    plugins: [require('@tailwindcss/typography')],
}

