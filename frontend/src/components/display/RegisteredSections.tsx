import { Button } from "@fluentui/react-components";
import { SectionItem } from '../../types/course';

interface RegisteredSectionsProps {
    registeredSections: SectionItem[]
    unregisterSection: (section: SectionItem) => void
    fall: boolean
    spring: boolean
}

const RegisteredSections = ({ registeredSections, unregisterSection, fall, spring }: RegisteredSectionsProps) => {
    const fallSections = registeredSections.filter(sec => sec.term === "202409")
    const springSections = registeredSections.filter(sec => sec.term === "202501")
    return (
        <div className="flex flex-col overflow-y-auto w-full gap-4">
            {fall && fallSections.length > 0 &&
                <div className="flex flex-col divide-y">
                    <p className="text-lg text-center">Fall 2024</p>
                    <div className="p-2 flex flex-col gap-4">
                        {fallSections.map(section => (
                            <RegisteredSection
                                key={section.crn}
                                section={section}
                                unregisterSection={unregisterSection}
                            />
                        ))}
                    </div>
                </div>
            }
            {spring && springSections.length > 0 &&
                <div className="flex flex-col divide-y">
                    <p className="text-lg text-center">Spring 2025</p>
                    <div className="p-2 flex flex-col gap-4">
                        {springSections.map(section => (
                            <RegisteredSection
                                key={section.crn}
                                section={section}
                                unregisterSection={unregisterSection}
                            />
                        ))}
                    </div>
                </div>
            }
        </div>
    );
};

interface RegisteredSectionProps {
    section: SectionItem
    unregisterSection: (section: SectionItem) => void
}

const RegisteredSection = ({ section, unregisterSection }: RegisteredSectionProps) => {
    return (
        <div className="cursor-pointer mx-2 text-gray-200" onClick={() => unregisterSection(section)}>
            <div className="flex justify-left">
                <div className="w-full">
                    <div className="flex justify-around items-center">
                        <p className="font-semibold text-base">{section.code} {section.seq}</p>
                        <p className="font-light text-sm">{section.days} {section.start}-{section.end}</p>
                    </div>
                    <p className="font-light text-sm text-center">{section.startDate} - {section.endDate}</p>
                </div>
                {/* <div className="my-2"> */}
                {/* <Button size="small" className="h-6" onClick={() => unregisterSection(section)}>Unregister</Button> */}
                {/* </div> */}
            </div>
        </div>
    )
}

export default RegisteredSections;