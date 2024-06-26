import { useState } from "react"
import { CourseItem } from "../types/course"
import api from "../api/school"
import { DegreeDisplay } from "../components/display"
import { MobileDegreeDisplay } from "../components/display/DegreeDisplayMobile"


export const Degrees = () => {

    const [degrees, setDegrees] = useState<CourseItem[]>([])

    return (
        <>
            <div className="hidden sm:block">
                <DegreeDisplay
                    degrees={degrees}
                    setDegrees={setDegrees}
                    fetchDegrees={api.getDegrees}
                />
            </div>
            <div className="sm:hidden">
                <MobileDegreeDisplay
                    degrees={degrees}
                    setDegrees={setDegrees}
                    fetchDegrees={api.getDegrees}
                />
            </div>
        </>
    )
}