import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CompletedCourse } from '../types/course';
import { AuthContext, UserCoursesContext } from '../App';
import api from '../api/school/api';
// import { getPlans } from '../api';

export default function Home(): JSX.Element {
    const { user } = useContext(AuthContext)
    const { userCourses } = useContext(UserCoursesContext)
    // const [userAnalytics, setUserAnalytics] = useState()

    useEffect(() => {
        const fetchUserAnalytics = async () => {
            const data = await api.getUserAnalytics(user.degreeCode, user.specialization, userCourses)
            console.log(data)
        }
        fetchUserAnalytics()
    }, [])

    console.log(userCourses)

    return (
        <>
            <div className="ml-8">
                <div>
                    <h1 className="text-4xl">Hello Student</h1>
                </div>
            </div>
        </>
    );
}

Home.displayName = "Homepage";