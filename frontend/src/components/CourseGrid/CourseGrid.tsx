import {
    Avatar,
    DataGridBody,
    DataGridRow,
    DataGrid,
    DataGridHeader,
    DataGridHeaderCell,
    DataGridCell,
    TableCellLayout,
    TableColumnDefinition,
    createTableColumn,
    DataGridProps,
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogTitle,
    DialogContent,
    DialogBody,
    DialogActions,
    Input,
    Label,
    Button,
    Link,
    useToastController,
    Toast,
    ToastTrigger,
    ToastTitle,
    ToastFooter,
    useId,
    Toaster,
} from "@fluentui/react-components";
import { DataGridCourse } from "./types";
// import { DeleteRegular, EditRegular } from "@fluentui/react-icons";
import React, { useEffect } from "react";
import { getCourseIcon, getGradeColor, gradeToLetter, gradeToPoint } from "./Utils";
import { CompletedCourse } from "../../types/course";

const columns: TableColumnDefinition<DataGridCourse>[] = [
    createTableColumn<DataGridCourse>({
        columnId: "code",
        compare: (a, b) => {
            return a.code.label.localeCompare(b.code.label);
        },
        renderHeaderCell: () => {
            return "Code";
        },
        renderCell: (item) => {
            return (
                <TableCellLayout media={item.code.icon}>
                    {item.code.label}
                </TableCellLayout>
            );
        },
    }),
    createTableColumn<DataGridCourse>({
        columnId: "title",
        compare: (a, b) => {
            return a.title.label.localeCompare(b.title.label);
        },
        renderHeaderCell: () => {
            return "Title";
        },
        renderCell: (item) => {
            return (
                <TableCellLayout>
                    {item.title.label}
                </TableCellLayout>
            );
        },
    }),
    createTableColumn<DataGridCourse>({
        columnId: "credits",
        compare: (a, b) => {
            return a.credits.timestamp - b.credits.timestamp;
        },
        renderHeaderCell: () => {
            return "Credits";
        },

        renderCell: (item) => {
            return item.credits.label;
        },
    }),
    createTableColumn<DataGridCourse>({
        columnId: "gradeLetter",
        compare: (a, b) => {
            return b.grade.label - a.grade.label;
        },
        renderHeaderCell: () => {
            return "Grade";
        },
        renderCell: (item) => {
            return (
                <TableCellLayout
                    media={
                        <Avatar
                            aria-label={item.gradeLetter.label}
                            name={item.gradeLetter.label}
                            color={item.gradeLetter.color}
                        />
                    }
                >
                    <div className="hidden sm:inline">{item.grade.label}</div>
                </TableCellLayout>
            );
        },
    }),

];

export const getDataGridCourses = (courses: CompletedCourse[]) => {
    const dataGridCourses = (courses).map((course: CompletedCourse, i: number) => {
        const icon = getCourseIcon(course.code)
        const gradeColor = getGradeColor(course.grade)
        return {
            code: { label: course.code, icon: icon },
            title: { label: course.title },
            grade: { label: course.grade },
            gradeLetter: { label: course.gradeLetter, color: gradeColor },
            gradePoint: { label: course.gradePoint, status: "available" },
            credits: { label: course.credits, status: "available", timestamp: 1 },
        };
    });
    return dataGridCourses;
}

interface CourseGridProps {
    courses: CompletedCourse[]
    setCourses: React.Dispatch<React.SetStateAction<CompletedCourse[]>>
    // toasterId: string | undefined
}

