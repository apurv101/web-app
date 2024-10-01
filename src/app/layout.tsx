import { AppBar, Box, Container, Link, Stack, Toolbar, Typography } from '@mui/material'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import type { Metadata } from 'next'
import Image from 'next/image'
import { ReactNode } from 'react'
import aimyableLogo from '../../public/aimyable-logo.svg'
import theme from '../theme'

export const metadata: Metadata = {
	title: 'Aimyable',
	description: 'Next Level Integration of AI with AP',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode
}>) {
	return (
		<html lang="en">
			<body style={{ backgroundColor: 'rgb(42, 24, 43)' }}>
				<AppRouterCacheProvider options={{ enableCssLayer: true }}>
					<ThemeProvider theme={theme}>
						{/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
						<CssBaseline />

						<AppBar position="static">
							<Toolbar variant="regular" sx={{ justifyContent: 'center', py: 2 }}>
								<Image src={aimyableLogo} alt="Aimyable Logo" height={50} />
							</Toolbar>
						</AppBar>

						{children}

						<Box
							component={'footer'}
							color="whitesmoke"
							py={{ xs: 2, md: 4, lg: 16 }}
							sx={{
								background: 'radial-gradient(circle, rgba(2,0,36,1) 0%, rgba(42,24,43,1) 75%)',
							}}
						>
							<Container maxWidth="lg">
								<Stack flexDirection="row" justifyContent={'space-between'} alignItems={'end'}>
									<Typography>
										Aimyable Ltd
										<br />
										Lytchett House, 13 Freeland Park, Wareham Road, Poole, Dorset, BH16 6FA, UK
									</Typography>

									<Stack textAlign="right">
										<Link color="inherit" href="mailto:info@aimyable.com">
											info@aimyable.com
										</Link>
										<Typography color="inherit">Copyright © Aimyable {new Date().getFullYear()}</Typography>
									</Stack>
								</Stack>
							</Container>
						</Box>
					</ThemeProvider>
				</AppRouterCacheProvider>
			</body>
		</html>
	)
}
