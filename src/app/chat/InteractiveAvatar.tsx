import { Box, Card, CardActions, CardContent, Divider } from '@mui/material'
import Stack from '@mui/material/Stack'
import { useAssistant } from 'ai/react'
import { useRef, useState } from 'react'
import { ChatBox } from './ChatBox'
import HeyGenAvatarControls, { HeyGenAvatarControlsProps, HeyGenAvatarControlsValue } from './HeyGenAvatarControls'
import HeyGenAvatarStream, { HeyGenAvatarStreamHandle } from './HeyGenAvatarStream'

export default function InteractiveAvatar() {
	const [isStreaming, setIsStreaming] = useState<HeyGenAvatarControlsProps['isStreaming']>(false)
	const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
	const [avatarControlsValue, setAvatarControlsValue] = useState<HeyGenAvatarControlsValue>()
	const avatarStreamRef = useRef<HeyGenAvatarStreamHandle>(null)
	const { status, messages, append } = useAssistant({ api: '/api/assistant' })

	return (
		<Stack direction="row" m={4} spacing={4} justifyItems="stretch">
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
							append({
								role: 'user',
								content: value,
							})

							// chat.send(completedTranscription).then((messages) => {
							// 	avatarStreamRef.current?.speak(messages.join('\n'))
							// 	setAvatarResponses(messages)
							// })
						}}
					/>
				</CardActions>
			</Card>

			<Box sx={{ width: '50%' }}>
				<HeyGenAvatarStream
					ref={avatarStreamRef}
					avatarId={avatarControlsValue?.avatarId}
					voiceId={avatarControlsValue?.voiceId}
					isStreaming={isStreaming}
					setIsSpeaking={setIsSpeaking}
				/>
			</Box>
		</Stack>
	)
}
