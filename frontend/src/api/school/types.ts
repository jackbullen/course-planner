import { CompletedCourse } from "../../types/course";

export interface ProcessTranscriptResponse {
    courses: CompletedCourse[]
    markdown: string
}