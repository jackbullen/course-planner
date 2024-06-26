// An individual section. _id is the Course Reference Number (CRN)
export interface SectionDto {
    _id: string
    days: string
    description: string
    start: string
    end: string
    startDate: string
    endDate: string
    f2f: string
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
    seq: string
    isLinked: boolean
    type: string
}

// A course offering in Fall 24 or Spring 25. It is a course with sections
export interface CourseSectionsDto {
    _id: string
    cal: string
    description: string
    fall: number
    spring: number
    hours: string | null
    name: string
    notes: string
    prerequisiteCourseList: string[] | null
    prerequisites: any | null
    sections: SectionDto[]
    term: "202409" | "202501" | "202409 | 202501"
    link: string
    pid: string
    year: number
}