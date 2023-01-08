import {
    Box,
    ButtonGroup,
    IconButton,
    Textarea,
    Icon,
    forwardRef,
} from "@chakra-ui/react";
import { ReactElement, useState } from "react";
import AttachmentPreview from "src/components/Attachments/AttachmentPreview";
import Avatar from "src/components/User/Avatar";
import { IconFileUpload } from "src/components/Controls/FileUpload";
import { useUserContext } from "src/contexts/userContext";
import { GenericBackendRes } from "src/types/server";
import { axiosAuth } from "src/utils/axios";
import toast from "react-hot-toast";
import { MAX_ATTACHMENT_SIZE, SUPPORTED_ATTACHMENTS } from "src/utils/constants";
import { Camera, NotePencil } from "phosphor-react";

interface CommentBoxProps {
    parentPostId: string;
    cb: () => Promise<void>;
}

const CommentBox = forwardRef<CommentBoxProps, "textarea">(function CommentBox(
    { parentPostId, cb },
    ref,
): ReactElement {
    const { user } = useUserContext();

    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isSubmitting, setSubmitting] = useState(false);
    const [hasText, setHasText] = useState(false);

    const submitPost = () => {
        if (typeof ref === "function") return;

        if (ref?.current && (ref.current?.value.trim().length || attachments.length)) {
            setSubmitting(true);
            setAttachments([]);
            setPreviewImages([]);

            const payload = new FormData();

            payload.append("content", ref.current?.value?.trim() ?? "");
            payload.append("parentId", parentPostId);
            attachments.forEach((a) => payload.append("attachments", a));

            ref.current.value = "";
            setHasText(false);

            axiosAuth
                .post<GenericBackendRes>("posts/create-post", payload)
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
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && e.ctrlKey) {
            e.preventDefault();
            submitPost();
            return;
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

    return (
        <div className="flex flex-col w-full px-5 space-y-4">
            {previewImages.length > 0 ? (
                <div className="flex w-full gap-4">
                    {previewImages.map((image, i) => (
                        <AttachmentPreview
                            key={i}
                            image={image}
                            idx={i}
                            removeAttachment={removeAttachment}
                        />
                    ))}
                </div>
            ) : null}
            <div className="flex flex-wrap w-full justify-end gap-2">
                <div className="flex items-start gap-2 w-full xs:flex-1">
                    <Avatar
                        src={user?.avatarURL}
                        alt={`${user?.username}'s avatar`}
                        width="40px"
                        height="40px"
                    />
                    <Box
                        // some weird hack to have the input expand vertically how we want it to
                        sx={{
                            "&::after": {
                                content: "attr(data-value) \" \"",
                                visibility: "hidden",
                                whiteSpace: "pre-wrap",
                                gridArea: "1/1",
                                wordWrap: "anywhere",
                            },
                        }}
                        transitionProperty="var(--chakra-transition-property-common)"
                        transitionDuration="var(--chakra-transition-duration-normal)"
                        rounded="10px"
                        bgColor="bgSecondary"
                        width="full"
                        maxHeight="100px"
                        border="1px solid"
                        borderColor="stroke"
                        overflow="auto"
                        display="inline-grid"
                        alignItems="stretch"
                        _hover={{ borderColor: "button.400" }}
                        _focusWithin={{
                            borderColor: "text",
                            boxShadow: "0 0 0 1px var(--chakra-colors-text)",
                        }}
                    >
                        <Textarea
                            ref={ref}
                            placeholder="Leave a comment..."
                            rows={1}
                            border="0px"
                            resize="none"
                            gridArea="1/1"
                            focusBorderColor="none"
                            _placeholder={{ color: "textMain", opacity: 0.8 }}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                        />
                    </Box>
                </div>
                <ButtonGroup colorScheme="button">
                    <IconFileUpload
                        variant="outline"
                        rounded="lg"
                        aria-label="Add Media"
                        icon={<Camera weight="bold" size="22" />}
                        disabled={isSubmitting}
                        acceptedFileTypes="image/png,image/jpeg,image/jpg,image/webp"
                        multiple
                        onInputChange={(e) => handleAttachmentChange(e)}
                    />
                    <IconButton
                        size="md"
                        aria-label="Create Comment"
                        icon={<Icon as={NotePencil} w={6} h={6} />}
                        disabled={(!hasText && !attachments.length) || isSubmitting}
                        onClick={submitPost}
                    />
                </ButtonGroup>
            </div>
        </div>
    );
});

export default CommentBox;
