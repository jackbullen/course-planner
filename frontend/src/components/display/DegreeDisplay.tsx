import React, { useContext, useState } from "react"
import DegreeMenu from "./DegreeMenu"
import DegreeItem from "./Degree"

interface CourseDisplayProps {
    degrees: any
    setDegrees: React.Dispatch<React.SetStateAction<any>>
    fetchDegrees: (skip: number, limit: number, query: string, searchType: string, options: string) => Promise<any>
}

export const DegreeDisplay = ({ degrees, setDegrees, fetchDegrees }: CourseDisplayProps) => {

    // Current item displayed in middle of screen
    const [currentDegree, setCurrentDegree] = useState<any | null>(null)

    return (
        <div className="h-[calc(100vh-48px)] overflow-hidden flex flex-row">

            <div className="w-[300px] bg-neutral-primary flex-shrink-0">
                <DegreeMenu
                    degrees={degrees}
                    setDegrees={setDegrees}
                    fetchDegrees={fetchDegrees}
                    setCurrentDegree={setCurrentDegree}
                />
            </div>

            <div className="overflow-y-auto flex flex-col w-full">
                <DegreeItem degree={currentDegree} setDegree={setCurrentDegree} />
            </div>

        </div>
    )
}