import { getAvatarStreamToken } from '@/app/api/getAvatarStreamToken'
import { Configuration, NewSessionData, StreamingAvatarApi } from '@heygen/streaming-avatar'
import { CircularProgress } from '@mui/material'
import { Dispatch, forwardRef, SetStateAction, useEffect, useImperativeHandle, useRef, useState } from 'react'

export type HeyGenAvatarStreamHandle = {
	speak: (dialog: string) => Promise<void>
	interrupt: () => Promise<void>
}

export type HeyGenAvatarStreamProps = {
	avatarId?: string
	voiceId?: string
	isStreaming?: boolean
	setIsSpeaking?: Dispatch<SetStateAction<boolean>>
}

export default forwardRef<HeyGenAvatarStreamHandle, HeyGenAvatarStreamProps>(function HeyGenAvatarStream(
	{ avatarId, voiceId, isStreaming, setIsSpeaking }: HeyGenAvatarStreamProps,
	ref,
) {
	const [isLoading, setIsLoading] = useState(false)
	const [stream, setStream] = useState<MediaStream>()
	const videoRef = useRef<HTMLVideoElement>(null)
	const avatarRef = useRef<StreamingAvatarApi | null>(null)
	const sessionDataRef = useRef<NewSessionData | null>(null)
	const initializedRef = useRef<boolean>(false)

	// TODO correctly restart session when avatarId or voiceId change
	useEffect(() => {
		async function updateToken() {
			const newToken = await getAvatarStreamToken()
			console.log('Initializing HeyGen avatar stream with Access Token:', newToken)
			avatarRef.current = new StreamingAvatarApi(new Configuration({ accessToken: newToken, jitterBuffer: 200 }))

			const startTalkCallback = (event: Event) => {
				console.log('Avatar started talking', event)
			}

			const stopTalkCallback = (event: Event) => {
				console.log('Avatar stopped talking', event)
			}

			console.log('Adding event handlers:', avatarRef.current)
			avatarRef.current.addEventHandler('avatar_start_talking', startTalkCallback)
			avatarRef.current.addEventHandler('avatar_stop_talking', stopTalkCallback)

			initializedRef.current = true
		}

		async function startSession() {
			setIsLoading(true)
			try {
				await updateToken()
				if (!initializedRef.current || !avatarRef.current) {
					console.debug(`Avatar API not initialized`)
					return
				}
				sessionDataRef.current = await avatarRef.current.createStartAvatar(
					{
						newSessionRequest: {
							quality: 'low',
							avatarName: avatarId,
							voice: { voiceId },
						},
					},
					console.debug,
				)
				setStream(avatarRef.current.mediaStream)
			} catch (error) {
				console.error('Error starting avatar session:', error)
				console.debug(
					`There was an error starting the session. ${voiceId ? 'This custom voice ID may not be supported.' : ''}`,
				)
			} finally {
				setIsLoading(false)
			}
		}

		async function endSession() {
			if (!initializedRef.current || !avatarRef.current) {
				console.debug(`Avatar API not initialized`)
				return
			}
			await avatarRef.current.stopAvatar(
				{ stopSessionRequest: { sessionId: sessionDataRef.current?.sessionId } },
				console.debug,
			)
			setStream(undefined)
		}

		if (isStreaming) {
			void startSession()
		} else {
			void endSession()
		}

		return () => {
			void endSession()
		}
	}, [avatarId, voiceId, isStreaming])

	useImperativeHandle(
		ref,
		() => ({
			speak: async (dialog: string) => {
				if (!initializedRef.current || !avatarRef.current) {
					console.debug(`Avatar API not initialized`)
					return
				}
				setIsSpeaking?.(true)
				try {
					await avatarRef.current.speak({ taskRequest: { text: dialog, sessionId: sessionDataRef.current?.sessionId } })
				} catch (error) {
					console.error(error)
				}
				setIsSpeaking?.(false)
			},
			interrupt: async () => {
				if (!initializedRef.current || !avatarRef.current) {
					console.debug(`Avatar API not initialized`)
					return
				}
				try {
					await avatarRef.current.interrupt({ interruptRequest: { sessionId: sessionDataRef.current?.sessionId } })
				} catch (error) {
					console.error(error)
				}
				setIsSpeaking?.(false)
			},
		}),
		[setIsSpeaking],
	)

	useEffect(() => {
		if (stream && videoRef.current) {
			videoRef.current.onloadedmetadata = () => {
				void videoRef.current?.play()
			}
			videoRef.current.srcObject = stream
		}
	}, [videoRef, stream])

	return (
		<div>
			{isLoading ? (
				<CircularProgress color="primary" />
			) : (
				<video
					ref={videoRef}
					autoPlay
					playsInline
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'contain',
					}}
				>
					<track kind="captions" />
				</video>
			)}
		</div>
	)
})
