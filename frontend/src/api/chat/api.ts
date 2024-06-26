import { 
    ChatAppResponse, 
    ChatAppRequest, 
} from "./models";
import { apiClient } from "../client";

async function chat(request: ChatAppRequest): Promise<ChatAppResponse> {
    try {
        const response = await apiClient.post('/ai/chat', request, {
            headers: {"Content-Type": "application/json"}
        })
        return response.data
    } catch (error) {
        console.error(error)
        throw error
    }
}

async function getChatMessages(sessionId: string): Promise<[string, ChatAppResponse][]> {
    try {
        const response = await apiClient.get(`/ai/chat/messages?session_id=${sessionId}`)
        const messages: string[] = response.data

        const messagePairs: [string, ChatAppResponse][] = []
        for (let i = 0; i < messages.length; i+=2) {
            messagePairs.push([messages[i], {message: messages[i+1]}])
        }

        return messagePairs
    } catch (error) {
        console.error(error)
        throw error
    }
}

async function getChatSessions(): Promise<string[]> {
    try {
        const response = await apiClient.get("/user/get-chat-sessions")
        return response.data
    } catch (error) {
        console.error(error)
        throw error
    }
}

export default {
    chat,
    getChatMessages,
    getChatSessions
}