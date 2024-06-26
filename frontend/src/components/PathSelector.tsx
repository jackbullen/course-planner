import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { Button, Checkbox, Divider, Select, useId } from '@fluentui/react-components'
import type { CheckboxProps, SelectProps } from '@fluentui/react-components'

const PathSelector = () => {
    let navigate = useNavigate();

    // Is current student
    const [isProgramDeclared, setIsProgramDeclared] = useState<CheckboxProps["checked"]>(false);
    const [hasTranscript, setHasTranscript] = useState<CheckboxProps["checked"]>(false);

    // Is not current student
    const [isApplied, setIsApplied] = useState<CheckboxProps["checked"]>(false);
    const selectId = useId();

    return (
        <>
            <div className="font-light">
                <p className='text-3xl font-light text-center'>Answer some questions to get started...</p>
                <div className="m-4 sm:flex flex-row justify-around gap-8">
                    <div className="flex flex-col m-10 justify-between">
                        <h3 className="text-lg text-center mb-5">Current Students</h3>
                        <Checkbox
                            checked={isProgramDeclared}
                            onChange={(ev, data) => { setIsProgramDeclared(data.checked) }}
                            label="Have you declared your program?"
                        />
                        <Checkbox
                            className="pb-2"
                            checked={hasTranscript}
                            onChange={(ev, data) => { setHasTranscript(data.checked) }}
                            label="Would you like to upload your transcripts?"
                        />
                        <Button
                            onClick={() => {
                                navigate('student',
                                    {
                                        state: {
                                            isProgramDeclared: isProgramDeclared,
                                            hasTranscript: hasTranscript
                                        }
                                    })
                            }}
                        >
                            Continue
                        </Button>
                    </div>
                    <Divider vertical />
                    <div className="flex flex-col m-10 justify-between">
                        <h3 className="text-lg text-center mb-5">Prospective Students</h3>
                        <label htmlFor={selectId} className="text-neutral-dark">What faculty are you interested in?</label>
                        <Select className="pb-2" id={selectId} >
                            <option>Business</option>
                            <option>Education</option>
                            <option>Engineering and Computer Science</option>
                            <option>Fine Arts</option>
                            <option>Human and Social Development</option>
                            <option>Humanities</option>
                            <option>Law</option>
                            <option>Science</option>
                            <option>Social Sciences</option>
                        </Select>
                        <Checkbox
                            className="pb-2"
                            checked={isApplied}
                            onChange={(ev, data) => { setIsApplied(data.checked) }}
                            label="Have you applied yet?"
                        />
                        <Button onClick={() => { navigate('/prospective') }}>
                            Continue
                        </Button>
                    </div>
                </div>

            </div>
        </>
    )
}

export default PathSelector