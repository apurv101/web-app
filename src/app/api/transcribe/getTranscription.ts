'use client'

export async function getTranscription(audioFile: File) {
	const formData = new FormData()
	formData.append('audioFile', audioFile)

	const response = await fetch('/api/transcribe', {
		method: 'POST',
		body: formData,
	})

	const data = await response.json()
	return data
}
