export interface CompletedCourse {
    code: string;
    title: string;
    grade: number;
    gradeLetter: string;
    gradePoint: number;
    credits: number;
}

// Refers to Section in server
export interface SectionItem {
    crn: string
    days: string
    description: string
    start: string
    end: string
    startDate:string
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
    type: string
    isLinked: boolean
    code?: string
    term?: string
    link?: string
}

// Refers to Course in server
export interface CourseItem {
    pid: string
    cal: string
    code: string
    description: string
    hours: string | null
    link: string
    name: string
    notes: string
    prerequisiteCourseList: string[] | null
    prerequisites: any[]
    sections: SectionItem[]
    year: number
    term: string
    similarity?: number
}