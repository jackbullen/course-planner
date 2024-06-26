import { createBrowserRouter, Link, Navigate } from "react-router-dom"

import Layout from "../Layout"
import { AuthenticatedUser } from "../types/auth"
import Chat from "../pages/Chat"
import StudentAI from "../pages/StudentAI"
import { Courses } from "../pages/Courses"
import Student from "../pages/Student"
import Home from "../pages/Home"
import api from "../api/school"
import { useContext, useEffect } from "react"
import { Degrees } from "../pages/Degrees"
import { CourseDetail } from "../components/CourseDetail"
import { Profile } from "../pages/Profile"

const studentRouter = (auth: AuthenticatedUser) => {

    return (
        createBrowserRouter([
            {
                path: "/",
                element: <Layout auth={auth} />,
                children: [
                    {
                        index: true,
                        element: <Home />,
                    },
                    {
                        path: "student",
                        children: [
                            {
                                element: <Student />,
                                index: true
                            },
                            {
                                path: "courses",
                                element: <StudentAI />
                            }
                        ]
                    },
                    {
                        path: "courses",
                        children: [
                            {
                                index: true,
                                element: <Courses />
                            },
                            {
                                path: ":code",
                                element: <CourseDetail />,
                                loader: ({params}) => {return api.getCalendarCourse(params.code!)}
                            }
                        ]
                    },
                    {
                        path: "degrees",
                        element: <Degrees />
                    },
                    {
                        path: "ai",
                        loader: async () => [],
                        element: <Chat />
                    },
                    {
                        path: "/profile",
                        element: <Profile />
                    },
                    {
                        path: "/login",
                        element: <Navigate to='/' />
                    },
                    {
                        path: "*",
                        lazy: () => import("../pages/NoPage")
                    }
                ]
            }
        ])
    )
}

export default studentRouter