const CourseGrid = ({ courses, setCourses }: CourseGridProps) => {
    const dataGridCourses = getDataGridCourses(courses)

    const [sortState, setSortState] = React.useState<
        Parameters<NonNullable<DataGridProps["onSortChange"]>>[1]
    >({
        sortColumn: "file",
        sortDirection: "ascending",
    });
    const onSortChange: DataGridProps["onSortChange"] = (e, nextSortState) => {
        setSortState(nextSortState);
    };

    const toasterId = useId("toaster");
    const { dispatchToast } = useToastController(toasterId);

    const recoverCourse = (course: DataGridCourse) => {
        const recoveredCourse: CompletedCourse = {
            code: course.code.label,
            title: course.title.label,
            grade: course.grade.label,
            gradeLetter: course.gradeLetter.label,
            gradePoint: course.gradePoint.label,
            credits: course.credits.label
        }
        setCourses(prev => [...prev, recoveredCourse])
    }

    const notify = (course: DataGridCourse) =>
        dispatchToast(
            <Toast>
                <ToastTitle
                    action={
                        <ToastTrigger>
                            <Link onClick={() => { recoverCourse(course) }}>Undo</Link>
                        </ToastTrigger>
                    }
                >
                    {course.code.label} removed
                </ToastTitle>
                <ToastFooter>
                    <ToastTrigger>
                        <Link>Dismiss</Link>
                    </ToastTrigger>
                </ToastFooter>
            </Toast>,
            { intent: "success" }
        );

    const onDeleteCourse = (toDelete: DataGridCourse) => {
        // if (window.confirm("Double check this course is incorrect.")) {
        setCourses(prev => prev.filter(c => c.code !== toDelete.code.label))
        notify(toDelete);
        // }
    }

    const handleEditCourse = (ev: React.FormEvent<HTMLFormElement>, toEdit: DataGridCourse) => {
        ev.preventDefault();
        const formData = new FormData(ev.currentTarget);
        const newCode = formData.get("code") as string;
        const newGrade = Number(formData.get("grade"));
        const editedCourse: CompletedCourse = {
            code: newCode,
            title: formData.get("title") as string,
            credits: Number(formData.get("credits")),
            grade: newGrade,
            gradeLetter: gradeToLetter(newGrade),
            gradePoint: gradeToPoint(newGrade),
        }
        setCourses(prev => prev.map(course => course.code === toEdit.code.label ? editedCourse : course));
    };

    useEffect(() => {
        console.log("Rerender CourseGrid?")
    },[])


    return (
        <div className="text-xs sm:text-base flex flex-col justify-between">
            {dataGridCourses.length !== 0 &&
                <DataGrid
                    width={100}
                    items={dataGridCourses}
                    columns={columns}
                    sortable
                    sortState={sortState}
                    onSortChange={onSortChange}
                >
                    <DataGridHeader>
                        <DataGridRow>
                            {({ renderHeaderCell }) => (
                                <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
                            )}
                        </DataGridRow>
                    </DataGridHeader>
                    <DataGridBody<DataGridCourse>>
                        {({ item, rowId }) => (
                            <div className="w-full">
                                <DataGridRow<DataGridCourse> key={rowId}>
                                    {({ renderCell }) => (
                                        <DataGridCell
                                            onClick={() => { document.getElementById("edit-" + item.code.label)?.click() }}
                                            className="my-1 sm:my-2 w-48 cursor-pointer"
                                        >
                                            {renderCell(item)}
                                        </DataGridCell>
                                    )}
                                </DataGridRow>
                                <div className="hidden flex flex-row gap-5 justify-around items-center">
                                    <Dialog modalType="non-modal">
                                        <DialogTrigger >
                                            <Button
                                                id={`edit-${item.code.label}`}
                                                className="hidden"
                                                appearance="transparent"
                                                size="small"
                                            // icon={<EditRegular />}
                                            />
                                        </DialogTrigger>
                                        <DialogSurface aria-describedby={undefined}>
                                            <form onSubmit={(e) => handleEditCourse(e, item)}>
                                                <DialogBody>
                                                    <DialogTitle>{item.code.label}</DialogTitle>
                                                    <DialogContent className="flex flex-col gap-1">
                                                        <Label>
                                                            Code
                                                        </Label>
                                                        <Input name="code" defaultValue={item.code.label} required />
                                                        <Label className="mt-2">
                                                            Title
                                                        </Label>
                                                        <Input name="title" defaultValue={item.title.label} />
                                                        <Label className="mt-2">
                                                            Credits
                                                        </Label>
                                                        <Input name="credits" defaultValue={item.credits.label.toString()} className="mb-4" />
                                                        <Label className="mt-2">
                                                            Grade
                                                        </Label>
                                                        <Input name="grade" defaultValue={item.grade.label.toString()} className="mb-4" />
                                                    </DialogContent>
                                                    <DialogTrigger disableButtonEnhancement>
                                                        <Button
                                                            style={{ backgroundColor: '#942c3c' }}
                                                            className="mr-auto w-20"
                                                            appearance="primary"
                                                            onClick={() => { document.getElementById("delete-" + item.code.label)?.click() }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogActions>
                                                        <DialogTrigger disableButtonEnhancement>
                                                            <Button appearance="secondary">Cancel</Button>
                                                        </DialogTrigger>
                                                        <DialogTrigger disableButtonEnhancement>
                                                            <Button type="submit" appearance="primary">Save</Button>
                                                        </DialogTrigger>
                                                    </DialogActions>
                                                </DialogBody>
                                            </form>
                                        </DialogSurface>
                                    </Dialog>
                                    <Button
                                        id={`delete-${item.code.label}`}
                                        className="hidden"
                                        appearance="transparent"
                                        size="small"
                                        // icon={<DeleteRegular />}
                                        onClick={(e) => { e.preventDefault(); onDeleteCourse(item) }}
                                    />
                                </div>
                            </div>
                        )}
                    </DataGridBody>
                </DataGrid>
            }
            <Toaster toasterId={toasterId} />
        </div>
    )
}

export default CourseGrid