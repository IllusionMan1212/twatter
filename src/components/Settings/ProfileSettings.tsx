import {
    HStack,
    InputLeftAddon,
    VStack,
    Text,
    Flex,
    Button,
    ButtonGroup,
    useDisclosure,
} from "@chakra-ui/react";
import { ReactElement, useState } from "react";
import Input from "src/components/Controls/Input";
import { FileUpload } from "src/components/Controls/FileUpload";
import AttachmentPreview from "src/components/Attachments/AttachmentPreview";
import { MAX_ATTACHMENT_SIZE, SUPPORTED_PROFILE_IMAGE_TYPES } from "src/utils/constants";
import toast from "react-hot-toast";
import { useUserContext } from "src/contexts/userContext";
import { AxiosError } from "axios";
import { GenericBackendRes } from "src/types/server";
import Avatar from "src/components/User/Avatar";
import AvatarCropModal from "./AvatarCropModal";
import { axiosInstance } from "src/utils/axios";

interface UpdateProfileData {
    displayName: string;
    username: string;
}

export default function ProfileSettings(): ReactElement {
    const { user, mutate, deviceId } = useUserContext();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [previewImage, setPreviewImage] = useState({
        url: "",
        mimetype: "",
    });
    const [previewImageData, setPreviewImageData] = useState<ArrayBuffer | null>(null);
    const [croppedPreview, setCroppedPreview] = useState("");
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isSubmitting, setSubmitting] = useState(false);
    const [form, setForm] = useState<UpdateProfileData>({
        displayName: "",
        username: "",
    });

    const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files: File[] = Array.from(e.target.files as ArrayLike<File>);
        if (!files.length) {
            return;
        }

        if (!SUPPORTED_PROFILE_IMAGE_TYPES.includes(files[0].type)) {
            toast.error("Unsupported file format");
            return;
        }

        if (files[0].size > MAX_ATTACHMENT_SIZE) {
            toast.error("File size cannot exceed 8MB");
            return;
        }

        setPreviewImage({
            url: URL.createObjectURL(files[0]),
            mimetype: files[0].type
        });
        const arrBuf = await files[0].arrayBuffer();
        setPreviewImageData(arrBuf);
        onOpen();
    };

    const confirmCrop = (blob: Blob) => {
        setCroppedPreview(URL.createObjectURL(blob));
        setAttachment(new File([blob], `${user?.username}'s temp profile`));
        onClose();
    };

    const removeAttachment = () => {
        setPreviewImage({
            url: "",
            mimetype: ""
        });
        setCroppedPreview("");
        setAttachment(null);
    };

    const removeProfileImage = async () => {
        removeAttachment();
        try {
            await mutate(axiosInstance.delete("settings/remove-profile-image"), {
                optimisticData: { user: { ...user!, avatarURL: null }, deviceId },
                populateCache: false,
                revalidate: false,
                rollbackOnError: true,
            });
        } catch (e) {
            toast.error("An error has occurred while removing the profile image");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name;
        const value = e.target.value;
        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleSubmit = () => {
        if (!form.displayName && !form.username && !attachment) {
            toast.error("At least one field has to be changed");
            return;
        }

        setSubmitting(true);

        const payload = new FormData();
        if (attachment) {
            payload.append("profileImage", attachment);
        }
        payload.append("displayName", form.displayName);
        payload.append("username", form.username);

        axiosInstance
            .patch<GenericBackendRes>("settings/update-profile", payload)
            .then(async (res) => {
                setSubmitting(false);
                toast.success(res.data.message);
                await mutate();
                removeAttachment();
            })
            .catch((e: AxiosError<GenericBackendRes>) => {
                setSubmitting(false);
                toast.error(e.response?.data?.message ?? "An error has occurred");
            });
    };

    return (
        <VStack align="start" p={3} spacing={6}>
            <HStack width="full" spacing={3}>
                <Input
                    placeholder="Display Name"
                    name="displayName"
                    withLabel="Display Name"
                    max={25}
                    maxLength={25}
                    defaultValue={user?.displayName}
                    onChange={handleChange}
                />
            </HStack>
            <Input
                placeholder="Username"
                name="username"
                withLabel="Username"
                min={3}
                minLength={3}
                max={16}
                maxLength={16}
                defaultValue={user?.username}
                leftAddon={
                    <InputLeftAddon bgColor="text" color="textOpposite" border="none">
                        twatter.social/@
                    </InputLeftAddon>
                }
                onChange={handleChange}
            />
            <VStack width="full" align="start">
                <Input
                    placeholder="Email"
                    withLabel="Email"
                    defaultValue={user?.email}
                    disabled
                />
                <Text fontSize="xs" color="textMain">
                    Email can&apos;t be changed
                </Text>
            </VStack>
            <VStack width="full" align="start">
                <Text>Profile Photo</Text>
                <Flex
                    width="full"
                    direction={{ base: "column", md: "row" }}
                    align="center"
                    justify={{ base: "center", md: "initial" }}
                    gap={{ base: 3, md: 10 }}
                >
                    {!croppedPreview && (
                        <Avatar
                            src={user?.avatarURL}
                            alt={`${user?.username}'s avatar`}
                            width="150px"
                            height="150px"
                        />
                    )}
                    {croppedPreview && (
                        <AttachmentPreview
                            image={croppedPreview}
                            size="150px"
                            idx={0}
                            removeAttachment={removeAttachment}
                        />
                    )}
                    <ButtonGroup colorScheme="button" spacing={4}>
                        {user?.avatarURL ? (
                            <>
                                <FileUpload
                                    acceptedFileTypes="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                                    onInputChange={(e) => handleProfileImageChange(e)}
                                >
                                    Update
                                </FileUpload>
                                <Button variant="outline" onClick={removeProfileImage}>
                                    Remove
                                </Button>
                            </>
                        ) : (
                            <FileUpload
                                acceptedFileTypes="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                                onInputChange={(e) => handleProfileImageChange(e)}
                            >
                                Upload
                            </FileUpload>
                        )}
                    </ButtonGroup>
                </Flex>
            </VStack>
            <Button
                alignSelf="end"
                colorScheme="green"
                width="90px"
                isLoading={isSubmitting}
                loadingText="Saving"
                onClick={handleSubmit}
            >
                Save
            </Button>
            {isOpen ? (
                <AvatarCropModal
                    isOpen={isOpen}
                    onClose={onClose}
                    image={previewImage}
                    imageBytes={previewImageData}
                    onConfirmCrop={confirmCrop}
                />
            ) : null}
        </VStack>
    );
}
