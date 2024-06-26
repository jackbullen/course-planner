import React, { createContext, useState } from "react"
import { RouterProvider } from "react-router-dom"
import { routerBaker } from "./routes/router"
import { AuthenticatedUser } from "./types/auth"
import { CompletedCourse, SectionItem } from "./types/course"

export const NotAuthenticated = {
    _id: null,
    name: "",
    pictureUrl: "",
    chatSessions: [],
    degree: "",
    token: "",
    degreeCode: "",
    specialization: ""
}


interface AuthContextType {
    user: AuthenticatedUser
    setUser: React.Dispatch<React.SetStateAction<AuthenticatedUser>>
}
export const AuthContext = createContext(
    null as unknown as AuthContextType
)

interface UserSettingsContextType {
    boxedPrerequisites: boolean
    setBoxedPrerequisites: React.Dispatch<React.SetStateAction<boolean>>
}
export const UserSettingsContext = createContext(
    null as unknown as UserSettingsContextType
)

interface UserCoursesContextType {
    userCourses: CompletedCourse[]
    setUserCourses: React.Dispatch<React.SetStateAction<CompletedCourse[]>>
}
export const UserCoursesContext = createContext(
    null as unknown as UserCoursesContextType,
)

interface RegisteredSectionsContextType {
    registeredSections: SectionItem[]
    setRegisteredSections: React.Dispatch<React.SetStateAction<SectionItem[]>>
}
export const RegisteredSectionsContext = createContext(
    null as unknown as RegisteredSectionsContextType,
)

const App = () => {
    console.log("App loading")

    // Get user from local storage or set to null
    //  probably don't want to store user details here,
    //  but it is fine for this prototype, since there
    //  is no user registration. Realistically only
    //  thing that should be stored is the token
    const storedUser = localStorage.getItem("user")
    const [user, setUser] = useState<AuthenticatedUser>(
        storedUser ? JSON.parse(storedUser) : NotAuthenticated
    )

    const [userCourses, setUserCourses] = useState<CompletedCourse[]>([])
    const [registeredSections, setRegisteredSections] = useState<SectionItem[]>([])
    const [boxedPrerequisites, setBoxedPrerequisites] = useState<boolean>(false)

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            <UserCoursesContext.Provider value={{ userCourses, setUserCourses }}>
                <UserSettingsContext.Provider value={{ boxedPrerequisites, setBoxedPrerequisites }}>
                    <RegisteredSectionsContext.Provider value={{ registeredSections, setRegisteredSections }}>
                        <RouterProvider router={routerBaker(user)} />
                    </RegisteredSectionsContext.Provider>
                </UserSettingsContext.Provider>
            </UserCoursesContext.Provider>
        </AuthContext.Provider>
    )
}

export default App