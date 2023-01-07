import { Modal, ModalBody, ModalContent, ModalOverlay } from "@chakra-ui/react";
import { ReactElement } from "react";
import toast from "react-hot-toast";
import ComposePost from "src/components/Post/ComposePost";

interface ComposePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    cb?: (() => void) | (() => Promise<void>);
}

export default function ComposePostModal({
    isOpen,
    onClose,
    cb,
}: ComposePostModalProps): ReactElement {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent bgColor="bgMain" py={4}>
                <ModalBody>
                    <ComposePost
                        cb={async () => {
                            await cb?.();
                            toast.success("Posted Successfully");
                            onClose();
                        }}
                        placeholder="What's on your mind..."
                        apiRoute="posts/create-post"
                    />
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
