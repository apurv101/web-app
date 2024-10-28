import { AssistantResponse } from 'ai'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { RunSubmitToolOutputsParams } from 'openai/resources/beta/threads/index.mjs'

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
		async ({ forwardStream, sendDataMessage, sendMessage: _sendMessage }) => {
			// Run the assistant on the thread
			const runStream = openai.beta.threads.runs.stream(threadId, {
				assistant_id,
			})

			// forward run status would stream message deltas
			let runResult = await forwardStream(runStream)

			// status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expired
			while (runResult?.status === 'requires_action' && runResult.required_action?.type === 'submit_tool_outputs') {
				const tool_outputs: RunSubmitToolOutputsParams.ToolOutput[] = []
				for (const toolCall of runResult.required_action.submit_tool_outputs.tool_calls) {
					// const parameters: unknown = JSON.parse(toolCall.function.arguments)

					console.debug('ToolCall:', JSON.stringify(toolCall, null, 2))
					try {
						switch (toolCall.function.name) {
							case 'perform_task': {
								// render the actual task being performed on the UI
								sendDataMessage({
									id: toolCall.id,
									role: 'data',
									data: { toolCall: 'perform_task', arguments: toolCall.function.arguments },
								})
								// submit the task
								const output = await performTask(toolCall.function.arguments)
								// return the results
								tool_outputs.push({
									output: JSON.stringify(output),
									tool_call_id: toolCall.id,
								})

								break
							}

							default:
								throw new Error(`Unknown tool call function: ${toolCall.function.name}`)
						}
					} catch (error) {
						tool_outputs.push({
							output: JSON.stringify({ success: false, error: error }),
							tool_call_id: toolCall.id,
						})
					} finally {
						console.debug('ToolCall output:', JSON.stringify(tool_outputs[tool_outputs.length - 1], null, 2))
					}
				}

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

async function performTask(parameters: string) {
	return new Promise((resolve, reject) => {
		try {
			const websocket = new WebSocket('ws://localhost:8765')
			websocket.onopen = (event) => {
				console.debug('Websocket opened:', event)
				// init connection
				websocket.send(
					JSON.stringify({
						type: 'init',
						token: 'webapp-1234',
					}),
				)
				// send task
				websocket.send(parameters)
			}
			websocket.onmessage = (event) => {
				console.debug('Websocket message:', event)
				if (typeof event.data !== 'string') {
					reject(new Error(`Invalid message from websocket; expected a string, got: ${String(event.data)}`))
					websocket.close(1007)
					return
				}

				const message: unknown = JSON.parse(event.data)

				if (!isValidMessage(message)) {
					reject(
						new Error(`Invalid message from websocket; expected a ValidMessage object, got: ${String(event.data)}`),
					)
					websocket.close(1007)
				} else if (message.type === 'status') {
					resolve(JSON.stringify({ success: message.success }))
					websocket.close(1000)
				} else {
					console.error(`Error sent from websocket: ${message.message}`)
					reject(new Error(`Error sent from websocket: ${message.message}`))
				}
			}
			websocket.onerror = (event) => {
				console.error('Websocket error:', event)
				const symbols = Object.getOwnPropertySymbols(event)
				const messageSymbol = symbols.find((symbol) => symbol.description === 'kMessage')
				const message = messageSymbol ? (event[messageSymbol as unknown as keyof Event] as string) : 'Unknown'
				reject(new Error(`Error connecting to websocket: ${message}`))
			}
			websocket.onclose = (event) => {
				console.debug(`Websocket closed: code ${String(event.code)}`)
				reject(new Error(`Websocket closed: code ${String(event.code)}`))
			}
		} catch (error) {
			console.error(`Error creating websocket: ${String(error)}`)
			reject(new Error(`Error creating websocket: ${String(error)}`))
		}
	})
}

type ValidMessage = ValidStatusMessage | ValidErrorMessage

type ValidStatusMessage = {
	type: 'status'
	success: boolean
}

type ValidErrorMessage = {
	type: 'error'
	message: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValidMessage(msg: any): msg is ValidMessage {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	const isStatusMessage = msg?.type === 'status' && typeof msg?.success === 'boolean'
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	const isErrorMessage = msg?.type === 'error' && typeof msg?.message === 'string'
	return isStatusMessage || isErrorMessage
}
