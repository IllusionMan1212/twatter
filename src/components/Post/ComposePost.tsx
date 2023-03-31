import dynamic from "next/dynamic";
import { Button, ButtonGroup, Textarea, VStack } from "@chakra-ui/react";
import { Camera, NotePencil } from "@phosphor-icons/react";
import { ReactElement, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useUserContext } from "src/contexts/userContext";
import { GenericBackendRes } from "src/types/server";
import { MAX_ATTACHMENT_SIZE, SUPPORTED_ATTACHMENTS, POST_MAX_CHARS } from "src/utils/constants";
const AttachmentPreview = dynamic(
    () => import("src/components/Attachments/AttachmentPreview"),
);
import Avatar from "src/components/User/Avatar";
import { FileUpload } from "src/components/Controls/FileUpload";
import CharsRemaining from "src/components/CharsRemaining";
import { axiosInstance } from "src/utils/axios";

interface ComposePostProps {
    cb: () => Promise<void>;
    placeholder: string;
    apiRoute: string;
}

export default function ComposePost({
    cb,
    placeholder,
    apiRoute,
}: ComposePostProps): ReactElement {
    const { user } = useUserContext();

    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isSubmitting, setSubmitting] = useState(false);
    const [hasText, setHasText] = useState(false);
    const [charsLeft, setCharsLeft] = useState(POST_MAX_CHARS);

    const composePostRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && e.ctrlKey) {
            e.preventDefault();
            submitPost();
            return;
        }
    };

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files: File[] = Array.from(e.target.files as ArrayLike<File>);
        let anyUnsupported = false;
        let anyTooBig = false;

        if (files.length > 4 || files.length + attachments.length > 4) {
            toast.error("Cannot upload more than 4 attachments");
            return;
        }

        for (let i = 0; i < files.length; i++) {
            if (files[i].size > MAX_ATTACHMENT_SIZE) {
                anyTooBig = true;
                continue;
            }

            if (!SUPPORTED_ATTACHMENTS.includes(files[i].type)) {
                anyUnsupported = true;
                continue;
            }

            setPreviewImages((images) => {
                return [...images, URL.createObjectURL(files[i])];
            });

            setAttachments((attachments) => {
                return [...attachments, files[i]];
            });
        }

        if (anyUnsupported && anyTooBig) {
            toast.error(
                "Some files exceed the maximum allowed size (8MB) while others are unsupported",
            );
        } else if (anyUnsupported) {
            toast.error("Some file(s) are unsupported");
        } else if (anyTooBig) {
            toast.error("Some file(s) exceed the maximum allowed size (8MB)");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.parentElement!.dataset.value = e.target.value;
        setHasText(!!e.target.value.trim());
        setCharsLeft(POST_MAX_CHARS - e.target.value.length);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        if (e.clipboardData.files.item(0)) {
            const file = e.clipboardData.files.item(0);

            if (attachments.length === 4) {
                toast.error("Cannot upload more than 4 attachments");
                return;
            }

            if (!file || !SUPPORTED_ATTACHMENTS.includes(file.type)) {
                toast.error("Unsupported file format");
                return;
            }

            if (file.size > MAX_ATTACHMENT_SIZE) {
                toast.error("File size cannot exceed 8MB");
                return;
            }

            setPreviewImages((images) => {
                return [...images, URL.createObjectURL(file)];
            });

            setAttachments((attachments) => {
                return [...attachments, file];
            });
        }
    };

    const removeAttachment = (idx: number) => {
        const temp = [...previewImages];
        temp.splice(idx, 1);
        setPreviewImages(temp);

        const temp2 = [...attachments];
        temp2.splice(idx, 1);
        setAttachments(temp2);
    };

    const submitPost = () => {
        if (
            composePostRef.current &&
            (composePostRef.current?.value.trim().length || attachments.length) &&
            charsLeft >= 0
        ) {
            setSubmitting(true);
            setAttachments([]);
            setPreviewImages([]);

            const payload = new FormData();

            payload.append("content", composePostRef.current?.value?.trim() ?? "");
            attachments.forEach((a) => payload.append("attachments", a));

            composePostRef.current.value = "";
            setHasText(false);
            setCharsLeft(POST_MAX_CHARS);

            axiosInstance
                .post<GenericBackendRes>(apiRoute, payload)
                .then(async () => {
                    setSubmitting(false);
                    await cb();
                })
                .catch((e) => {
                    toast.error(
                        e.response?.data.message ??
                            "An error occurred while submitting your post",
                    );
                    setSubmitting(false);
                });
        }
    };

    return (
        <div className="flex flex-col space-y-4 items-start w-full">
            <VStack
                bgColor="bgPrimary"
                borderRadius="compose"
                p={4}
                spacing={6}
                align="start"
                width="full"
                border="1px solid"
                borderColor="bgSecondary"
                _hover={{ borderColor: "gray.400" }}
                _focusWithin={{
                    borderColor: "button.400",
                    boxShadow: "0 0 0 1px var(--chakra-colors-button-400)",
                }}
            >
                <div className="flex items-start gap-4 w-full">
                    <div className="flex flex-col items-center gap-2">
                        <Avatar
                            src={user?.avatarURL}
                            alt={`${user?.username}'s avatar`}
                            width="40px"
                            height="40px"
                        />
                        <CharsRemaining charsLeft={charsLeft} type="Post" />
                    </div>
                    <Textarea
                        ref={composePostRef}
                        placeholder={placeholder}
                        resize="none"
                        border="none"
                        px={0}
                        _focusVisible={{ border: "none" }}
                        _placeholder={{ color: "textMain", opacity: 0.8 }}
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        onPaste={handlePaste}
                    />
                </div>
                <div className="flex flex-wrap gap-4 w-full">
                    {previewImages.map((image, i) => (
                        <AttachmentPreview
                            key={i}
                            image={image}
                            idx={i}
                            removeAttachment={removeAttachment}
                        />
                    ))}
                </div>
            </VStack>
            <ButtonGroup size="sm" colorScheme="button">
                <Button
                    width={32}
                    rounded="lg"
                    rightIcon={<NotePencil weight="bold" size="22" />}
                    isDisabled={(!hasText && !attachments.length) || isSubmitting || charsLeft < 0}
                    isLoading={isSubmitting}
                    loadingText="Creating"
                    onClick={submitPost}
                >
                    Post
                </Button>
                <FileUpload
                    variant="outline"
                    rounded="lg"
                    rightIcon={<Camera weight="bold" size="22" />}
                    isDisabled={isSubmitting}
                    acceptedFileTypes="image/png,image/jpeg,image/jpg,image/webp"
                    multiple
                    onInputChange={(e) => handleAttachmentChange(e)}
                >
                    Media
                </FileUpload>
            </ButtonGroup>
        </div>
    );
}
