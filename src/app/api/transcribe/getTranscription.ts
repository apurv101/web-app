'use client'

export async function getTranscription(audioFile: File) {
	const formData = new FormData()
	formData.append('audioFile', audioFile)

	const response = await fetch('/api/transcribe', {
		method: 'POST',
		body: formData,
	})

	const data: unknown = await response.json()
	if (typeof data !== 'string') {
		throw new Error(`Expected transcription response to be a string, instead found ${typeof data}`)
	}
	return data
}
