import { CourseItem } from "../../types/course"

interface CourseUIProps {
    course: CourseItem
}

export const CourseUI = ({ course }: CourseUIProps) => {
    return (
        <div className="rounded-lg p-6 text-white">
            <h2 className="text-xl font-semibold mb-2">{course.name}</h2>
            <p className="text-sm mb-4">{course.description}</p>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm font-medium">{course.code}</p>
                    <p className="text-sm">{course.cal}</p>
                </div>
                <a
                    href={course.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-200 hover:underline"
                >
                    View Calendar
                </a>
            </div>
        </div>
    )
}