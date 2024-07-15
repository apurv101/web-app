'use client'
import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import { Roboto } from 'next/font/google'

const roboto = Roboto({
	weight: ['300', '400', '500', '700'],
	subsets: ['latin'],
	display: 'swap',
})

const theme = createTheme({
	palette: {
		primary: { main: 'rgb(42, 24, 43)' },
	},
	typography: {
		fontFamily: roboto.style.fontFamily,
	},
})

export default responsiveFontSizes(theme)
