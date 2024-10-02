import { UseAssistantHelpers } from '@ai-sdk/react'
import { Stack } from '@mui/material'
import { useState } from 'react'
import InteractiveAvatarTextField from './InteractiveAvatarTextField'
import MessageHistory from './MessageHistory'

export type ChatBoxProps = Pick<UseAssistantHelpers, 'status' | 'messages'> & {
	disabled?: boolean
	onSend?: (value: string) => void
}

export function ChatBox({ status, messages, disabled, onSend }: ChatBoxProps) {
	const [completedTranscription, setCompletedTranscription] = useState<string>('')
	const [interimTranscription, setInterimTranscription] = useState<string>('')

	let value = completedTranscription
	if (interimTranscription) {
		value += ' ' + interimTranscription
	}

	return (
		<Stack direction="column" sx={{ width: '100%' }}>
			{/* TODO add bottom padding */}
			<MessageHistory messages={messages} />
			<InteractiveAvatarTextField
				fullWidth
				multiline
				placeholder="Talk to Aimy"
				value={value}
				onSend={() => {
					onSend?.(completedTranscription)
					setCompletedTranscription('')
					setInterimTranscription('')
				}}
				onChange={(event) => {
					// this is called when the user types in the text field
					// TODO stop transcription after typing or disable typing when transcribing
					setCompletedTranscription(event.target.value)
					setInterimTranscription('')
				}}
				onTranscription={(transcription, status) => {
					// TODO see if the entire text could be included in the transcription
					if (status == 'complete') {
						setCompletedTranscription((completedTranscription) => {
							const trimmed = completedTranscription.trim()
							return trimmed ? trimmed + ' ' + transcription : transcription
						})
						setInterimTranscription('')
					} else {
						setInterimTranscription(transcription)
					}
				}}
				disabled={!!disabled || status !== 'awaiting_message'}
			/>
		</Stack>
	)
}
