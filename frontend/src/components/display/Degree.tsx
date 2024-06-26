import { Button, Popover, PopoverSurface, PopoverTrigger } from "@fluentui/react-components"
import { Fragment, useContext, useEffect, useState } from "react"
import { UserSettingsContext } from "../../App"
import { DegreeItem } from "../../types/degree"
import { CourseItem } from "../../types/course"
import api from "../../api/school"

interface ItemProps {
    degree: DegreeItem | null
    setDegree: React.Dispatch<React.SetStateAction<any | null>>
}

const Degree = ({ degree, setDegree }: ItemProps) => {

    // Not entirely sure what is causing the console warning, although it is related to this line
    // console.js:273 Warning: Internal React error: Expected static flag was missing
    // If I remove this line and validate degree in the TSX in reutrn then MouseEvents don't work
    // Since everything seems to work fine, I will leave it like this
    if (!degree) return null

    const [hoveredCourse, setHoveredCourse] = useState<CourseItem | null>(null)
    const [popoverPosition, setPopoverPosition] = useState({ left: 0, top: 0 })
    const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)

    const handleMouseOver = async (event: MouseEvent) => {
        const target = event.target as HTMLElement

        if (target.tagName === "A") {
            const courseCode = target.innerText.trim()

            if (hoverTimeout) {
                clearTimeout(hoverTimeout)
            }

            const timeout = setTimeout(async () => {
                try {
                    const courses = await api.getCourses(0, 1, courseCode, 'code', '&fall=1&spring=1')
                    setHoveredCourse(courses[0])

                    const rect = target.getBoundingClientRect()
                    const posX = rect.left + window.scrollX + target.offsetWidth + 10
                    const posY = rect.top + window.scrollY
                    setPopoverPosition({ left: posX, top: posY })

                } catch (error) {
                    console.error('Error fetching course data:', error)
                    setHoveredCourse(null)
                }
            }, 200) 

            setHoverTimeout(timeout)
        }
    }

    const handleMouseLeave = () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout)
        }
        setHoveredCourse(null)
    }

    useEffect(() => {
        const htmlContentDiv = document.querySelector('.html-content')  as HTMLDivElement
        if (htmlContentDiv) {
            htmlContentDiv.addEventListener('mouseover', handleMouseOver)
            htmlContentDiv.addEventListener('mouseleave', handleMouseLeave)
            return () => {
                htmlContentDiv.removeEventListener('mouseover', handleMouseOver)
                htmlContentDiv.removeEventListener('mouseleave', handleMouseLeave)
            }
        }
    }, [])

    return (
        <div className="sm:px-20">
            <div className="sm:hidden mx-4 mt-6">
                <Button onClick={() => setDegree(null)}>
                    Back
                </Button>
            </div>
            <div className="rounded-lg p-6 text-white">
                <h1 className="text-4xl font-semibold mb-2">{degree.title}</h1>
                <h2 className="text-2xl mb-2">{degree.cred}</h2>
                <p className="font-light text-lg mb-4">{degree.description}</p>
                <div className="flex flex-col gap-2">
                    <p className="text-xl">{degree.code}</p>
                    <div>
                        <a
                            href={degree.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg text-blue-400 hover:text-blue-200 hover:underline"
                        >
                            View Calendar
                        </a>
                    </div>
                </div>
            </div>
            <div className="">
                <div
                    className="html-content"
                    dangerouslySetInnerHTML={{ __html: degree.html_requirements }}
                />
                {hoveredCourse && (
                    <div className="fixed flex w-1/2" style={{ left: popoverPosition.left, top: popoverPosition.top - 12 }}>
                        <Popover open={true} size="large">
                            <PopoverTrigger>
                                <div className="invisible">
                                    <Button className="hidden">Hovered item details</Button>
                                </div>
                            </PopoverTrigger>
                            <PopoverSurface>
                                <h1 className="font-semibold">{hoveredCourse.code} - {hoveredCourse.name}</h1>
                                <p>{hoveredCourse.description}</p>
                                <p>{hoveredCourse.notes}</p>

                                <div className="grid grid-cols-8 gap-8 border">
                                    {hoveredCourse.sections.map(section => (
                                        <div className="">
                                            {section.seq} - {section.days} - {section.start} - {section.end}
                                        </div>
                                    ))}
                                </div>
                            </PopoverSurface>
                        </Popover>
                    </div>
                )}
                {/* {hoveredCourse && (
                    <div className="fixed" style={{ left: popoverPosition.left, top: popoverPosition.top }}>
                        <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-4">
                            <p className="font-bold">{hoveredCourse.code}</p>
                            <p className="text-sm text-gray-700">{hoveredCourse.description}</p>
                        </div>
                    </div>
                )} */}
                {/* {degree.requirements && <PrerequisiteList reqList={degree.requirements} boxed={boxedPrerequisites} />} */}
            </div>
        </div>
    )
}

// interface reqItem {
//     quantity: string
//     reqList: reqItem[]
// }

// interface PrerequisiteItemProps {
//     item: reqItem | string
//     boxed: boolean
// }

// const PrerequisiteItem: React.FC<PrerequisiteItemProps> = ({ item, boxed }) => {
//     if (typeof item === 'string') {
//         return <>{item}, </>
//     } else if (item.reqList) {
//         return (
//             <li className={`py-1 ${boxed ? "border border-gray-400 border-opacity-30 rounded-md p-4" : ""}`}>
//                 <div>
//                     <p className="font-medium">{item.quantity === 'ALL' ? 'All of the following:' : `Choose ${item.quantity} from:`}</p>
//                     <ul className={`gap-4 ${!boxed && "ml-4"}`}>
//                         {item.reqList.map((subItem, index) => (
//                             <PrerequisiteItem key={index} item={subItem} boxed={false} />
//                         ))}
//                     </ul>
//                 </div>
//             </li>
//         )
//     } else {
//         return null
//     }
// }

// interface PrerequisiteListProps {
//     reqList: { [key: string]: reqItem[] }
//     boxed: boolean
// }

// const PrerequisiteList: React.FC<PrerequisiteListProps> = ({ reqList, boxed }) => {
//     const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({})

//     const toggleSection = (label: string) => {
//         setCollapsedSections(prevState => ({
//             ...prevState,
//             [label]: !prevState[label]
//         }))
//     }

//     return (
//         <ul className="p-2">
//             {Object.entries(reqList).map(([label, reqItems], index) => (
//                 <li key={index} className="mb-4 cursor-pointer" onClick={() => toggleSection(label)}>
//                     <h1 className="text-xl">
//                         {label}
//                     </h1>
//                     {!collapsedSections[label] && (
//                         <ul className="ml-2">
//                             {reqItems.map((reqItem, idx) => (
//                                 <PrerequisiteItem key={idx} item={reqItem} boxed={boxed} />
//                             ))}
//                         </ul>
//                     )}
//                 </li>
//             ))}
//         </ul>
//     )
// }

export default Degree