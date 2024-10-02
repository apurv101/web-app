'use server'

export async function getAvatarStreamToken() {
	const apiKeyHeyGen = process.env.API_KEY_HEYGEN

	if (!apiKeyHeyGen) {
		console.error('Failed to retrieve API key')
		throw 'Failed to retrieve API key'
	}

	try {
		const res = await fetch('https://api.heygen.com/v1/streaming.create_token', {
			method: 'POST',
			headers: {
				'x-api-key': apiKeyHeyGen,
			},
		})
		const json = await res.json()
		return json.data.token
	} catch (error) {
		console.error('Error retrieving access token:', error)
		throw 'Error retrieving access token'
	}
}
