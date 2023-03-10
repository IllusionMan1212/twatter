import { ReactElement, useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalHeader,
    ModalCloseButton,
    RadioGroup,
    Radio,
    ModalFooter,
    Button,
    ButtonGroup,
} from "@chakra-ui/react";
import Textarea from "./Controls/Textarea";
import { axiosAuth } from "src/utils/axios";
import { toast } from "react-hot-toast";
import { GenericBackendRes } from "src/types/server";
import { AxiosError, isAxiosError } from "axios";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
}

export default function ReportModal({ isOpen, onClose, postId }: ReportModalProps): ReactElement {
    const [reason, setReason] = useState("");
    const [comments, setComments] = useState("");
    const [isSubmitting, setSubmitting] = useState(false);

    const submitReport = () => {
        setSubmitting(true);
        axiosAuth.post<GenericBackendRes>("posts/report", { postId, reason, comments })
            .then((res) => {
                onClose();
                setSubmitting(false);
                setReason("");
                setComments("");
                toast.success(res.data.message);
            })
            .catch((err) => {
                if (isAxiosError(err)) {
                    const e = AxiosError.from<GenericBackendRes>(err);
                    toast.error(e.response?.data.message ?? "An error occurred while submitting the report");
                } else {
                    toast.error("An error occurred while submitting the report");
                }
                setSubmitting(false);
            });
    };

    return (
        <Modal isOpen={isOpen} size="lg" isCentered onClose={onClose}>
            <ModalOverlay />
            <ModalContent bgColor="bgMain">
                <ModalCloseButton />
                <ModalHeader>
                    <p>Report Post</p>
                </ModalHeader>
                <ModalBody>
                    <p className="text-[color:var(--chakra-colors-textMain)] mb-3">
                        Please select the reason you&apos;re submitting this report:
                    </p>
                    <RadioGroup name="reason" onChange={setReason} value={reason} mb={6} colorScheme="yellow">
                        <div className="flex flex-col gap-2">
                            <Radio value="nudity-sex">Nudity or Sexual Acts</Radio>
                            <Radio value="terrorism-violence">Terrorism or Violence</Radio>
                            <Radio value="spam">Spam</Radio>
                            <Radio value="other">Other</Radio>
                        </div>
                    </RadioGroup>
                    <p className="text-[color:var(--chakra-colors-textMain)]">
                        Additional Comments: {reason === "other" && "(You must provide your reasoning when selecting \"Other\")"}
                    </p>
                    <Textarea rows={3} onChange={(e) => setComments(e.target.value)} />
                </ModalBody>
                <ModalFooter>
                    <ButtonGroup size="sm" colorScheme="button">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            isDisabled={!reason.length || (reason === "other" && !comments.length)}
                            isLoading={isSubmitting}
                            onClick={submitReport}
                        >
                            Submit
                        </Button>
                    </ButtonGroup>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
