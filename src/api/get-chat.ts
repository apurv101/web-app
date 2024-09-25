'use client'

import { api, failIfNotOk } from '@/api/common'

export async function getChat(message: string, assistantId?: string, threadId?: string) {
	const res = await fetch(api.paths.getChat, {
		method: 'POST',
		body: JSON.stringify({
			message,
			assistantId,
			threadId,
		}),
	})
	await failIfNotOk(res, 'Failed to send chat message')
	const chatResponse = await res.json()

	console.log('chatResponse:', chatResponse) // Log the chatResponse to verify

	return chatResponse as { messages: string[]; assistantId: string; threadId: string }
}
