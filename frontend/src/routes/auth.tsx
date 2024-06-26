import { createBrowserRouter, Navigate } from "react-router-dom";

import Login from "../pages/Login"

const authRouter = () => {
    return (
        createBrowserRouter([
            {
                path: "/login",
                element: <Login />
            },
            {
                path: "*",
                element: <Navigate to="/login" />
            }
        ])
    )
}

export default authRouter