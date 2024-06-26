import { AvatarNamedColor } from "@fluentui/react-components";

export type CodeCell = {
    label: string;
    icon: JSX.Element;
};

export type TitleCell = {
    label: string;
};

export type GradeCell = {
    label: number;
};

export type GradeLetterCell = {
    label: string;
    color: AvatarNamedColor;
};

export type GradePointCell = {
    label: number;
};

export type CreditsCell = {
    label: number;
    timestamp: number;
};

export type DataGridCourse = {
    code: CodeCell;
    title: TitleCell;
    grade: GradeCell;
    gradeLetter: GradeLetterCell;
    gradePoint: GradePointCell;
    credits: CreditsCell;
}