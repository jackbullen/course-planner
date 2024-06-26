import { useLocation } from 'react-router-dom';
import UploadTranscript from '../components/transcript/UploadTranscript'

export default function Home(): JSX.Element {
    const location = useLocation();
    const isProgramDeclared = location.state?.isProgramDeclared;
    const hasTranscript = location.state?.hasTranscript;

    return (
        <>
            {hasTranscript ?
                <div>
                    <UploadTranscript />
                </div>
                :
                <div>
                    <p>Please input what courses you have completed</p>
                    <p>Type a course and when you have selected the correct course press Enter.</p>
                    {/* <CourseIntake /> */}
                </div>
            }

        </>
    );
}

Home.displayName = "Homepage";