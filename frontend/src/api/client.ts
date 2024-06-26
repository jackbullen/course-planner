import axios from "axios"
import { NotAuthenticated } from "../App"

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://cosmongo.azurewebsites.net/'
})

apiClient.interceptors.request.use(
    config => {
        const user = localStorage.getItem("user")
        if (user) {
            config.headers['x-access-token'] = JSON.parse(user).token
        }
        return config
    },
    error => {
        return Promise.reject(error);
    }
)

apiClient.interceptors.response.use(response => {
    return response
}, error => {
    if (error.response.status === 401) {
        localStorage.setItem("user", JSON.stringify(NotAuthenticated))
        throw error
    }
})