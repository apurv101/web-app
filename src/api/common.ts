'use client'

export const isDev = process.env.NODE_ENV === 'development'
/**
 * The `API_HOSTNAME_OVERRIDE` environment variable can change which endpoint is
 * used for the API. For example, setting it to `api.beta.aimyable.com` will use
 * the beta stage endpoint instead of the window hostname.
 * This can be useful for testing.
 */
export const apiHostnameOverride = process.env.API_HOSTNAME_OVERRIDE

let tsLambdasUrl
let pyLambdasUrl

if (apiHostnameOverride) {
	if (apiHostnameOverride === 'api.aimyable.com') {
		throw new Error('Cannot set `apiHostnameOverride` to the production hostname')
	}
	tsLambdasUrl = `https://${apiHostnameOverride}`
	pyLambdasUrl = `https://${apiHostnameOverride}`
} else if (isDev || typeof window === 'undefined') {
	// `window` is not defined during webpack build
	tsLambdasUrl = `http://localhost:8000`
	pyLambdasUrl = `http://localhost:5000`
} else {
	/**
	 * The base hostname is the current window hostname.
	 * This way beta and prod stages should use the correct URL with the same code.
	 *
	 * - beta: `beta.aimyable.com`
	 * - prod: `aimyable.com`
	 */
	tsLambdasUrl = `https://api.${window.location.hostname}`
	pyLambdasUrl = `https://api.${window.location.hostname}`
}

export const api = {
	endpoints: {
		tsLambdasUrl,
		pyLambdasUrl,
	},
	paths: {
		getAvatarStreamToken: `${tsLambdasUrl}/avatar-stream-token`,
		getTranscription: `${tsLambdasUrl}/transcription`,
	},
} as const

export async function failIfNotOk(response: Response, failMessage: string) {
	if (!response.ok) {
		let message = failMessage
		try {
			const json = await response.json()
			const resMessage = json instanceof Error ? json.message : json
			if (resMessage) {
				message += ', caused by ' + resMessage
			}
		} catch (error) {
			console.error('Failed to parse json response:', error)
		}
		throw new Error(message)
	}
}
