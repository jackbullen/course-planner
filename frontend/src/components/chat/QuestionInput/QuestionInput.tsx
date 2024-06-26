import { Button, Tooltip, Input } from "@fluentui/react-components";
import { Send28Filled } from "@fluentui/react-icons";
import { useState } from "react";

interface Props {
    onSend: (question: string) => void;
    disabled: boolean;
    placeholder?: string;
}

export const QuestionInput = ({ onSend, disabled, placeholder }: Props) => {

    const [question, setQuestion] = useState<string>("")

    const sendQuestion = (question: string) => {
        if (disabled) {
            return;
        }
        onSend(question);
        setQuestion("")
    };

    const onInput = (ev: React.KeyboardEvent<Element>) => {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            sendQuestion(question);
        }
    };

    return (
        <div className="flex m-5">
            <Input
                id="question-input"
                className="w-full h-[48px]"
                placeholder={placeholder}
                value={question}
                onChange={(e) => { setQuestion(e.currentTarget.value) }}
                onKeyDown={onInput}
                autoComplete="off"
                contentAfter={
                    <div className="">
                        <Tooltip content="Send it!" relationship="label">
                            <Button
                                size="medium"
                                icon={<Send28Filled primaryFill="rgba(0, 102, 204, 0.8)" />}
                                onClick={() => {
                                    const input = document.getElementById('question-input') as HTMLInputElement
                                    const question = input.value
                                    sendQuestion(question)
                                }}
                            />
                        </Tooltip>
                    </div>
                }
            />
        </div>
    );
};
