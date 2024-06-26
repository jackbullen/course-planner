import { CompletedCourse } from "./course"

export interface AuthenticatedUser {
    _id: number | null
    name: string
    pictureUrl: string
    chatSessions: string[]
    degree: string
    degreeCode: string
    specialization: string
    token: string
}