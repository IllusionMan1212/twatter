import {
    HStack,
    VStack,
    Text,
    Button,
    Image,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    Spinner,
    Divider,
    Code,
} from "@chakra-ui/react";
import { AxiosError } from "axios";
import { ReactElement, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Input from "src/components/Controls/Input";
import Switch from "src/components/Controls/Switch";
import { useUserContext } from "src/contexts/userContext";
import { GenericBackendRes, TwoFASecretRes } from "src/types/server";
import { axiosAuth } from "src/utils/axios";
import { Dialog } from "src/components/Dialog";

interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    newPasswordConfirm: string;
}

interface TwoFAModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TwoFADialogProps = TwoFAModalProps;

const TwoFAModal = ({ isOpen, onClose }: TwoFAModalProps): ReactElement => {
    const { mutate, user } = useUserContext();

    const [isLoading, setLoading] = useState(false);
    const [isSubmitting, setSubmitting] = useState(false);
    const [secret, setSecret] = useState("");
    const [qrcode, setQRcode] = useState("");
    const [passcode, setPasscode] = useState("");

    const handleSubmit = async () => {
        if (passcode.length !== 6) {
            toast.error("Passcode must be 6 digits");
            return;
        }

        setSubmitting(true);

        try {
            await mutate(axiosAuth.patch("settings/enable-2fa", { passcode }), {
                optimisticData: { user: { ...user, twoFactorAuth: true } },
                populateCache: false,
                revalidate: false,
                rollbackOnError: true,
            });
            toast.success("Successfully enabled 2FA");
            onClose();
            setSubmitting(false);
        } catch (e) {
            toast.error(
                (e as AxiosError<GenericBackendRes>).response?.data.message ??
                    "An error occurred while enabling 2FA",
            );
            onClose();
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setLoading(true);

            axiosAuth
                .get<TwoFASecretRes>("settings/generate-totp-secret")
                .then((res) => {
                    setSecret(res.data.secret);
                    setQRcode(res.data.qrcode);
                    setLoading(false);
                })
                .catch((e: AxiosError<GenericBackendRes>) => {
                    toast.error(e.response?.data?.message ?? "An error has occurred");
                });
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent bgColor="bgMain" pb={5}>
                <ModalHeader>
                    <Text fontSize="lg">Enable Two Factor Authentication with TOTP</Text>
                </ModalHeader>
                <ModalCloseButton size="lg" />
                <ModalBody>
                    <VStack width="full" alignItems="start" spacing={5}>
                        {isLoading ? (
                            <VStack width="full">
                                <Spinner />
                            </VStack>
                        ) : (
                            <VStack width="full" alignItems="start">
                                <Text>Scan this QR Code with your authenticator app</Text>
                                <Image
                                    src={qrcode}
                                    alt="2FA QR code"
                                    width="150"
                                    height="150"
                                    alignSelf="center"
                                />
                                <Text wordBreak="break-word">
                                    Or input this secret key:{" "}
                                    <Code bgColor="bgSecondary">{secret}</Code>
                                </Text>
                            </VStack>
                        )}
                        <Divider height="1px" bgColor="bgSecondary" />
                        <VStack alignItems="end" spacing={3}>
                            <Text>
                                After authenticating with the app, enter the passcode
                                shown on the app below:
                            </Text>
                            <Input
                                placeholder="Passcode"
                                name="passcode"
                                type="number"
                                onChange={(e) => setPasscode(e.target.value)}
                            />
                            <Button
                                colorScheme="accent"
                                isLoading={isSubmitting}
                                loadingText="Verifying"
                                onClick={handleSubmit}
                            >
                                Verify
                            </Button>
                        </VStack>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

const Disable2FADialog = ({ isOpen, onClose }: TwoFADialogProps): ReactElement => {
    const { mutate, user } = useUserContext();

    const handleDisable2FA = async () => {
        try {
            await mutate(axiosAuth.patch("settings/disable-2fa"), {
                optimisticData: { user: { ...user, twoFactorAuth: false } },
                populateCache: false,
                revalidate: false,
                rollbackOnError: true,
            });
        } catch (e) {
            toast.error("An error occurred while disabling 2fa");
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            header="Disable Two Factor Authentication?"
            message="Are you sure you want to disable Two Factor Authentication?"
            btnColor="red"
            confirmationBtnTitle="Disable"
            handleConfirmation={handleDisable2FA}
        />
    );
};

export default function SecuritySettings(): ReactElement {
    const { user, logout } = useUserContext();

    const [isSubmitting, setSubmitting] = useState(false);
    const {
        isOpen: isEnable2FAOpen,
        onOpen: onEnable2FA,
        onClose: onCloseEnable2FA,
    } = useDisclosure();
    const {
        isOpen: isDisable2FAOpen,
        onOpen: onDisable2FA,
        onClose: onCloseDisable2FA,
    } = useDisclosure();
    const [form, setForm] = useState<ChangePasswordData>({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name;
        const value = e.target.value;
        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleSubmit = () => {
        if (!form.currentPassword || !form.newPassword || !form.newPasswordConfirm) {
            toast.error("All fields must be set");
            return;
        }

        if (form.newPassword.length < 8) {
            toast.error("Password must consist of at least 8 characters");
            return;
        }

        if (form.newPassword !== form.newPasswordConfirm) {
            toast.error("Passwords don't match");
            return;
        }

        setSubmitting(true);

        axiosAuth
            .post<GenericBackendRes>("settings/change-password", form)
            .then((res) => {
                toast.success(res.data.message);
                logout();
                setSubmitting(false);
            })
            .catch((err: AxiosError<GenericBackendRes>) => {
                toast.error(err.response?.data?.message ?? "An error has occurred");
                setSubmitting(false);
            });
    };

    return (
        <VStack align="start" width="full" p={3} spacing={6}>
            <HStack width="full" justify="space-between">
                <VStack align="start">
                    <Text fontSize="lg">Two-Factor Authentication</Text>
                    <Text fontSize="sm" color="textMain">
                        Protect your account from unauthorized access by requiring a
                        second authentication method in addition to your password.
                    </Text>
                </VStack>
                <Switch
                    isChecked={user?.twoFactorAuth}
                    onChange={user?.twoFactorAuth ? onDisable2FA : onEnable2FA}
                />
            </HStack>
            <Input
                placeholder="Current Password"
                name="currentPassword"
                withLabel="Current Password"
                type="password"
                onChange={handleChange}
            />
            <Input
                placeholder="New Password"
                name="newPassword"
                withLabel="New Password"
                type="password"
                onChange={handleChange}
            />
            <Input
                placeholder="Confirm New Password"
                name="newPasswordConfirm"
                withLabel="Confirm New Password"
                type="password"
                onChange={handleChange}
            />
            <Button
                colorScheme="button"
                isLoading={isSubmitting}
                loadingText="Updating password"
                onClick={handleSubmit}
            >
                Change Password
            </Button>
            <TwoFAModal isOpen={isEnable2FAOpen} onClose={onCloseEnable2FA} />
            <Disable2FADialog isOpen={isDisable2FAOpen} onClose={onCloseDisable2FA} />
        </VStack>
    );
}
