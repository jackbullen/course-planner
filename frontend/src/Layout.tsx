import { Outlet, NavLink, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthenticatedUser } from "./types/auth";

interface LayoutProps {
    auth: AuthenticatedUser
}

const Layout = ({ auth }: LayoutProps) => {
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    );
};

export default Layout;
