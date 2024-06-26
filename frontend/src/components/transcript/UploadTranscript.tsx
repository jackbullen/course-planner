import { useState, ChangeEvent, FormEvent, useContext } from 'react'
import { useNavigate } from "react-router-dom";
import api from "../../api/school"
// import { CalendarCourse } from "../../../types/course";
import { Button, DialogActions, DialogTrigger, Spinner, Toaster, useId } from '@fluentui/react-components'
import Modal from "./Modal";
import CourseGrid from "../CourseGrid";
import { AuthContext, UserCoursesContext } from '../../App';

const UploadTranscript = () => {
    let navigate = useNavigate();
    const { user } = useContext(AuthContext)
    const { userCourses, setUserCourses } = useContext(UserCoursesContext)
    const [transcript, setTranscript] = useState<File | null>(null);
    const [fetchingCourses, setFetchingCourses] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [markdown, setMarkdown] = useState("");

    const onTranscriptUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setTranscript(e.target.files[0]);
        }
    }

    const onTranscriptSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (!transcript) {
                return;
            }
            setFetchingCourses(true);
            const formData = new FormData();
            formData.append('file', transcript);
            const data = await api.processTranscript(formData);
            console.log(data)
            setMarkdown(data.markdown);
            setUserCourses(data.courses);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error submitting transcript:", error)
        } finally {
            setFetchingCourses(false);
        }
    }

    return (
        <div>
            {userCourses && userCourses.length === 0 &&
                <div className="flex flex-row justify-around">
                    <form className="flex" onSubmit={onTranscriptSubmit}>
                        <div className="flex flex-col justify-around w-full gap-2 m-10">
                            <p className="text-2xl text-center">Upload your Transcript PDF document</p>
                            <div className="flex flex-col justify-around items-center gap-2">
                                <input id="fileInput" type="file" onChange={onTranscriptUpload} accept=".pdf" style={{ display: 'none' }} />
                                <Button onClick={() => { document.getElementById('fileInput')?.click() }}>Select Transcript PDF file</Button>
                                {transcript && <p>{transcript.name}</p>}
                            </div>
                            <div className="flex justify-around">
                                <Button type='submit'>Submit</Button>
                            </div>
                            {fetchingCourses && <Spinner labelPosition="above" label="Extracting courses..." />}
                        </div>
                    </form>
                </div>
            }
            {userCourses &&
                <div className="m-4 mb-0">
                    <Modal
                        open={isModalOpen}
                        setOpen={setIsModalOpen}
                        content={<>Using Azure AI Document Intelligence we have automatically extracted your <strong>successfully completed</strong> courses.
                            Please double check the accuracy of the extraction and <strong>make sure all courses are UVic courses.</strong> Afterwards scrolldown and press Continue.
                            <br /><br /><i>This service enables the output in Markdown (a straightforward typesetting language). Feel free to click the Markdown button to download.</i><br></br>
                            <DialogActions>
                                <div className="flex ml-auto gap-4 pt-4 pr-2">
                                    <Button
                                        onClick={() => {
                                            const blob = new Blob([markdown], { type: 'text/plain' });
                                            const url = URL.createObjectURL(blob);

                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `${transcript?.name.slice(0, -4)}.md`;
                                            document.body.appendChild(a);
                                            a.click();

                                            URL.revokeObjectURL(url);
                                            document.body.removeChild(a);
                                        }}
                                        appearance="secondary"
                                    >
                                        Markdown
                                    </Button>
                                    <DialogTrigger disableButtonEnhancement>
                                        <Button appearance="primary">Confirm</Button>
                                    </DialogTrigger>
                                </div>
                            </DialogActions>
                        </>}
                    />
                    {userCourses.length !== 0 && <p className="text-lg text-light">Review your courses then press continue</p>}
                    <CourseGrid
                        courses={userCourses}
                        setCourses={setUserCourses}
                    />
                    {userCourses.length !== 0 &&
                        <div className="flex justify-around pt-4 pb-8">
                            <Button
                                className=""
                                onClick={async () => {
                                    await api.uploadUserCourses(userCourses)
                                    navigate('/courses')
                                }}
                                size="large"
                            >
                                Continue
                            </Button>
                        </div>
                    }
                </div>
            }
        </div>
    )
}

export default UploadTranscript