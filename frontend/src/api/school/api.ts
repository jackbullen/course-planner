import { CompletedCourse, CourseItem } from "../../types/course"
import { DegreeItem } from "../../types/degree"
import { apiClient } from "../client"
import { CourseSectionsDto, SectionDto } from "./dto"
import { ProcessTranscriptResponse } from "./types"

// Process PDF bytes with Azure AI Document Intelligence and get back the CompletedCourse[]
async function processTranscript(formData: FormData): Promise<ProcessTranscriptResponse> {
    try {
        const response = await apiClient.post('/user/upload-transcript', formData)
        return response.data
    } catch (error) {
        console.error("Error processing transcript:", error)
        throw error;
    }
}

// Get the users completed courses that were stored after processing their transcript or manual input
async function getUserCourses() {
    try {
        const response = await apiClient.get("/user/get-courses")
        return response.data
    } catch (error) {
        console.error("Error fetching user courses", error)
        throw error
    }
}

async function getRegisteredSections() {
    try {
        const response = await apiClient.get("/user/get-registered-sections")
        return response.data.map((section: SectionDto) => ({
            ...section,
            crn: section._id
        }))
    } catch (error) {
        console.error("Error fetching user registered sections")
        throw error
    }
}

async function uploadRegisteredSection(crn: string) {
    try {
        const response = await apiClient.post(`/user/register-section?crn=${crn}`)
        return response.data
    } catch (error) {
        console.error("Error uploading registered section")
        throw error
    }
}

async function deleteRegisteredSection(crn: string) {
    try {
        const response = await apiClient.post(`/user/unregister-section?crn=${crn}`)
        return response.data
    } catch (error) {
        console.error("Error uploading registered section")
        throw error
    }
}

// Upload the users completed courses. 
//   For after they confirm the correctness / edit the response from processTranscript, 
//   or making any changes in Profile
async function uploadUserCourses(userCourses: CompletedCourse[]) {
    console.log("Posting userCourses", userCourses)
    try {
        const response = await apiClient.post("/user/upload-courses", {
            user_courses: userCourses
        })
        return response.data
    } catch (error) {
        console.error("Error uploading user courses", error)
        throw error
    }
}

// After the user has confirmed their user courses, 
// this function is called to get analytics on their degree progress
async function getUserAnalytics(degreeCode: string, specialization: string, completedCourses: CompletedCourse[]) {
    console.log(specialization)
    try {
        const response = await apiClient.post("/user/analytics", {
            degree_code: degreeCode,
            specialization: specialization,
            completed_courses: completedCourses
        })
        return response.data
    } catch (error) {
        console.error("Error getting user degree analytics")
    }
}

async function getCalendarCourse(code: string) {
    try {
        const response = await apiClient.get(`/calendar-course/?code=${code}`)
        return response.data
    } catch (error) {
        console.log("Error getting calendar course")
        throw error
    }
}

// Get a list of courses 
async function getCourses(skip: number, limit: number, query: string = "", searchType: string = "name", options: string = ""): Promise<CourseItem[]> {
    try {
        // note: can also pass query params by string interpolation. passing params does the same things as this
        const response = await apiClient.get(`/courses?skip=${skip}&limit=${limit}&query=${query}&type=${searchType}` + options)
        const courses = response.data as CourseSectionsDto[]
        return courses.map(course => ({
            ...course,
            sections: course.sections.map((section: SectionDto) => ({
                ...section,
                crn: section._id,
                link: course.link
            })),
            code: course._id
        }))
    } catch (error) {
        console.error('Error getting courses:', error)
        throw error
    }
}

// Get a list of courses 
async function getDegrees(skip: number, limit: number, query: string = "", searchType: string = "title", options: string = ""): Promise<DegreeItem[]> {
    try {
        const response = await apiClient.get(`/degrees?skip=${skip}&limit=${limit}&query=${query}&type=${searchType}`)
        console.log(response.data)
        const degrees = response.data
        return degrees.map((degree: any) => ({
            ...degree,
            code: degree._id
        }))
    } catch (error) {
        console.error('Error getting courses:', error)
        throw error
    }
}

export default {
    processTranscript,
    getUserCourses,
    uploadUserCourses,
    getRegisteredSections,
    uploadRegisteredSection,
    deleteRegisteredSection,
    getUserAnalytics,
    getCalendarCourse,
    getCourses,
    getDegrees
}