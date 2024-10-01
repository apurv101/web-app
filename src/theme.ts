'use client'
import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import { Roboto } from 'next/font/google'

const moneyGreen = '#2ace7b'
const purple = 'rgb(42, 24, 43)'

const roboto = Roboto({
	weight: ['300', '400', '500', '700'],
	subsets: ['latin'],
	display: 'swap',
})

const theme = createTheme({
	palette: {
		primary: { main: purple },
		secondary: { main: moneyGreen },
	},
	typography: {
		fontFamily: roboto.style.fontFamily,
	},
})

export default responsiveFontSizes(theme)
