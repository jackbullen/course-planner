import { useLoaderData } from "react-router-dom"
import { CourseItem } from "../types/course"
// import Course from "./display/Course"
import { CourseUI } from "./display/CourseUI"

export const CourseDetail = () => {
    const course = useLoaderData() as CourseItem

    return (
        <CourseUI course={course} />
    )
}