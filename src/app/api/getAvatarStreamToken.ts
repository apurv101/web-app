'use server'

export async function getAvatarStreamToken() {
	const apiKeyHeyGen = process.env.API_KEY_HEYGEN

	if (!apiKeyHeyGen) {
		console.error('Failed to retrieve API key')
		throw new Error('Failed to retrieve API key')
	}

	try {
		const res = await fetch('https://api.heygen.com/v1/streaming.create_token', {
			method: 'POST',
			headers: {
				'x-api-key': apiKeyHeyGen,
			},
		})
		const json: unknown = await res.json()
		if (!isValidResponse(json)) {
			throw new Error(`Invalid resopnse from HeyGen: ${String(json)}`)
		}
		return json.data.token
	} catch (error) {
		console.error('Error retrieving access token:', error)
		throw new Error('Error retrieving access token')
	}
}

type ValidResponse = {
	data: {
		token: string
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValidResponse(resp: any): resp is ValidResponse {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	return typeof resp?.data?.token === 'string'
}
