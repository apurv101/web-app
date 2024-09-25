import { getChat } from '@/api/get-chat'
import { useState } from 'react'

export default function useChat() {
	const [assistantId, setAssistantId] = useState<string>()
	const [threadId, setThreadId] = useState<string>()

	return {
		send: async (message: string) => {
			const res = await getChat(message, assistantId, threadId)
			setAssistantId(res.assistantId)
			setThreadId(res.threadId)
			return res.messages
		},
	}
}
