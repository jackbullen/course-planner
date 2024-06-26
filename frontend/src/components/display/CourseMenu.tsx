import { useState, useEffect, useContext, useRef, memo } from 'react';
import { Checkbox, Input, Select, Spinner } from "@fluentui/react-components";
import { CourseItem } from '../../types/course';
import { AuthContext, UserCoursesContext } from '../../App';
import api from '../../api/school';

let reboundActionAttacker: NodeJS.Timeout | null = null;

interface CourseMenuProps {
    items: CourseItem[]
    setItems: React.Dispatch<React.SetStateAction<any>>
    fetchItems: (skip: number, limit: number, query: string, searchType: string, options: string) => Promise<any>
    setCurrentItem: React.Dispatch<React.SetStateAction<any>>
    fall: boolean
    setFall: React.Dispatch<React.SetStateAction<boolean>>
    spring: boolean
    setSpring: React.Dispatch<React.SetStateAction<boolean>>
}

const CourseMenu = ({
    items, setItems, fetchItems, setCurrentItem,
    fall, setFall, spring, setSpring
}: CourseMenuProps) => {

    const { user } = useContext(AuthContext)
    const { userCourses } = useContext(UserCoursesContext)

    const [searchInput, setSearchInput] = useState<string>('')
    const [searchType, setSearchType] = useState<string>('name')
    const [searchCount, setSearchCount] = useState<number>(100)

    // I dont like it, but I cant find away around doing this...
    const [isInitialRender, setIsInitialRender] = useState(true)

    let terms = ""
    if (!fall) {
        terms += "&fall=0"
    }
    if (!spring) {
        terms += "&spring=0"
    }

    const updateItems = async () => {

        // embedding search after 5 sec of stop typing
        if (searchType === "Vector Embedding") {
            if (reboundActionAttacker) {
                clearTimeout(reboundActionAttacker)
            }
            reboundActionAttacker = setTimeout(async () => {
                console.log("Making vector search")
                const courses = await fetchItems(0, searchCount, searchInput, searchType, terms)
                setItems(courses)
            }, 5000)
        } else {
            const courses = await fetchItems(0, searchCount, searchInput, searchType, terms)
            setItems(courses)
        }
    }

    useEffect(() => {
        async function fetchUserDegreeCourses() {
            const data = await api.getUserAnalytics(user.degreeCode, user.specialization, userCourses)
            const upcomingCourses = data.upcomingCourses.map((course: any) => (
                {
                    ...course,
                    code: course._id,
                    sections: course.sections.map((section: any) => ({ ...section, crn: section._id }))
                }
            ))
            if (upcomingCourses.length > 0) {
                setItems(upcomingCourses)
            } else {
                updateItems()
            }
            console.log(data) // could still do something else with other user analytics
        }

        if (user.degreeCode && userCourses.length > 0) {
            fetchUserDegreeCourses()
            console.log(user.degreeCode)
            const courses: CourseItem[] = []
            setItems(courses)
        } else {
            console.log(user.degreeCode)
            updateItems()
        }

        setIsInitialRender(false)
    }, [])

    useEffect(() => {
        if (!isInitialRender) {
            updateItems()
        }
    }, [searchInput])

    let filteredItems = items
    if (!fall) {
        filteredItems = filteredItems.filter(c => c.sections.some(s => s.term === "202501"))
    }
    if (!spring) {
        filteredItems = filteredItems.filter(c => c.sections.some(s => s.term === "202409"))
    }
    if (!fall && !spring) {
        filteredItems = []
    }

    return (
        <div className="flex flex-col">
            <div className="text-xl">
                <Input
                    size="large"
                    autoComplete="off"
                    appearance="underline"
                    className="w-full h-12 sm:h-[36px] bg-gray-600"
                    placeholder="Search..."
                    onChange={(e) => { setSearchInput(e.currentTarget.value) }}
                />
                <div className="h-12 sm:h-[36px] flex flex-row text-black">
                    <Select
                        size="large"
                        appearance="underline"
                        className="w-full"
                        onChange={(e) => { setSearchType(e.currentTarget.value) }}
                    >
                        <option value="name">Name</option>
                        <option value="code">Code</option>
                        <option value="description">Description</option>
                        <option value="Vector Embedding">Vector Embedding</option>
                    </Select>
                </div>
            </div>

            <div className='flex border-b py-2 border-spacing-1'>
                <Checkbox
                    checked={fall}
                    label="Fall 2024"
                    onChange={() => { setFall((checked) => !checked) }}
                />
                <Checkbox
                    checked={spring}
                    label="Spring 2025"
                    onChange={() => { setSpring((checked) => !checked) }}
                />
                <Select appearance="underline" defaultValue={100} onChange={(e) => { setSearchCount(parseInt(e.currentTarget.value)) }}>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </Select>
            </div>
            <div className="h-[calc(100vh-166px)] py-2 overflow-y-auto flex flex-col gap-4">
                {filteredItems.length !== 0 ? (
                    filteredItems.map(item => (
                        <div
                            key={item.code}
                            className="cursor-pointer mx-2 text-gray-200"
                            onClick={() => setCurrentItem(item)}
                        >
                            <p className="font-semibold text-lg">{item.code}</p>
                            <p className="font-light text-sm">{item.name}</p>
                            {searchType === "Vector Embedding" && <p className="font-light text-red-400">{item.similarity?.toString().substring(0, 5)}</p>}
                        </div>
                    ))
                ) : (
                    <Spinner className="mt-10" />
                )
                }
            </div>
        </div>
    );
};

export default CourseMenu;