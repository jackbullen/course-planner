import React from 'react'
import { SectionItem } from '../types/course'
import { useNavigate } from 'react-router-dom'

interface WeeklyCalendarProps {
    registeredSections: SectionItem[]
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ registeredSections }) => {
    const navigate = useNavigate()
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

    const timeLabels = Array.from({ length: 11 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`)

    return (
        <div className="flex flex-col">
            <div className="grid grid-cols-6 md:grid-cols-6 bg-gray-800 text-white p-2">
                <div className="col-span-1"></div>
                {daysOfWeek.map((day, index) => (
                    <div key={index}>
                        <div className="hidden sm:block col-span-1 text-center">{day}</div>
                        <div className="sm:hidden col-span-1 text-center">{day.substring(0,3)}</div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-6 p-2">

                {/* Time col */}
                <div className="col-span-1">
                    {timeLabels.map((time, index) => (
                        <div key={index} className="h-[60px] text-right pr-2 text-gray-200 border-t border-gray-300">{time}</div>
                    ))}
                </div>

                {/* Days cols */}
                {daysOfWeek.map((day, dayIndex) => (
                    <div key={dayIndex} className="col-span-1 relative border-l border-gray-200 border-opacity-10 border-t">
                        {registeredSections.map((schedule, scheduleIndex) => {
                            // Check if the schedule occurs on the current day
                            const occursOnDay = schedule[day.toLowerCase() as keyof SectionItem]
                            if (occursOnDay) {
                                const startTime = schedule.start
                                const startHours = parseInt(startTime.substring(0, 2), 10)
                                const startMinutes = parseInt(startTime.substring(2), 10)

                                const endTime = schedule.end
                                const endHours = parseInt(endTime.substring(0, 2), 10)
                                const endMinutes = parseInt(endTime.substring(2), 10)

                                const start = (startHours - 8 + startMinutes / 60) * 60
                                const end = (endHours - 8 + endMinutes / 60) * 60

                                return (
                                    <div
                                        key={`${schedule.code}-${dayIndex}-${scheduleIndex}`}
                                        onClick={() => { window.open(schedule.link) }}
                                        className="text-xs w-full cursor-pointer bg-blue-900 shadow-md sm:text-sm text-white absolute border-t border-gray-200"
                                        style={{ top: `${start}px`, height: `${end - start}px` }}
                                    >
                                        <div className="p-1">
                                            <p className="font-semibold">{schedule.code} {schedule.seq}</p>
                                            <p className="invisible sm:visible">{schedule.start} - {schedule.end}</p>
                                        </div>
                                    </div>
                                )
                            }
                            return null
                        })}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default WeeklyCalendar
