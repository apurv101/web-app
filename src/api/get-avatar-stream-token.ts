'use client'

import { api, failIfNotOk } from '@/api/common'

export async function getAvatarStreamToken() {
	const res = await fetch(api.paths.getAvatarStreamToken, {
		method: 'GET',
	})
	await failIfNotOk(res, 'Failed to retrieve avatar stream token')
	const token = await res.json()

	console.log('Avatar Stream Access Token:', token) // Log the token to verify

	return token
}
