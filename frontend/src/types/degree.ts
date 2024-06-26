export interface DegreeItem {
    cred: string
    description: string
    link: string
    notes: string | null
    requirementsCourseList: string[]
    requirements: Record<string, any>
    html_requirements: string // fix this name...
    specializations: any[] | null
    title: string
    code: string
    similarity?: number
}