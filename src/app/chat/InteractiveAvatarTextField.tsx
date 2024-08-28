import SendIcon from '@mui/icons-material/Send'
import { IconButton, InputAdornment, Tooltip } from '@mui/material'
import OpenAITranscriptionTextField, { OpenAITranscriptionTextFieldProps } from './OpenAITranscriptionTextField'

type InteractiveAvatarTextFieldProps = OpenAITranscriptionTextFieldProps & {
	onSend?: () => void
	sendDisabled?: boolean
}

export default function InteractiveAvatarTextField({
	onSend,
	sendDisabled = false,
	...props
}: InteractiveAvatarTextFieldProps) {
	function handleSend() {
		if (typeof props.value === 'string' && props.value.trim() === '') {
			return
		}
		onSend?.()
	}

	const sendIconButtonLabel = 'Send message'

	return (
		<OpenAITranscriptionTextField
			{...props}
			onKeyDown={(e) => {
				if (e.key === 'Enter') {
					e.preventDefault()
					handleSend()
				} else {
					props.onKeyDown?.(e)
				}
			}}
			InputProps={{
				endAdornment: (
					<InputAdornment position="end">
						<Tooltip title={sendIconButtonLabel}>
							<span>
								<IconButton
									aria-label={sendIconButtonLabel}
									onClick={handleSend}
									edge="end"
									disabled={props.disabled || sendDisabled}
								>
									<SendIcon />
								</IconButton>
							</span>
						</Tooltip>
					</InputAdornment>
				),
			}}
		/>
	)
}
