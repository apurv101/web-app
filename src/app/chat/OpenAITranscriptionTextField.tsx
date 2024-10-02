import { getTranscription } from '@/app/api/transcribe/getTranscription'
import { keyframes } from '@emotion/react'
import GraphicEqIcon from '@mui/icons-material/GraphicEq'
import MicIcon from '@mui/icons-material/Mic'
import { CircularProgress, IconButton, InputAdornment, TextField, TextFieldProps, Tooltip } from '@mui/material'
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
	onTranscription?: (transcription: string, type: 'complete' | 'interim') => void
}

const STOP_DELAY = 1000
const RECORDING_INTERVAL = 500
const MIN_DECIBELS = -45

export default function OpenAITranscriptionTextField({ onTranscription, ...props }: OpenAITranscriptionTextFieldProps) {
	const [recording, setRecording] = useState(false)
	const [transcribing, setTranscribing] = useState(false)

	// store recording state in ref for use in transcribeAudio function
	// this is required because the instance of transcribeAudio is cached when startRecording is called
	const recordingRef = useRef(recording)
	recordingRef.current = recording

	const mediaRecorder = useRef<MediaRecorder | null>(null)
	const audioChunks = useRef<Blob[]>([])
	const stopTimeout = useRef<ReturnType<typeof setTimeout>>()
	const detectSoundAnimFrame = useRef<ReturnType<typeof requestAnimationFrame>>()
	const soundDetected = useRef<boolean>(false)

	// keep track of transcription requests
	const currTranscriptionRequestId = useRef<number>(0)
	const prevTranscriptionRequestId = useRef<number>(0)

	async function startRecording() {
		setRecording(true)

		let stream
		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true })
		} catch (error) {
			console.error('Error accessing microphone:', error)
			return
		}

		mediaRecorder.current = new MediaRecorder(stream)
		mediaRecorder.current.ondataavailable = (event) => {
			audioChunks.current.push(event.data)
			if (audioChunks.current.length > 4 && soundDetected.current) {
				void transcribeAudio('interim')
			}
		}

		const audioContext = new AudioContext()
		const analyser = audioContext.createAnalyser()
		analyser.minDecibels = MIN_DECIBELS
		const audioStreamSource = audioContext.createMediaStreamSource(stream)
		audioStreamSource.connect(analyser)

		const bufferLength = analyser.frequencyBinCount
		const domainData = new Uint8Array(bufferLength)

		const detectSound = () => {
			analyser.getByteFrequencyData(domainData)

			let localSoundDetected = false
			for (let i = 0; i < bufferLength; i++) {
				if (domainData[i] > 0) {
					localSoundDetected = true
					break
				}
			}

			// if sound detected, reset stop timer
			if (localSoundDetected) {
				soundDetected.current = true
				clearTimeout(stopTimeout.current)
				stopTimeout.current = setTimeout(() => {
					mediaRecorder.current?.stop()
				}, STOP_DELAY)
			}

			detectSoundAnimFrame.current = requestAnimationFrame(detectSound)
		}

		mediaRecorder.current.onstart = () => {
			// clear any previous recordings
			audioChunks.current = []
			soundDetected.current = false
			detectSoundAnimFrame.current = requestAnimationFrame(detectSound)
		}

		mediaRecorder.current.onstop = () => {
			clearTimeout(stopTimeout.current)
			stopTimeout.current = undefined
			if (detectSoundAnimFrame.current) {
				cancelAnimationFrame(detectSoundAnimFrame.current)
				detectSoundAnimFrame.current = undefined
			}
			if (soundDetected.current) {
				void transcribeAudio('complete')
			}
		}
		mediaRecorder.current.start(RECORDING_INTERVAL)
	}

	function stopRecording() {
		setRecording(false)
		mediaRecorder.current?.stop()
	}

	async function transcribeAudio(status: 'complete' | 'interim') {
		try {
			currTranscriptionRequestId.current += 1
			const localTranscriptionRequestId = currTranscriptionRequestId.current

			if (status === 'complete') {
				setTranscribing(true)
			}

			const audioBlob = new Blob(audioChunks.current, {
				type: 'audio/wav',
			})
			// Convert Blob to File
			const audioFile = new File([audioBlob], 'recording.wav', {
				type: 'audio/wav',
			})

			const transcription = await getTranscription(audioFile)

			// make sure this is the most recent response
			if (localTranscriptionRequestId > prevTranscriptionRequestId.current) {
				prevTranscriptionRequestId.current = localTranscriptionRequestId
				onTranscription?.(transcription, status)
			}
		} catch (error) {
			console.error('Error transcribing audio:', error)
		} finally {
			if (status === 'complete') {
				setTranscribing(false)
				if (recordingRef.current) {
					mediaRecorder.current?.start(RECORDING_INTERVAL)
				}
			}
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
										disabled={!!props.disabled || transcribing}
									>
										{transcribing ? (
											<CircularProgress size={24} />
										) : !recording ? (
											<MicIcon />
										) : (
											<GraphicEqIcon
												sx={{
													animation: `${spinAnim} 1s ease infinite`,
												}}
											/>
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
