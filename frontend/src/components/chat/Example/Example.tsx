import { Button } from "@fluentui/react-components";

interface Props {
    text: string;
    value: string;
    onClick: (value: string) => void;
}

export const Example = ({ text, value, onClick }: Props) => {
    return (
        <Button className="w-full h-20" onClick={() => onClick(value)}>
            <p className="">{text}</p>
        </Button>
    );
};
