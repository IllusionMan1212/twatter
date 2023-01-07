import {
    Text,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    VStack,
    Button,
    HStack,
    Code,
    Flex,
    IconButton,
    Icon,
} from "@chakra-ui/react";
import { forwardRef, ReactElement, useState, Ref, createElement } from "react";
import Input, { InputProps } from "src/components/Controls/Input";
import DatePicker from "react-datepicker";
import Textarea from "src/components/Controls/Textarea";
import { FileUpload } from "src/components/Controls/FileUpload";

import "react-datepicker/dist/react-datepicker.css";
import { MAX_ATTACHMENT_SIZE, SUPPORTED_PROFILE_IMAGE_TYPES } from "src/utils/constants";
import toast from "react-hot-toast";
import { axiosAuth } from "src/utils/axios";
import { GenericBackendRes } from "src/types/server";
import { AxiosError } from "axios";
import { XIcon } from "@heroicons/react/outline";

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DatePickerInput = (props: InputProps, ref: Ref<HTMLInputElement>) => {
    return <Input ref={ref} {...props} />;
};

export default function AddEventModal({
    isOpen,
    onClose,
}: AddEventModalProps): ReactElement {
    const [attachment, setAttachment] = useState<File | null>(null);
    const [eventDate, setEventDate] = useState<Date | null>(
        new Date(Date.now() + 3600 * 24 * 1000),
    );
    const [isSubmitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        location: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const name = e.target.name;
        const value = e.target.value;
        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files: File[] = Array.from(e.target.files as ArrayLike<File>);

        if (!SUPPORTED_PROFILE_IMAGE_TYPES.includes(files[0].type)) {
            toast.error("Unsupported file format");
            return;
        }

        if (files[0].size > MAX_ATTACHMENT_SIZE) {
            toast.error("File size cannot exceed 8MB");
            return;
        }

        setAttachment(files[0]);
    };

    const handleSubmit = () => {
        if (!form.title || !form.location || !form.description || !eventDate) {
            toast.error("All fields must be filled");
            return;
        }

        setSubmitting(true);

        const payload = new FormData();
        if (attachment) {
            payload.append("image", attachment);
        }
        payload.append("title", form.title);
        payload.append("description", form.description);
        payload.append("location", form.location);
        payload.append("time", eventDate.toISOString());

        axiosAuth
            .post<GenericBackendRes>("events/add-event", payload)
            .then((res) => {
                toast.success(res.data.message);
                setSubmitting(false);
                onClose();
            })
            .catch((e: AxiosError<GenericBackendRes>) => {
                toast.error(
                    e.response?.data?.message ??
                        "An error occurred while submitting the event",
                );
                setSubmitting(false);
            });
    };

    const removeAttachment = () => {
        setAttachment(null);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent bgColor="bgMain">
                <ModalHeader>
                    <Text>Add an Event</Text>
                </ModalHeader>
                <ModalCloseButton size="lg" />
                <ModalBody>
                    <VStack width="full" align="end" spacing={5}>
                        <VStack width="full" spacing={3} align="start">
                            <Input
                                placeholder="Title"
                                name="title"
                                onChange={handleChange}
                            />
                            <DatePicker
                                selected={eventDate}
                                onChange={(date) => setEventDate(date)}
                                showTimeSelect
                                dateFormat="Pp"
                                placeholderText="Date and Time"
                                minDate={new Date(Date.now() + 3600 * 24 * 1000)}
                                timeIntervals={15}
                                strictParsing
                                customInput={createElement(forwardRef(DatePickerInput))}
                            />
                            <Input
                                placeholder="Location"
                                name="location"
                                onChange={handleChange}
                            />
                            <Flex width="full" wrap="wrap" gap={3}>
                                <FileUpload
                                    acceptedFileTypes="image/png,image/jpeg,image/jpg,image/webp"
                                    onInputChange={(e) => handleImageChange(e)}
                                    colorScheme="button"
                                >
                                    Upload Image
                                </FileUpload>
                                {attachment ? (
                                    <HStack flex="1" maxWidth="100%">
                                        <Code
                                            noOfLines={1}
                                            fontWeight="bold"
                                            bgColor="bgSecondary"
                                        >
                                            {attachment.name}
                                        </Code>{" "}
                                        <Text>selected</Text>
                                        <IconButton
                                            colorScheme="red"
                                            size="sm"
                                            aria-label="Remove Attachment"
                                            icon={<Icon as={XIcon} w={6} h={6} />}
                                            onClick={removeAttachment}
                                        />
                                    </HStack>
                                ) : null}
                            </Flex>
                            <Textarea
                                placeholder="Description"
                                name="description"
                                onChange={handleChange}
                            />
                        </VStack>
                        <Button
                            colorScheme="green"
                            isLoading={isSubmitting}
                            loadingText="Submitting"
                            onClick={handleSubmit}
                        >
                            Add
                        </Button>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
