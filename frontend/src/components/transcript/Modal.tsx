import React from "react";
import {
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogContent,
    DialogBody,
} from "@fluentui/react-components";


interface ModalProps {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    content: JSX.Element
    title?: string
}

const Modal = ({ open, setOpen, content, title }: ModalProps) => {
    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(event, data) => {
                    setOpen(data.open)
                }}
            >
                <DialogSurface>
                    <DialogBody>
                        {title && <DialogTitle>{title}</DialogTitle>}
                        <DialogContent>
                            {content}
                        </DialogContent>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </>
    )
}

export default Modal