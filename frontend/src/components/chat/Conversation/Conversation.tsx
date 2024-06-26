import React, { useEffect, useRef } from "react"
import { Answer, AnswerError, AnswerLoading } from "../Answer"
import { UserChatMessage } from "../UserChatMessage"
import { ChatAppResponse } from "../../../api/chat/models"

interface ConversationProps {
    conversation: [user: string, response: ChatAppResponse][]
    makeChatRequest: (q: string) => {}
    isLoading: boolean
    error: unknown
    lastQuestionRef: React.MutableRefObject<string>
}

export const Conversation = ({ conversation, makeChatRequest, isLoading, error, lastQuestionRef }: ConversationProps) => {

    // When new messages are put in chat, smoothly scroll them into view
    const bottomOfChatDiv = useRef<HTMLDivElement | null>(null)
    useEffect(() => bottomOfChatDiv.current?.scrollIntoView({ behavior: "smooth" }), [isLoading])
    
    return (
        <div className="m-10">
            {conversation.map(([question, answer], i) => (
                <div key={i} className="flex flex-col pt-5">
                    <UserChatMessage message={question} />
                    <Answer answer={answer} />
                </div>
            ))}
            {isLoading && (
                <div className="flex flex-col pt-5">
                    <UserChatMessage message={lastQuestionRef.current} />
                    <AnswerLoading />
                </div>
            )}
            {error ? (
                <>
                    <UserChatMessage message={lastQuestionRef.current} />
                    <AnswerError error={error.toString()} onRetry={() => makeChatRequest(lastQuestionRef.current)} />
                </>
            ) : null}
            <div ref={bottomOfChatDiv} />
        </div>
    )
}