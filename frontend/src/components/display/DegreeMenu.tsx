import { useState, useEffect } from 'react';
import { Input, Select, Spinner } from "@fluentui/react-components";
import { DegreeItem } from '../../types/degree';

let reboundActionAttacker: NodeJS.Timeout | null = null;

interface DegreeMenuProps {
    degrees: DegreeItem[]
    setDegrees: React.Dispatch<React.SetStateAction<any>>
    fetchDegrees: (skip: number, limit: number, query: string, searchType: string, options: string) => Promise<any>
    setCurrentDegree: React.Dispatch<React.SetStateAction<any>>
}

const DegreeMenu = ({ degrees, setDegrees, fetchDegrees, setCurrentDegree }: DegreeMenuProps) => {

    const [searchInput, setSearchInput] = useState<string>('')
    const [searchType, setSearchType] = useState<string>('title')
    const [searchCount, setSearchCount] = useState<number>(100)


    const updateItems = async () => {

        // embedding search after 5 sec of stop typing
        if (searchType === "Vector Embedding") {
            if (reboundActionAttacker) {
                clearTimeout(reboundActionAttacker)
            }
            reboundActionAttacker = setTimeout(async () => {
                console.log("Making vector search")
                const courses = await fetchDegrees(0, searchCount, searchInput, searchType, "")
                setDegrees(courses)
            }, 5000)
        } else {
            const courses = await fetchDegrees(0, searchCount, searchInput, searchType, "")
            setDegrees(courses)
        }
    }

    useEffect(() => {
        updateItems()
    }, [searchInput])

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
                        <option value="title">Name</option>
                        <option value="code">Code</option>
                        <option value="description">Description</option>
                        <option value="Vector Embedding">Vector Embedding</option>
                    </Select>
                    <Select
                        size="large"
                        appearance="underline"
                        defaultValue={100}
                        onChange={(e) => { setSearchCount(parseInt(e.currentTarget.value)) }}
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </Select>
                </div>
            </div>

            <div className="h-[calc(100vh-124px)] py-2 overflow-y-auto flex flex-col gap-4">
                {degrees.length !== 0 ? (
                    degrees.map(deg => (
                        <div
                            key={deg.code}
                            className="cursor-pointer mx-2 text-gray-200"
                            onClick={() => setCurrentDegree(deg)}
                        >
                            <p className="font-semibold text-lg">{deg.title}</p>
                            <p className="font-light text-sm">{deg.cred}</p>
                            {searchType === "Vector Embedding" && <p className="font-light text-red-400">{deg.similarity?.toString().substring(0, 5)}</p>}
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

export default DegreeMenu;