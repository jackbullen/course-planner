import { SparkleFilled } from "@fluentui/react-icons"
import { useRef, useState, useEffect, useMemo, useContext } from "react"
import { Answer, AnswerError, AnswerLoading } from "../components/chat/Answer"
import { QuestionInput } from "../components/chat/QuestionInput"
import { ExampleList } from "../components/chat/Example"
import { UserChatMessage } from "../components/chat/UserChatMessage"
import { Button, Dropdown, Spinner, Option, useId } from "@fluentui/react-components"
import type { DropdownProps } from "@fluentui/react-components";
import api from "../api/chat"
import { ChatAppResponse, ChatAppRequest } from "../api/chat/models"
import { Conversation } from "../components/chat/Conversation"
import Spinner2 from "../components/Spinner2"
import { AuthContext } from "../App"

const generateSessionId = () => [...Array(26)].map(() => Math.random().toString(36)[2]).join('')

const Chat = () => {

    const [sessionId, setSessionId] = useState(() => {
        const storedSessionId = localStorage.getItem('sessionId')
        if (storedSessionId) {
            return storedSessionId
        } else {
            const session = generateSessionId()
            localStorage.setItem("sessionId", session)
            return session
        }
    })
    const [chatSessions, setChatSessions] = useState<string[]>([])
    const [selectedOptions, setSelectedOptions] = useState<string[]>([sessionId])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<unknown>()
    const { user } = useContext(AuthContext)
    // State that stores the conversation, a list of 2-tuples containing <user_msg, ai_msg>
    const [conversation, setConversation] = useState<[user: string, response: ChatAppResponse][]>([])
    const [isConversationLoading, setIsConversationLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchData = async () => {
            const chatSessions = await api.getChatSessions()
            if (chatSessions.includes(sessionId)) {
                setChatSessions(chatSessions)
            } else {
                setChatSessions([...chatSessions, sessionId])
            }

            // if (storedSessionId) {
            const conversation = await api.getChatMessages(sessionId)
            setConversation(conversation)
            if (conversation.length > 0) {
                lastQuestionRef.current = conversation[conversation.length - 1][0]
            }
            // }
            setIsConversationLoading(false)
        }
        fetchData()
    }, [user, sessionId])

    // Reference to the most recent question
    const lastQuestionRef = useRef<string>("")

    // Chat user input handler to send request to api
    const makeChatRequest = async (question: string) => {
        lastQuestionRef.current = question

        error && setError(undefined)
        setIsLoading(true)

        try {
            const request: ChatAppRequest = {
                prompt: question,
                session_id: sessionId
            }

            const chatResponse: ChatAppResponse = await api.chat(request)
            setConversation([...conversation, [question, chatResponse]])

        } catch (e) {
            console.error(`Chat Error: ${e}`)
            setError(e)
        } finally {
            setIsLoading(false)
        }
    }

    const newChat = () => {
        const newSessionId = generateSessionId()
        localStorage.setItem("sessionId", newSessionId)
        setSelectedOptions([newSessionId])
        setSessionId(newSessionId)
        lastQuestionRef.current = ""
        error && setError(undefined)
        setConversation([])
        setIsLoading(false)
    }

    // Onclick handler for sample questions
    const onExampleClicked = (example: string) => {
        makeChatRequest(example)
    }

    const dropdownId = useId("dropdown-default");
    return (
        <div className="p-2 flex flex-col h-full">
            <div className="flex-grow overflow-y-auto">

                {/* Top left buttons */}
                <div className="p-2 flex flex-row gap-4">
                    <Button className="w-28" onClick={newChat}>New Chat</Button>
                    <div>
                        <Dropdown
                            style={{ minWidth: "115px" }}
                            aria-labelledby={dropdownId}
                            placeholder={sessionId.substring(0, 8)}
                            // appearance="filled-lighter"
                            value={sessionId.substring(0, 8)}
                            selectedOptions={selectedOptions}
                            onOptionSelect={(e, d) => {
                                setSelectedOptions(d.selectedOptions)
                                setSessionId(d.optionValue!)
                                localStorage.setItem("sessionId", d.optionValue!)
                                lastQuestionRef.current = ""
                            }}
                        >
                            {chatSessions.slice().reverse().map((sessionId) => (
                                <Option key={sessionId} value={sessionId}>
                                    {sessionId.substring(0, 8)}
                                </Option>
                            ))}
                        </Dropdown>
                    </div>
                    <div className="ml-auto">
                        <Button className="w-28" >Settings</Button>
                    </div>
                </div>

                {/* Main chat */}
                {isConversationLoading ? <Spinner className="absolute top-1/2 left-1/2" /> :
                    <div>
                        {!lastQuestionRef.current ? (
                            // If no questions have been asked, show the chat description and examples                         
                            <div className="mx-8 mt-5 mb-0 flex flex-col items-center">
                                <SparkleFilled fontSize={"120px"} primaryFill={"rgba(0, 102, 204, 0.8)"} aria-hidden="true" aria-label="Chat logo" />
                                <h1 className="text-2xl font-bold">Chat with UVic Data</h1>
                                <h2 className="text-xl font-semibold">Ask anything or try an example</h2>
                                <ExampleList onExampleClicked={onExampleClicked} />
                            </div>

                        ) : (
                            // Otherwise show the conversation
                            <Conversation
                                conversation={conversation}
                                makeChatRequest={makeChatRequest}
                                isLoading={isLoading}
                                error={error}
                                lastQuestionRef={lastQuestionRef}
                            />

                        )}

                        <div>
                            <QuestionInput
                                placeholder="Type a new question (e.g. what classes should I take?)"
                                disabled={isLoading}
                                onSend={question => makeChatRequest(question)}
                            />
                        </div>

                    </div>
                }

            </div>
        </div>
    )
}

export default Chat