import { Box, Card, CardActions, CardContent, Divider } from '@mui/material'
import Stack from '@mui/material/Stack'
import { useAssistant } from 'ai/react'
import { useEffect, useRef, useState } from 'react'
import { ChatBox } from './ChatBox'
import HeyGenAvatarControls, { HeyGenAvatarControlsValue } from './HeyGenAvatarControls'
import HeyGenAvatarStream, { HeyGenAvatarStreamHandle } from './HeyGenAvatarStream'

export default function InteractiveAvatar() {
	const [isStreaming, setIsStreaming] = useState<boolean>(false)
	const [isAvatarTalking, setIsAvatarTalking] = useState<boolean>(false)
	const [avatarControlsValue, setAvatarControlsValue] = useState<HeyGenAvatarControlsValue>({
		avatarId: '',
		voiceId: '',
	})
	const avatarStreamRef = useRef<HeyGenAvatarStreamHandle>(null)
	const { status, messages, append } = useAssistant({ api: '/api/assistant' })

	const messageCountRef = useRef<number>(0)

	// collect any new messages from the assistant and speak them
	useEffect(() => {
		if (status === 'awaiting_message') {
			const newMessages = messages.slice(messageCountRef.current)
			const newDialog = newMessages
				.filter((message) => message.role === 'assistant')
				.map((message) => message.content)
				.join('\n')

			if (newDialog) {
				void avatarStreamRef.current?.speak(newDialog)
			}
			messageCountRef.current = messages.length
		}
	}, [status, messages])

	return (
		<Stack direction="row" m={4} spacing={4} justifyItems="stretch">
			<Box sx={{ width: '50%' }}>
				<HeyGenAvatarStream
					ref={avatarStreamRef}
					avatarId={avatarControlsValue.avatarId}
					voiceId={avatarControlsValue.voiceId}
					isStreaming={isStreaming}
					setIsStreaming={setIsStreaming}
					setIsAvatarTalking={setIsAvatarTalking}
				/>
			</Box>

			<Card sx={{ width: '50%' }}>
				<CardContent>
					<HeyGenAvatarControls
						avatarStreamRef={avatarStreamRef}
						value={avatarControlsValue}
						onChange={setAvatarControlsValue}
						isStreaming={isStreaming}
						setIsStreaming={setIsStreaming}
					/>
				</CardContent>
				<Divider />
				<CardActions>
					<ChatBox
						status={status}
						messages={messages}
						onSend={(value) => {
							void append({
								role: 'user',
								content: value,
							})
						}}
						disabled={isAvatarTalking}
					/>
				</CardActions>
			</Card>
		</Stack>
	)
}
