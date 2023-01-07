import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    ButtonGroup,
} from "@chakra-ui/react";
import { ReactElement, useRef } from "react";

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    header: string;
    message: string;
    btnColor: string;
    confirmationBtnTitle: string;
    handleConfirmation: () => void;
}

export function Dialog({ isOpen, onClose, ...props }: DialogProps): ReactElement {
    const cancelRef = useRef(null);

    const handleConfirmation = () => {
        onClose();
        props.handleConfirmation();
    };

    return (
        <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
            <AlertDialogOverlay>
                <AlertDialogContent bgColor="bgMain">
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        {props.header}
                    </AlertDialogHeader>
                    <AlertDialogBody>{props.message}</AlertDialogBody>
                    <AlertDialogFooter>
                        <ButtonGroup>
                            <Button
                                colorScheme="grey"
                                color="text"
                                ref={cancelRef}
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                colorScheme={props.btnColor}
                                onClick={handleConfirmation}
                            >
                                {props.confirmationBtnTitle}
                            </Button>
                        </ButtonGroup>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
}
