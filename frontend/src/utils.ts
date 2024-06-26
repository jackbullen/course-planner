import { SectionItem } from "./types/course";

export const hasDayOverlap = (s1: SectionItem, s2: SectionItem) => {
    return (
        (s1.monday && s2.monday) ||
        (s1.tuesday && s2.tuesday) ||
        (s1.wednesday && s2.wednesday) ||
        (s1.thursday && s2.thursday) ||
        (s1.friday && s2.friday) ||
        (s1.saturday && s2.saturday) ||
        (s1.sunday && s2.sunday)
    )
}