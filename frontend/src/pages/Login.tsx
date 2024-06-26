import { useContext, useState } from "react"
import { AuthContext } from "../App"
import api from "../api/auth"
import {
    Button,
    Input,
    Spinner,
    Toast,
    ToastIntent,
    ToastTitle,
    Toaster,
    useId,
    useToastController
} from "@fluentui/react-components"
// import Spinner2 from "../components/Spinner2"

const Login = () => {
    const { setUser } = useContext(AuthContext)
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    // const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false)

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        // setIsLoggingIn(true)
        const user = await api.login(username, password)
        if (user.message) {
            cannotLoginNotify(user.message)
            // setIsLoggingIn(false)
        } else {
            setUser(user)
            localStorage.setItem("user", JSON.stringify(user))
        }
    }

    const cannotLoginToast = useId("cannot-login");
    const { dispatchToast } = useToastController(cannotLoginToast);
    const intent: ToastIntent = "error";
    const cannotLoginNotify = (message: string) => {
        dispatchToast(
            <Toast>
                <ToastTitle>{message}</ToastTitle>
            </Toast>,
            { intent }
        );
    }

    return (
        <>
            <div className="h-screen flex flex-col justify-center gap-10 items-center bg-blue-900">
                <div>
                    <div className="m-2 mb-4">
                        <h1 className="text-4xl">Welcome to my <br />Microsoft AI Learning Hackathon</h1>
                        <i className="text-xl">Hope that you enjoy your stay</i>
                    </div>
                    <div>
                        <form onSubmit={handleLogin}>
                            <div className="flex flex-col gap-4">
                                <Input
                                    name="username"
                                    type="text"
                                    size="large"
                                    onChange={(e) => setUsername(e.currentTarget.value)}
                                    placeholder="Enter your username"
                                />
                                <Input
                                    name="password"
                                    type="password"
                                    size="large"
                                    onChange={(e) => setPassword(e.currentTarget.value)}
                                    placeholder="Enter your password"
                                />
                                <Button type="submit" size="large">Login</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="fixed top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                {/* {isLoggingIn && <Spinner2 />} */}
            </div>
            {/* This div was inspired by browser developer tools getting imprinted onto screen, thought it lookes nice. */}
            {/* <div className="bg-blue-700 bg-opacity-10 fixed z-10 top-0 right-0 ttr w-[230px] h-full"></div> */}
            <div className="text-right border-2 border-dotted">
                <p>User: tony</p>
                <p>Password: bananas</p>
            </div>
            <Toaster toasterId={cannotLoginToast} />
        </>
    )
}

export default Login