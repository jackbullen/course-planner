import React, { useContext, useState } from "react"
import DegreeMenu from "./DegreeMenu"
import DegreeItem from "./Degree"
import Modal from "../transcript/Modal"

interface MobileDegreeDisplayProps {
    degrees: any
    setDegrees: React.Dispatch<React.SetStateAction<any>>
    fetchDegrees: (skip: number, limit: number, query: string, searchType: string, options: string) => Promise<any>
}

export const MobileDegreeDisplay = ({ degrees, setDegrees, fetchDegrees }: MobileDegreeDisplayProps) => {

    // Current item displayed in middle of screen
    const [currentDegree, setCurrentDegree] = useState<any | null>(null)

    return (
        <div className="h-[calc(100vh-48px)]">

            <div className="w-full bg-neutral-primary flex-shrink-0">
                <DegreeMenu
                    degrees={degrees}
                    setDegrees={setDegrees}
                    fetchDegrees={fetchDegrees}
                    setCurrentDegree={setCurrentDegree}
                />
            </div>
            <Modal
                open={currentDegree !== null}
                setOpen={() => setCurrentDegree(null)}
                content={
                    <DegreeItem degree={currentDegree} setDegree={setCurrentDegree} />
                }
            />
        </div>
    )
}