import { ErrorCircle24Regular } from "@fluentui/react-icons";

import { Button } from "@fluentui/react-components";

interface Props {
    error: string;
    onRetry: () => void;
}

export const AnswerError = ({ error, onRetry }: Props) => {
    return (
        <div className="">
            <ErrorCircle24Regular aria-hidden="true" aria-label="Error icon" primaryFill="red" />

            <div>
                <p><strong>An Error Occurred:</strong></p>
                <p className="">{error}</p>
            </div>

            <Button className="" onClick={onRetry}>Retry</Button>
        </div>
    );
};
