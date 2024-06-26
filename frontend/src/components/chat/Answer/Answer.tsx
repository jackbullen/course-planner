import Markdown from 'react-markdown'
import { ChatAppResponse } from "../../../api";
import { AnswerIcon } from "./AnswerIcon";

interface AnswerProps {
    answer: ChatAppResponse;
}

export const Answer = ({ answer }: AnswerProps) => {
    const messageContent = answer.message;
    return (
        <div className="flex items-start mt-4">
            <div className="flex-shrink-0">
                <AnswerIcon />
            </div>
            <div className="ml-3">
                <div className="prose prose-sm rounded-lg p-3 bg-gray-300 text-gray-800 max-w-xl break-words">
                    <Markdown>{messageContent}</Markdown>
                </div>
            </div>
        </div>
    );
};