import { Button } from "@fluentui/react-components";
import { Example } from "./Example";

import { useState } from "react";

const generateRandomExamples = (): string[] => {
  // TODO
    return [
        "Suggest courses for this Fall given I have completed Math 204 and Phys 216",
        "Suggest courses for this Fall given I have completed Math 204 and Phys 216",
        "Suggest courses for this Fall given I have completed Math 204 and Phys 216",
    ]
}

const Examples = [
    "What courses do you have on inverse functions?",
    "Do you have any degrees that help me improve my Music Composition?",
    "Suggest courses for this Fall given I have completed Math 204 and Phys 216",
];

interface Props {
    onExampleClicked: (value: string) => void;
}

export const ExampleList = ({ onExampleClicked }: Props) => {
    const [hideExamples, setHideExamples] = useState<boolean>(false)
    const [examples, setExamples] = useState<string[]>(Examples)
    return (
        <div className="flex flex-col items-center">
            {!hideExamples &&
                <>
                    <ul className="grid grid-cols-3 gap-10 m-5">
                        {examples.map((eg, i) => (
                            <li key={i}>
                                <Example text={eg} value={eg} onClick={onExampleClicked} />
                            </li>
                        ))}
                    </ul>
                    <div className="flex gap-10">
                        <Button
                            appearance="transparent"
                            className="w-48"
                            onClick={() => setExamples(generateRandomExamples())}
                        >
                            <p className="font-normal">Randomize Examples</p>
                        </Button>
                        <Button
                            appearance="transparent"
                            className="w-48"
                            onClick={() => setHideExamples(true)}
                        >
                            <p className="font-normal">Hide Examples</p>
                        </Button>
                    </div>
                </>
            }
        </div>
    );
};
