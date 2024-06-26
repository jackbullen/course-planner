import React, { useContext, useEffect, useRef, useState } from "react"
import Course from "./Course"
import { CourseItem, SectionItem } from "../../types/course"
import CourseMenu from "./CourseMenu"
import RegisteredSections from "./RegisteredSections"
import {
    useId,
    Toaster,
    useToastController,
    ToastTitle,
    Toast,
    ToastIntent
} from "@fluentui/react-components";
import { hasDayOverlap } from "../../utils"
import { RegisteredSectionsContext } from "../../App"
import Modal from "../transcript/Modal"
import api from "../../api/school"

interface CourseDisplayProps {
    courses: any
    setCourses: React.Dispatch<React.SetStateAction<any>>
    fetchCourses: (skip: number, limit: number, query: string, searchType: string, options: string) => Promise<any>
}

export const MobileCourseDisplay = ({ courses, setCourses, fetchCourses }: CourseDisplayProps) => {

    // Current item displayed in middle of screen
    const [currentCourse, setCurrentCourse] = useState<CourseItem | null>(null)

    // Selected courses displayed on right of screen
    const { registeredSections, setRegisteredSections } = useContext(RegisteredSectionsContext)

    function registerSection(section: SectionItem) {

        // Already registered for this course section type (allows for MATH120 A01 and  B01)
        const sectionConflict = registeredSections.find(sec => (sec.code === section.code
            && sec.seq[0] === section.seq[0]))
        if (sectionConflict) {
            cannotRegisterNotify(`Already registered for ${section.code} ${sectionConflict.seq}`)
            return
        }

        // Time conflict
        const timeConflict = registeredSections.find(sec =>
        (hasDayOverlap(sec, section) && sec.term === section.term &&  // Section is on same day and semester AND
            (sec.start <= section.start && section.start <= sec.end // Starts during a registered section OR
                || (sec.start <= section.end && section.end <= sec.end)))) // End during a registered section
        if (timeConflict) {
            cannotRegisterNotify(`Time conflict with ${timeConflict.code} ${timeConflict.seq} 
                at ${timeConflict.start}-${timeConflict.end} on ${timeConflict.days}`)
            return
        }

        // Otherwise add the section
        api.uploadRegisteredSection(section.crn)
        setRegisteredSections(prev => [...prev, section])
    }

    // Currently cannot unregister on mobile...

    const [fall, setFall] = useState(true)
    const [spring, setSpring] = useState(true)

    const cannotRegisterToast = useId("cannot-register");
    const { dispatchToast } = useToastController(cannotRegisterToast);
    const intent: ToastIntent = "error";
    const cannotRegisterNotify = (message: string) => {
        dispatchToast(
            <Toast>
                <ToastTitle>{message}</ToastTitle>
            </Toast>,
            { intent }
        );
    }

    return (
        <div className="h-[calc(100vh-48px)]">
            <div className="w-full bg-neutral-primary flex-shrink-0">
                <CourseMenu
                    items={courses}
                    setItems={setCourses}
                    fetchItems={fetchCourses}
                    setCurrentItem={setCurrentCourse}
                    fall={fall}
                    setFall={setFall}
                    spring={spring}
                    setSpring={setSpring}
                />
            </div>
            <Modal
                open={currentCourse !== null}
                setOpen={() => setCurrentCourse(null)}
                content={
                    <Course
                        course={currentCourse}
                        setCourse={setCurrentCourse}
                        registerSection={registerSection}
                        fall={fall}
                        spring={spring}
                    />
                }
            />
        </div>
    )
}