import { AssistantResponse } from 'ai'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const assistant_id = 'asst_anboc2BrNkdQA0i99cxng2ai'

const apiKeyOpenAI = process.env.API_KEY_OPEN_AI

if (!apiKeyOpenAI) {
	console.error('Failed to retrieve API key')
	throw new Error('Failed to retrieve API key')
}

const openai = new OpenAI({
	apiKey: apiKeyOpenAI,
})

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
	// Parse the request body
	const input: unknown = await req.json()

	if (!isValidRequest(input)) {
		return NextResponse.json({ message: 'Invalid request: message is required' }, { status: 400 })
	}

	// Create a thread if needed
	const threadId = input.threadId ?? (await openai.beta.threads.create({})).id

	// Add a message to the thread
	const createdMessage = await openai.beta.threads.messages.create(threadId, {
		role: 'user',
		content: input.message,
	})

	return AssistantResponse(
		{ threadId, messageId: createdMessage.id },
		async ({ forwardStream, sendDataMessage: _sendDataMessage, sendMessage: _sendMessage }) => {
			// Run the assistant on the thread
			const runStream = openai.beta.threads.runs.stream(threadId, {
				assistant_id,
			})

			// forward run status would stream message deltas
			let runResult = await forwardStream(runStream)

			// status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expired
			while (runResult?.status === 'requires_action' && runResult.required_action?.type === 'submit_tool_outputs') {
				const tool_outputs = runResult.required_action.submit_tool_outputs.tool_calls.map((toolCall) => {
					const _parameters: unknown = JSON.parse(toolCall.function.arguments)

					switch (toolCall.function.name) {
						// configure your tool calls here

						default:
							throw new Error(`Unknown tool call function: ${toolCall.function.name}`)
					}
				})

				runResult = await forwardStream(
					openai.beta.threads.runs.submitToolOutputsStream(threadId, runResult.id, { tool_outputs }),
				)
			}
		},
	)
}

type ValidRequest = {
	threadId: string | null
	message: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValidRequest(req: any): req is ValidRequest {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	return (req?.threadId === null || typeof req?.threadId === 'string') && typeof req?.message === 'string'
}
