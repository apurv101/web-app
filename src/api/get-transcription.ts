'use client'

import { api, failIfNotOk } from '@/api/common'

export async function getTranscription(audioFile: File) {
	const formData = new FormData()
	formData.append('file', audioFile)

	const res = await fetch(api.paths.getTranscription, {
		method: 'POST',
		body: formData,
	})
	failIfNotOk(res, 'Failed to retrieve avatar stream token')
	const transcription = await res.json()

	console.log('transcription:', transcription) // Log the transcription to verify

	return transcription
}
