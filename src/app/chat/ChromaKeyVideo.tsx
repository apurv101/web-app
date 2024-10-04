import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, VideoHTMLAttributes } from 'react'

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
			const currColor = new Array<number>(4)
			currColor[0] = data[i + 0]
			currColor[1] = data[i + 1]
			currColor[2] = data[i + 2]
			currColor[3] = data[i + 3]

			const newColor = filterGreen(currColor)

			data[i + 0] = newColor[0]
			data[i + 1] = newColor[1]
			data[i + 2] = newColor[2]
			data[i + 3] = newColor[3]
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

function RGBtoHSL(r: number, g: number, b: number) {
	// Make r, g, and b fractions of 1
	const rf = r / 255
	const gf = g / 255
	const bf = b / 255

	// Find greatest and smallest channel values
	const cmin = Math.min(rf, gf, bf)
	const cmax = Math.max(rf, gf, bf)
	const delta = cmax - cmin
	let h = 0
	let s = 0
	let l = 0

	// Calculate hue
	// No difference
	if (delta == 0) h = 0
	// Red is max
	else if (cmax == rf) h = ((gf - bf) / delta) % 6
	// Green is max
	else if (cmax == gf) h = (bf - rf) / delta + 2
	// Blue is max
	else h = (rf - gf) / delta + 4

	h = Math.round(h * 60)

	// Make negative hues positive behind 360°
	if (h < 0) h += 360

	// Calculate lightness
	l = (cmax + cmin) / 2

	// Calculate saturation
	s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

	return [h, s, l]
}

function HSLtoRGB(h: number, s: number, l: number) {
	const c = (1 - Math.abs(2 * l - 1)) * s
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
	const m = l - c / 2
	let r = 0
	let g = 0
	let b = 0

	if (0 <= h && h < 60) {
		r = c
		g = x
		b = 0
	} else if (60 <= h && h < 120) {
		r = x
		g = c
		b = 0
	} else if (120 <= h && h < 180) {
		r = 0
		g = c
		b = x
	} else if (180 <= h && h < 240) {
		r = 0
		g = x
		b = c
	} else if (240 <= h && h < 300) {
		r = x
		g = 0
		b = c
	} else if (300 <= h && h < 360) {
		r = c
		g = 0
		b = x
	}
	r = Math.round((r + m) * 255)
	g = Math.round((g + m) * 255)
	b = Math.round((b + m) * 255)

	return [r, g, b]
}

const filterGreen = (color: number[]) => {
	// eslint-disable-next-line prefer-const
	let [r, g, b, a] = color

	// for efficiency, do a basic check with RGB

	const th = 90 // Adjust the threshold values for green detection
	if (g > th && r < th && b < th) {
		return [r, g, b, 0]
	}

	// if that passes, do a more accurate check with HSL

	// eslint-disable-next-line prefer-const
	let [h, s, l] = RGBtoHSL(r, g, b)

	if (s > 0.15) {
		// collor is very strong
		if (115 < h && h < 125) {
			// h is in green range
			a = 0 // make it transparent
		} else if (60 < h && h < 180) {
			// h is a little green (this is likely a "halo" pixel)
			s = 0.025 // desaturate to make it less green
			a = 0.5 // make it translucent to lazy antialias because it is likely on the edge
		}
	}

	const filteredColor = HSLtoRGB(h, s, l)
	filteredColor.push(a)

	return filteredColor
}
