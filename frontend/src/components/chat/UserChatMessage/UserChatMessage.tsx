import Markdown from "react-markdown";

interface Props {
    message: string;
}

export const UserChatMessage = ({ message }: Props) => {
    return (
        <div className="flex justify-end">
            <div className="flex flex-col items-end">
                <div className="prose prose-sm rounded-lg p-3 bg-blue-600 text-white max-w-sm break-words">
                <Markdown>{message}</Markdown>
                </div>
            </div>
        </div>
    );
};
