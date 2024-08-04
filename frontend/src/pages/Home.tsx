import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { AuthContext, UserCoursesContext } from '../App';
import CourseGrid from '../components/CourseGrid';
import PathSelector from '../components/PathSelector'
import { Button, Spinner } from '@fluentui/react-components';
// import Spinner2 from '../components/Spinner2';
// import { CompletedCourse } from '../types/course';
import api from '../api/school';

export default function Home(): JSX.Element {
    const navigate = useNavigate()

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const { user } = useContext(AuthContext)
    const { userCourses, setUserCourses } = useContext(UserCoursesContext)
    const [upcomingCourses, setUpcomingCourses] = useState<any>(null)

    // Fetch user courses on load
    useEffect(() => {
        async function fetchCompletedCourses() {
            const userCourses = await api.getUserCourses()
            setUserCourses(userCourses)
            setIsLoading(false)
        }
        fetchCompletedCourses()
    }, [])

    // When the course grid updates userCourses fetch new analytics and upload changed user courses.
    useEffect(() => {
        async function fetchUserAnalytics() {
            const data = await api.getUserAnalytics(user.degreeCode, user.specialization, userCourses)
            const upcomingCourses = data.upcomingCourses.map((course: any) => (
                {
                    ...course,
                    code: course._id,
                    sections: course.sections.map((section: any) => ({ ...section, crn: section._id }))
                }
            ))
            setUpcomingCourses(upcomingCourses)
        }
        fetchUserAnalytics()

        // Update modified user courses
        if (userCourses.length !== 0) {
            api.uploadUserCourses(userCourses)
        }
    }, [userCourses])

    return (
        <>
            <div className="p-8">
                <div>
                    <h1 className="text-4xl">Welcome {userCourses.length > 0 && "back"}</h1>
                </div>
                <div className="mt-4">
                    {isLoading ? <Spinner className="absolute top-1/2 left-1/2" /> : (
                        <>
                            {userCourses.length > 0 ?
                                <div className="mx-auto">
                                    <CourseGrid
                                        courses={userCourses}
                                        setCourses={setUserCourses}
                                    />
                                    <div className="flex justify-center gap-4 mt-4">
                                        <Button
                                            onClick={async () => {
                                                navigate('courses', { state: { courses: upcomingCourses } })
                                            }}
                                        >
                                            View Courses
                                        </Button>
                                    </div>
                                </div> : <PathSelector />
                            }
                        </>
                    )}
                </div>
            </div >
        </>
    );
}

Home.displayName = "Homepage";