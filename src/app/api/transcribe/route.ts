import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
	const formData = await request.formData()
	const audioFile = formData.get('audioFile') as File

	if (!audioFile) {
		throw 'No audio file received'
	}

	const apiKeyOpenAI = process.env.API_KEY_OPEN_AI

	if (!apiKeyOpenAI) {
		console.error('Failed to retrieve API key')
		throw 'Failed to retrieve API key'
	}

	const openai = new OpenAI({
		apiKey: apiKeyOpenAI,
	})

	try {
		const response = await openai.audio.transcriptions.create({
			model: 'whisper-1',
			file: audioFile,
			prompt: `
				The transcript is the dialog of a person talking to Aimy,
				which is a female AI assistant that works in accounts payable.
			`,
		})
		return NextResponse.json(response.text)
	} catch (error) {
		console.error('Error transcribing audio:', error)
		throw 'Error transcribing audio'
	}
}
