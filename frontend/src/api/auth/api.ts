import { apiClient } from "../client"

async function login(username: string, password: string) {                        ////////
    const response = await apiClient.post(`/login?username=${username}&password=${password}`)
    return response.data
}

export default { login }