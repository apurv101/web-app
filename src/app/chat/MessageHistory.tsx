import aimyableIcon from '@/../public/aimyable-icon.svg'
import Markdown from '@/components/Markdown'
import { Avatar, Box, Card, Stack, Typography } from '@mui/material'
import { CreateMessage, Message } from 'ai'
import { StaticImageData } from 'next/image'
import { BottomScroller } from './BottomScroller'

export type MessageHistoryProps = {
	messages: (Message | CreateMessage)[]
}

export default function MessageHistory({ messages }: MessageHistoryProps) {
	return (
		<div style={{ height: '200px' }}>
			<BottomScroller heightDeps={[messages.length]}>
				<Stack direction={'column'} spacing={1} py={1}>
					{messages.map((m) => {
						const isUser = m.role === 'user'
						return (
							<Box
								key={m.id}
								sx={{
									display: 'grid',
									gridTemplateColumns: 'min-content auto',
									gridTemplateRows: 'auto',
									gridTemplateAreas: `". date"
												"avatar message"`,
									columnGap: (theme) => (isUser ? 0 : theme.spacing(1)),
									px: 1,
									maxWidth: '80%',
									alignSelf: isUser ? 'end' : 'start',
								}}
							>
								<Typography sx={{ gridArea: 'date' }} variant="overline">
									{m.createdAt?.toLocaleDateString('en-us', {
										month: 'numeric',
										day: 'numeric',
										hour: 'numeric',
										minute: 'numeric',
									})}
								</Typography>
								{!isUser && (
									<Avatar
										sx={{ gridArea: 'avatar', border: (theme) => `solid 1px ${theme.palette.secondary.main}` }}
										src={(aimyableIcon as StaticImageData).src}
									></Avatar>
								)}
								<Card
									sx={{
										gridArea: 'message',
										p: 1,
										border: (theme) => `solid 1px ${isUser ? 'rgb(145, 162, 171)' : theme.palette.secondary.main}`,
										borderRadius: '10px',
									}}
								>
									{m.role === 'user' ? (
										m.content
									) : m.role === 'assistant' ? (
										<Markdown content={m.content} />
									) : (
										// TODO handle data responses more gracefully
										<pre className={'bg-gray-200'}>{JSON.stringify(m.data, null, 2)}</pre>
									)}
								</Card>
							</Box>
						)
					})}
				</Stack>
			</BottomScroller>
		</div>
	)
}
