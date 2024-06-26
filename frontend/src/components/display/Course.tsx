import { Button } from "@fluentui/react-components"
import { CourseItem, SectionItem } from "../../types/course"
import { useContext } from "react"
import { UserSettingsContext } from "../../App"
import { CourseUI } from "./CourseUI"

interface ItemProps {
    course: CourseItem | null
    setCourse: React.Dispatch<React.SetStateAction<CourseItem | null>>
    registerSection: (section: SectionItem) => void
    fall: boolean
    spring: boolean
}

const Course = ({ course, setCourse, registerSection, fall, spring }: ItemProps) => {

    if (!course) return null

    const { boxedPrerequisites } = useContext(UserSettingsContext)

    let sections = course.sections
    if (!fall) {
        sections = sections.filter(sec => sec.term !== "202409")
    }
    if (!spring) {
        sections = sections.filter(sec => sec.term !== "202501")
    }
    console.log(course)
    return (
        <div>
            <div className="sm:hidden mx-4 mt-6">
                <Button onClick={() => setCourse(null)}>
                    Back
                </Button>
            </div>
            <CourseUI course={course} />
            <div className="">
                {course.prerequisites && <PrerequisiteList reqList={course.prerequisites} boxed={boxedPrerequisites} />}
            </div>
            <div>
                {course.sections && sections.map((section, index) => (
                    <Section key={index} course={course} section={section} registerSection={registerSection} />
                ))}
            </div>
        </div>
    )
}

interface reqItem {
    quantity: string
    reqList: reqItem[]
}

interface PrerequisiteItemProps {
    item: reqItem | string
    boxed: boolean
}

const PrerequisiteItem = ({ item, boxed }: PrerequisiteItemProps) => {
    if (typeof item === 'string') {
        // string e.g. Third year standing
        return <li className="py-1">{item}</li>;
    } else if (Array.isArray(item.reqList)) {
        // contains a reqList
        return (
            <li className="py-1">
                <div className={`${boxed && "p-2 border border-gray-400 border-opacity-30 flex justify-between"} ml-2`}>
                    <p className="font-medium">{item.quantity === 'ALL' ? 'All of the following:' : `Choose ${item.quantity} from:`}</p>
                    <ul className={`${!boxed && "list-disc"}ml-4`}>
                        {item.reqList.map((subItem, index) => (
                            <PrerequisiteItem key={index} item={subItem} boxed={boxed} />
                        ))}
                    </ul>
                </div>
            </li>
        );
    } else {
        return null;
    }
};

interface PrerequisiteListProps {
    reqList: reqItem[]
    boxed: boolean
}

const PrerequisiteList = ({ reqList, boxed }: PrerequisiteListProps) => {
    return (
        <ul className="p-2">
            {reqList.map((reqItem, index) => (
                <PrerequisiteItem key={index} item={reqItem} boxed={boxed} />
            ))}
        </ul>
    );
};


interface SectionProps {
    course: CourseItem
    section: SectionItem;
    registerSection: (section: SectionItem) => void
}

const Section = ({ course, section, registerSection }: SectionProps) => {
    return (
        <div className="bg-gray-800 p-4 border-t border-gray-100 border-opacity-25">
            <div className="flex">
                <h3 className="text-lg font-semibold mb-2">{section.seq}</h3>
                <p className="ml-auto text-sm text-gray-400">{section.startDate} - {section.endDate}</p>
            </div>
            <p className="text-sm text-gray-300 mb-2">{section.description}</p>
            <div className="flex items-center">
                <p className="text-sm text-gray-400 mr-2">{section.days}</p>
                <p className="text-sm text-gray-400">{section.start} - {section.end}</p>
                <div className="ml-auto">
                    <Button className="" onClick={() => registerSection(section)}>Register</Button>
                </div>
            </div>
        </div>
    );
};

export default Course