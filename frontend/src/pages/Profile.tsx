import { useContext, useEffect, useState } from "react"
import { AuthContext, RegisteredSectionsContext, UserCoursesContext } from "../App"
import { Button, Spinner } from "@fluentui/react-components"
import { useNavigate } from "react-router-dom"
import WeeklyCalendar from "../components/WeeklyCalendar"
import apiSchool from "../api/school"
import apiChat from "../api/chat"
import { SectionItem } from "../types/course"

export const Profile = () => {
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)
    const { userCourses, setUserCourses } = useContext(UserCoursesContext)
    const { registeredSections, setRegisteredSections } = useContext(RegisteredSectionsContext)
    const [calendarSections, setCalendarSections] = useState<SectionItem[]>([])
    const [chatSessions, setChatSessions] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchProfileData = async () => {
            const registeredSections = await apiSchool.getRegisteredSections()
            console.log(registeredSections)
            setRegisteredSections(registeredSections)

            const chatSessions = await apiChat.getChatSessions()
            setChatSessions(chatSessions)

            const userCourses = await apiSchool.getUserCourses()
            setUserCourses(userCourses)

            setIsLoading(false)
        }
        fetchProfileData()
    }, [])

    useEffect(() => {
        setCalendarSections(registeredSections.filter(x => x.term === '202409'))
    }, [registeredSections])

    return (
        <div className="flex flex-col">
            {isLoading ? <Spinner className="absolute top-1/2 left-1/2" /> :
                <>
                    <div className="h-[calc(100vh-48px)] grid grid-cols-3 justify-center items-center text-center">
                        <div className="flex flex-col justify-center gap-2">
                            {chatSessions.slice().reverse().map(sessionId => (
                                <div key={sessionId}>
                                    <Button
                                        onClick={() => {
                                            localStorage.setItem('sessionId', sessionId)
                                            navigate('/ai')
                                        }}
                                    >
                                        {sessionId.substring(0, 8)}
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="">
                            <h2 className="text-4xl font-bold">{user.name}</h2>
                            <h2 className="text-2xl">{user.degree}</h2>
                            {user.specialization !== "" && <h2>{user.specialization}</h2>}
                            <img src={user.pictureUrl} className="p-8 rounded-full" />
                        </div>
                        <div>
                            {userCourses.map(course => (
                                <p key={course.code}>{course.title}</p>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-center gap-2">
                            <Button onClick={
                                () => { setCalendarSections(registeredSections.filter(x => x.term === '202409')) }}
                            >
                                Fall
                            </Button>
                            <Button onClick={
                                () => { setCalendarSections(registeredSections.filter(x => x.term === '202501')) }}
                            >
                                Spring
                            </Button>
                        </div>
                        <WeeklyCalendar registeredSections={calendarSections} />
                    </div>
                </>
            }
        </div>
    )
}