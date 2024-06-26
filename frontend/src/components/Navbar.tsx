import {
    Persona,
    Menu,
    MenuTrigger,
    MenuList,
    MenuItem,
    MenuPopover,
    Switch,
    MenuItemSwitch,
    // MenuItemSwitch
} from "@fluentui/react-components";
import { BookSearch24Filled } from '@fluentui/react-icons';
import { Link } from 'react-router-dom';
import { AuthContext, NotAuthenticated, RegisteredSectionsContext, UserCoursesContext, UserSettingsContext } from "../App";
import { useContext, useEffect } from "react";

const Header = () => {

    const { user, setUser } = useContext(AuthContext)
    const { boxedPrerequisites, setBoxedPrerequisites } = useContext(UserSettingsContext)
    const { setUserCourses } = useContext(UserCoursesContext)
    const { setRegisteredSections } = useContext(RegisteredSectionsContext)

    return (
        <div className="flex flex-row justify-between h-[48px] bg-primary-dark">
            <div className="hidden sm:flex px-5 w-[300px] flex-shrink-0 bg-primary items-center">
                <Link to="/" className="flex">
                    <BookSearch24Filled className="mt-1 mr-2" />
                    <h1 className="text-xl font-semibold">Course Planner</h1>
                </Link>
            </div>
            <div className="flex w-full justify-around text-md items-center">
                <Link to="/courses">Courses</Link>
                <Link to="/degrees">Degrees</Link>
                <Link to="/ai">Chat</Link>
            </div>
            {/* User menu for regular screen */}
            <div className="hidden sm:flex justify-around items-center w-[300px] flex-shrink-0 bg-primary bg-opacity-20">
                <Menu>
                    <MenuTrigger>
                        <Persona
                            name={user.name}
                            secondaryText={user.degree}
                            avatar={{
                                image: {
                                    src: user.pictureUrl,
                                },
                            }}
                        />
                    </MenuTrigger>
                    <MenuPopover>
                        <MenuList>
                            <Link to="profile"><MenuItem>Profile</MenuItem></Link>
                            <Link to="https://www.uvic.ca/" target="_blank"><MenuItem>Homepage</MenuItem></Link>
                            <Link to="https://bright.uvic.ca/" target="_blank"><MenuItem>Brightspace</MenuItem></Link>
                            <Menu>
                                <MenuTrigger>
                                    <MenuItem>Preferences</MenuItem>
                                </MenuTrigger>
                                <MenuPopover>
                                    <MenuList>
                                        <MenuItem
                                            persistOnClick={true}
                                            onClick={() => { setBoxedPrerequisites(e => !e) }}
                                        >
                                            Prerequisite Boxes
                                            <Switch
                                                checked={boxedPrerequisites}
                                            />
                                        </MenuItem>
                                    </MenuList>
                                </MenuPopover>
                            </Menu>
                            <MenuItem
                                onClick={() => {
                                    localStorage.removeItem('user')
                                    localStorage.removeItem('sessionId')
                                    setUser(NotAuthenticated)
                                    setUserCourses([])
                                    setRegisteredSections([])
                                }}
                            >
                                Logout
                            </MenuItem>
                        </MenuList>
                    </MenuPopover>
                </Menu>
            </div>
            {/* User menu for mobile */}
            <div className="flex sm:hidden justify-around items-center pr-4">
                <Menu>
                    <MenuTrigger>
                        <Persona
                            avatar={{
                                image: {
                                    src: user.pictureUrl,
                                },
                            }}
                        />
                    </MenuTrigger>
                    <MenuPopover>
                        <MenuList>
                            <Link to="/"><MenuItem>Home</MenuItem></Link>
                            <Link to="profile"><MenuItem>Profile</MenuItem></Link>
                            <Link to="https://www.uvic.ca/" target="_blank"><MenuItem>Homepage</MenuItem></Link>
                            <Link to="https://bright.uvic.ca/" target="_blank"><MenuItem>Brightspace</MenuItem></Link>
                            <Menu>
                                <MenuTrigger>
                                    <MenuItem>Preferences</MenuItem>
                                </MenuTrigger>
                                <MenuPopover>
                                    <MenuList>
                                        <MenuItem
                                            persistOnClick={true}
                                            onClick={() => { setBoxedPrerequisites(e => !e) }}
                                        >
                                            Prerequisite Boxes
                                            <Switch
                                                checked={boxedPrerequisites}
                                            />
                                        </MenuItem>
                                    </MenuList>
                                </MenuPopover>
                            </Menu>
                            <MenuItem
                                onClick={() => {
                                    localStorage.removeItem('user')
                                    localStorage.removeItem('sessionId')
                                    setUser(NotAuthenticated)
                                    setUserCourses([])
                                    setRegisteredSections([])
                                }}
                            >
                                Logout
                            </MenuItem>
                        </MenuList>
                    </MenuPopover>
                </Menu>
            </div>
        </div>
    );
}

export default Header;