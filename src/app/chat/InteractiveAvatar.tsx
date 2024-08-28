import { Box, Card, CardActions, CardContent, Divider } from '@mui/material'
import Stack from '@mui/material/Stack'
import { useRef, useState } from 'react'
import HeyGenAvatarControls, { HeyGenAvatarControlsProps, HeyGenAvatarControlsValue } from './HeyGenAvatarControls'
import HeyGenAvatarStream, { HeyGenAvatarStreamHandle } from './HeyGenAvatarStream'
import InteractiveAvatarTextField from './InteractiveAvatarTextField'

export default function InteractiveAvatar() {
	const [isStreaming, setIsStreaming] = useState<HeyGenAvatarControlsProps['isStreaming']>(false)
	const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
	const [avatarControlsValue, setAvatarControlsValue] = useState<HeyGenAvatarControlsValue>()
	const [text, setText] = useState<string>('')
	const avatarStreamRef = useRef<HeyGenAvatarStreamHandle>(null)

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
					<Stack spacing={2} direction="column" sx={{ width: '100%' }}>
						<InteractiveAvatarTextField
							fullWidth
							multiline
							label="Repeat"
							placeholder="Type something for the avatar to repeat"
							value={text}
							onSend={() => {
								avatarStreamRef.current?.speak(text)
								setText('')
							}}
							onChange={(event) => {
								setText(event.target.value)
							}}
							onTranscription={(transcription) => {
								// TODO see if the entire text could be included in the transcription
								setText((text) => text.trim() + ' ' + transcription)
							}}
							disabled={!isStreaming || isSpeaking}
						/>
					</Stack>
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
