import { AuthenticatedUser } from "../types/auth"

import authRouter from "./auth"
import studentRouter from "./student"

export const routerBaker = (auth: AuthenticatedUser) => {
    if (!auth._id) return authRouter()
    else return studentRouter(auth)
}