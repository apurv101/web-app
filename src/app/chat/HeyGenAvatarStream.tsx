import { getAvatarStreamToken } from '@/app/api/getAvatarStreamToken'
import StreamingAvatar, { AvatarQuality, StreamingEvents, TaskType, VoiceEmotion } from '@heygen/streaming-avatar'
import { CircularProgress } from '@mui/material'
import {
	Dispatch,
	forwardRef,
	SetStateAction,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react'
import ChromaKeyVideo, { ChromeKeyVideoHandle } from './ChromaKeyVideo'

export type HeyGenAvatarStreamHandle = {
	speak: (dialog: string) => Promise<void>
	interrupt: () => Promise<void>
}

export type HeyGenAvatarStreamProps = {
	avatarId?: string
	voiceId?: string
	isStreaming?: boolean
	setIsStreaming?: Dispatch<SetStateAction<boolean>>
	setIsAvatarTalking?: Dispatch<SetStateAction<boolean>>
	setIsUserTalking?: Dispatch<SetStateAction<boolean>>
}

export default forwardRef<HeyGenAvatarStreamHandle, HeyGenAvatarStreamProps>(function HeyGenAvatarStream(
	{ avatarId, voiceId, isStreaming, setIsStreaming, setIsAvatarTalking, setIsUserTalking }: HeyGenAvatarStreamProps,
	ref,
) {
	const [isLoadingSession, setIsLoadingSession] = useState(false)
	const [_isLoadingRepeat, setIsLoadingRepeat] = useState(false)
	const [stream, setStream] = useState<MediaStream | null>(null)

	const chromaKeyVideoRef = useRef<ChromeKeyVideoHandle>(null)
	const avatarRef = useRef<StreamingAvatar | null>(null)

	// TODO correctly restart session when avatarId or voiceId change

	const endSession = useCallback(async () => {
		await avatarRef.current?.stopAvatar()
		setStream(null)
	}, [])

	const startSession = useCallback(async () => {
		if (!avatarId) {
			throw new Error('avatarId is required to start a session')
		}

		setIsLoadingSession(true)
		const newToken = await getAvatarStreamToken() // TODO should an error return an empty string?

		// TODO does any existing stream get killed when a new one is created? Like when avatarId changes?
		avatarRef.current = new StreamingAvatar({
			token: newToken,
		})
		avatarRef.current.on(StreamingEvents.STREAM_READY, (event: unknown) => {
			if (typeof event === 'object' && event !== null && 'detail' in event && event.detail instanceof MediaStream) {
				console.log('Stream ready:', event.detail)
				setStream(event.detail)
			} else {
				throw new Error(`Invalid event type "${typeof event}". Expected { detail: MediaStream }`)
			}
		})
		avatarRef.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
			console.log('Stream disconnected')
			void endSession()
		})
		avatarRef.current.on(StreamingEvents.AVATAR_START_TALKING, (event) => {
			console.log('Avatar started talking:', event)
			setIsAvatarTalking?.(true)
		})
		avatarRef.current.on(StreamingEvents.AVATAR_STOP_TALKING, (event) => {
			console.log('Avatar stopped talking:', event)
			setIsAvatarTalking?.(false)
		})
		avatarRef.current.on(StreamingEvents.USER_START, (event) => {
			console.log('User started talking:', event)
			setIsUserTalking?.(true)
		})
		avatarRef.current.on(StreamingEvents.USER_STOP, (event) => {
			console.log('User stopped talking:', event)
			setIsUserTalking?.(false)
		})

		try {
			await avatarRef.current.createStartAvatar({
				quality: AvatarQuality.High,
				avatarName: avatarId,
				voice: {
					voiceId,
					rate: 1.5, // 0.5 ~ 1.5
					emotion: VoiceEmotion.EXCITED,
				},
			})
		} catch (error) {
			console.error('Error starting avatar session:', error)
		} finally {
			setIsLoadingSession(false)
		}
	}, [avatarId, voiceId, endSession, setIsAvatarTalking, setIsUserTalking])

	// start and stop the stream via prop
	// stop stream on dismount
	useEffect(() => {
		if (isStreaming) {
			void startSession().catch(() => {
				setIsStreaming?.(false)
			})
		} else {
			void endSession()
		}

		return () => {
			void endSession()
		}
	}, [isStreaming, setIsStreaming, startSession, endSession])

	// attatch the stream to the video element
	useEffect(() => {
		chromaKeyVideoRef.current?.setStream(stream)
	}, [stream])

	useImperativeHandle(
		ref,
		() => ({
			speak: async (dialog: string) => {
				if (!avatarRef.current) return
				setIsLoadingRepeat(true)
				await avatarRef.current.speak({ text: dialog, task_type: TaskType.REPEAT })
				setIsLoadingRepeat(false)
			},
			interrupt: async () => {
				if (!avatarRef.current) return
				await avatarRef.current.interrupt()
			},
		}),
		[],
	)

	return (
		<div>
			{isLoadingSession ? (
				<CircularProgress color="primary" />
			) : (
				<ChromaKeyVideo
					ref={chromaKeyVideoRef}
					autoPlay
					playsInline
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'contain',
					}}
				></ChromaKeyVideo>
			)}
		</div>
	)
})
