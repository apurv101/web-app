import { getTranscription } from '@/api/get-transcription'
import { keyframes } from '@emotion/react'
import GraphicEqIcon from '@mui/icons-material/GraphicEq'
import MicIcon from '@mui/icons-material/Mic'
import { Box, IconButton, InputAdornment, TextField, TextFieldProps, Tooltip } from '@mui/material'
import { Fragment, useRef, useState } from 'react'

// TODOs
// see if there is an audio streaming option so it will make corrections as it gets more context
// make it turn off after not hearing anything for a while
// make an option to pin the mic open so it will keep listening
// add trigger for sending transcription to gpt after a moment of silence

const spinAnim = keyframes`
  from {
    transform: rotateY(0deg);
  }

  to {
    transform: rotateY(360deg);
  }
`

export type OpenAITranscriptionTextFieldProps = TextFieldProps & {
	onTranscription?: (transcription: string) => void
}

export default function OpenAITranscriptionTextField({ onTranscription, ...props }: OpenAITranscriptionTextFieldProps) {
	const [recording, setRecording] = useState(false) // Track recording state
	const [transcribing, setTranscribing] = useState(false)
	const mediaRecorder = useRef<MediaRecorder | null>(null)
	const audioChunks = useRef<Blob[]>([])

	function startRecording() {
		navigator.mediaDevices
			.getUserMedia({ audio: true })
			.then((stream) => {
				mediaRecorder.current = new MediaRecorder(stream)
				mediaRecorder.current.ondataavailable = (event) => {
					audioChunks.current.push(event.data)
				}
				mediaRecorder.current.onstop = () => {
					const audioBlob = new Blob(audioChunks.current, {
						type: 'audio/wav',
					})
					audioChunks.current = []
					transcribeAudio(audioBlob)
				}
				mediaRecorder.current.start()
				setRecording(true)
			})
			.catch((error) => {
				console.error('Error accessing microphone:', error)
			})
	}

	function stopRecording() {
		if (mediaRecorder.current) {
			mediaRecorder.current.stop()
			setRecording(false)
		}
	}

	async function transcribeAudio(audioBlob: Blob) {
		try {
			setTranscribing(true)
			// Convert Blob to File
			const audioFile = new File([audioBlob], 'recording.wav', {
				type: 'audio/wav',
			})
			const transcription = await getTranscription(audioFile)
			console.log('Transcription: ', transcription)
			// append transcription to current value
			onTranscription?.(transcription)
		} catch (error) {
			console.error('Error transcribing audio:', error)
		} finally {
			setTranscribing(false)
		}
	}

	const micIconButtonLabel = !recording ? 'Start recording' : 'Stop recording'

	return (
		<TextField
			{...props}
			InputProps={{
				...props.InputProps,
				endAdornment: (
					<Fragment>
						<InputAdornment position="end">
							<Tooltip title={micIconButtonLabel}>
								<span>
									<IconButton
										aria-label={micIconButtonLabel}
										onClick={!recording ? startRecording : stopRecording}
										edge="end"
										disabled={props.disabled || transcribing}
									>
										{!recording ? (
											<MicIcon />
										) : (
											<Box
												sx={{
													animation: `${spinAnim} 1s ease infinite`,
												}}
											>
												<GraphicEqIcon />
											</Box>
										)}
									</IconButton>
								</span>
							</Tooltip>
						</InputAdornment>

						{props.InputProps?.endAdornment}
					</Fragment>
				),
			}}
		/>
	)
}
