import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, VideoHTMLAttributes } from 'react'

const isCloseToGreen = (color: number[]) => {
	const [red, green, blue] = color
	// default background color of heygen avatarts: rgb(101,216,65)
	const th = 90 // Adjust the threshold values for green detection
	return green > th && red < th && blue < th
}

export type ChromeKeyVideoHandle = {
	setStream: (newStream: MediaStream | null) => void
	video: HTMLVideoElement | null
	canvas: HTMLCanvasElement | null
}

export type ChromeKeyVideoProps = VideoHTMLAttributes<HTMLVideoElement> & {}

export default forwardRef(function ChromaKeyVideo(props: ChromeKeyVideoProps, ref) {
	const { style, ...propsRest } = props
	const videoRef = useRef<HTMLVideoElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const animationFrameRef = useRef<number>(0)

	const startChromaKey = useCallback(() => {
		const video = videoRef.current
		const canvas = canvasRef.current
		if (!canvas || !video) return
		const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true })
		if (!ctx) return

		canvas.width = video.videoWidth
		canvas.height = video.videoHeight

		ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
		const data = imageData.data

		for (let i = 0; i < data.length; i += 4) {
			const red = data[i]
			const green = data[i + 1]
			const blue = data[i + 2]

			if (isCloseToGreen([red, green, blue])) {
				data[i + 3] = 0 // Set alpha channel to 0 (transparent)
			}
		}

		ctx.putImageData(imageData, 0, 0)

		animationFrameRef.current = requestAnimationFrame(startChromaKey) // Return the request ID
	}, [])

	const stopChromaKey = () => {
		cancelAnimationFrame(animationFrameRef.current)
		animationFrameRef.current = 0
	}

	useEffect(() => {
		// cancel animation frame on unmount
		return stopChromaKey
	}, [])

	useImperativeHandle(
		ref,
		() =>
			({
				/**
				 * Sets the stream on the hidden video element and starts the chroma key filter
				 */
				setStream(newStream) {
					stopChromaKey()
					if (videoRef.current) {
						videoRef.current.onloadedmetadata = () => {
							if (videoRef.current?.srcObject) {
								void videoRef.current.play()
								startChromaKey()
							}
						}
						videoRef.current.srcObject = newStream
					}
				},
				/**
				 * ref to the hidden video element
				 */
				get video() {
					return videoRef.current
				},
				/**
				 * ref to the canvas element
				 */
				get canvas() {
					return canvasRef.current
				},
			}) satisfies ChromeKeyVideoHandle,
		[startChromaKey],
	)

	return (
		<div>
			<video
				ref={videoRef}
				{...propsRest}
				style={{
					...style,
					display: 'none',
				}}
			></video>
			<canvas ref={canvasRef} style={style}></canvas>
		</div>
	)
})
