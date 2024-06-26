import { useState } from "react"
import { useLocation } from "react-router-dom"
import { CourseDisplay, MobileCourseDisplay } from "../components/display"
import { CourseItem } from "../types/course"
import api from "../api/school"


export const Courses = () => {

    const [courses, setCourses] = useState<CourseItem[]>([])

    return (
        <>
            <div className="hidden sm:block">
                <CourseDisplay
                    courses={courses}
                    setCourses={setCourses}
                    fetchCourses={api.getCourses}
                />
            </div>
            <div className="sm:hidden">
                <MobileCourseDisplay
                    courses={courses}
                    setCourses={setCourses}
                    fetchCourses={api.getCourses}
                />
            </div>
        </>
    )
}