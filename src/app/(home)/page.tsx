'use client'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Card, CardContent, Divider } from '@mui/material'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import Image, { StaticImageData } from 'next/image'
import { ReactNode } from 'react'

import FlowImage from './_images/flow.png'
import HeroImage from './_images/hero.png'

import AwsLogo from './_images/logos/aws-logo.webp'
import OpenAiLogo from './_images/logos/openai-logo.png'
import OutlookLogo from './_images/logos/outlook-logo.png'
import PythonLogo from './_images/logos/python-logo.png'
import ReactLogo from './_images/logos/react-logo.png'
import TeamsLogo from './_images/logos/teams-logo.png'

export default function Home() {
	return (
		<Stack alignContent={'center'} style={{ backgroundColor: 'white' }}>
			<HeroSection background={HeroImage.src}>
				{/* TODO add dynamic font sizes */}
				{/* TODO add media queries for font size*/}
				<Typography
					variant="h1"
					sx={{
						borderColor: 'rgb(255, 193, 7)',
						boxShadow: '0 0 40px rgba(248, 165, 113, 0.5)',
						borderRadius: '20px',
						borderWidth: '3px',
						borderStyle: 'solid',
						width: '100%',
						textAlign: 'center',
						py: 8,
					}}
				>
					Meet Aimy
				</Typography>
				<Typography variant="h3" sx={{ my: 2 }}>
					Real AI for Advanced AP
				</Typography>
				<Typography variant="h5" align="center" sx={{ mt: 6 }}>
					The Aimyable AI Clerk (Aimy) is an essential addition to your payables team. While Aimy can enter invoices,
					match, approve, code, and resolve exceptions, her main strength is her ability to communicate with other
					employees and suppliers.
				</Typography>
			</HeroSection>

			<Container maxWidth="lg">
				<Stack justifyContent={'center'} alignItems={'center'} textAlign={'center'} my={10}>
					<Grid container spacing={4} columns={{ xs: 2, sm: 2, md: 3, lg: 6 }}>
						<Logo src={AwsLogo} alt="Aws Logo" />
						<Logo src={OpenAiLogo} alt="OpenAi Logo" />
						<Logo src={OutlookLogo} alt="Outlook Logo" />
						<Logo src={PythonLogo} alt="Python Logo" />
						<Logo src={ReactLogo} alt="React Logo" />
						<Logo src={TeamsLogo} alt="Teams Logo" />
					</Grid>

					<Typography variant="h3" sx={{ color: 'rgb(255, 193, 7)', my: 4 }}>
						Next Level Integration of AI with AP
					</Typography>

					<Grid container spacing={4} columns={{ xs: 1, sm: 2, md: 4 }}>
						<InfoCard
							title="Seeking Early Adopters!"
							body="Interested in bleeding edge technology? If you're in Europe, we'd love to have you as a beta tester of Aimy!"
						/>
						<InfoCard
							title="Works with any AP system"
							body="No technical implementation required. Aimy can use a workstation like any other clerk."
						/>
						<InfoCard
							title="Real Communication"
							body="Phone, videocall, email, or chat. Aimy will initiate and respond to conversations with your team and suppliers."
						/>
						<InfoCard
							title="Your Company, Your Processes"
							body="You define the processes and controls specific to your organization and Aimy abides by them."
						/>
					</Grid>
				</Stack>
			</Container>

			<HeroSection background={FlowImage.src}>
				<Typography variant="h5" align="center">
					To enhance the accounts payable experience with artificial intelligence while maintaining the culture and
					value of great payables teams
				</Typography>
				<Divider flexItem sx={{ borderColor: 'white', my: 2 }} />
				<Typography variant="h3">Our Mission and Vision</Typography>
			</HeroSection>
		</Stack>
	)
}

function HeroSection({ background, children }: { background: string; children: ReactNode }) {
	return (
		<Box
			color="white"
			textAlign={'center'}
			sx={{
				position: 'relative',
				backgroundImage: `url(${background})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				display: 'grid',
				'& > *': {
					gridArea: '1 / 1',
				},
				'&:before': {
					content: '""',
					gridArea: '1 / 1',
					width: '100%',
					height: '100%',
					background: 'rgba(42, 24, 43, 0.5)',
				},
			}}
		>
			<Container maxWidth="lg">
				<Stack justifyContent={'center'} alignItems={'center'} my={4} py={{ xs: 2, md: 4, lg: 16 }}>
					{children}
				</Stack>
			</Container>
		</Box>
	)
}

function Logo({ src, alt }: { src: StaticImageData; alt: string }) {
	return (
		<Grid xs={1} display={'flex'} justifyContent={'center'} alignItems={'center'} px={{ xs: 4, sm: 8, lg: 3 }}>
			<Image
				src={src}
				alt={alt}
				style={{
					width: '100%',
					height: 'auto',
					objectFit: 'contain',
				}}
			/>
		</Grid>
	)
}

function InfoCard({ title, body }: { title: string; body: string }) {
	return (
		<Grid xs={1}>
			<Card elevation={4} sx={{ height: '100%' }}>
				<CardContent
					sx={{
						height: '100%',
						justifyContent: 'space-between',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						textAlign: 'center',
					}}
				>
					<CheckCircleIcon fontSize="large" sx={{ color: 'rgb(248, 165, 113)' }} />
					<Typography fontSize={'1.5em'} fontWeight={'bold'} my={1.5}>
						{title}
					</Typography>
					<Typography variant="body1">{body}</Typography>
				</CardContent>
			</Card>
		</Grid>
	)
}
