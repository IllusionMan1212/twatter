import {
    Alert,
    AlertIcon,
    ButtonGroup,
    Wrap,
    Button,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    Spinner,
    Divider,
    Code,
} from "@chakra-ui/react";
import { AxiosError } from "axios";
import { FormEvent, ReactElement, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Input from "src/components/Controls/Input";
import Switch from "src/components/Controls/Switch";
import { useUserContext } from "src/contexts/userContext";
import { GenericBackendRes, GetBackupCodes, TwoFASecretRes } from "src/types/server";
import { Dialog } from "src/components/Dialog";
import { IBackupCode } from "src/types/interfaces";
import * as clipboard from "clipboard-polyfill";
import { axiosInstance } from "src/utils/axios";
import ModalHeader from "src/components/Modal/ModalHeader";

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
    const { mutate, user, deviceId } = useUserContext();

    const initialFocusRef = useRef(null);

    const [isLoading, setLoading] = useState(false);
    const [isSubmitting, setSubmitting] = useState(false);
    const [secret, setSecret] = useState("");
    const [qrcode, setQRcode] = useState("");
    const [passcode, setPasscode] = useState("");

    const handleSubmit = async (e: FormEvent<HTMLButtonElement | HTMLFormElement>) => {
        e.preventDefault();

        if (passcode.length !== 6) {
            toast.error("Passcode must be 6 digits");
            return;
        }

        setSubmitting(true);

        try {
            await mutate(axiosInstance.patch("settings/enable-2fa", { passcode }), {
                optimisticData: { user: { ...user!, twoFactorAuth: true }, deviceId },
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

            axiosInstance
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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            scrollBehavior="inside"
            initialFocusRef={initialFocusRef}
        >
            <ModalOverlay />
            <ModalContent bgColor="bgMain" pb={5}>
                <ModalHeader>
                    <p className="text-lg">Enable Two Factor Authentication with TOTP</p>
                </ModalHeader>
                <ModalCloseButton size="lg" />
                <ModalBody>
                    <div className="flex flex-col w-full gap-5 items-start">
                        {isLoading ? (
                            <div className="flex flex-col w-full gap-2 items-center">
                                <Spinner />
                            </div>
                        ) : (
                            <div className="flex flex-col w-full items-start gap-2">
                                <p>Scan this QR Code with your authenticator app</p>
                                <img
                                    className="self-center"
                                    src={qrcode}
                                    alt="2FA QR code"
                                    width="150"
                                    height="150"
                                />
                                <p className="break-all">
                                    Or input this secret key:{" "}
                                    <Code bgColor="bgSecondary">{secret}</Code>
                                </p>
                            </div>
                        )}
                        <Divider height="1px" bgColor="bgSecondary" />
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col items-end gap-3">
                                <p>
                                    After authenticating with the app, enter the passcode
                                    shown on the app below:
                                </p>
                                <Input
                                    ref={initialFocusRef}
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
                            </div>
                        </form>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

const Disable2FADialog = ({ isOpen, onClose }: TwoFADialogProps): ReactElement => {
    const { mutate, user, deviceId } = useUserContext();

    const handleDisable2FA = async () => {
        try {
            await mutate(axiosInstance.patch("settings/disable-2fa"), {
                optimisticData: { user: { ...user!, twoFactorAuth: false }, deviceId },
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

const BackupCodes = ({ isOpen, onClose }: TwoFADialogProps): ReactElement => {
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [codes, setCodes] = useState<IBackupCode[]>([]);

    const regenerateCodes = () => {
        axiosInstance.post<GetBackupCodes>("settings/generate-backup-codes")
            .then((res) => {
                setCodes(res.data.codes);
                toast.success(res.data.message);
            })
            .catch((err) => {
                toast.error(err.response?.data.message ?? "An error occurred while generating backup codes");
            });
    };

    const copyCodes = async () => {
        clipboard.writeText(codes.map((c) => c.hasBeenUsed ? `X ${c.code} (USED)` : `* ${c.code}`).join("\n\n"))
            .then(() => {
                toast.success("Copied Successfully");
            })
            .catch(() => {
                toast.error("Error while copying codes");
            });
    };

    const downloadCodes = () => {
        axiosInstance.get("settings/backup-codes/download", { responseType: "blob" })
            .then((res) => {
                const downloadedCodes = URL.createObjectURL(res.data);
                const link = document.createElement("a");
                link.href = downloadedCodes;
                link.setAttribute("download", "twatter-recovery-codes.txt");
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch((err) => {
                toast.error(err.response?.data.message ?? "An error occurred while downloading backup codes");
            });
    };

    const Loading = () => {
        return (
            <div className="flex flex-col w-full gap-2 items-center justify-center">
                <Spinner />
            </div>
        );
    };

    useEffect(() => {
        if (isOpen) {
            axiosInstance.get("settings/backup-codes")
                .then((res) => {
                    setCodes(res.data.codes);
                    setLoading(false);
                })
                .catch((err) => {
                    setError(err.response?.data.message ?? "An error occurred while fetching the backup codes");
                    setLoading(false);
                });
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent bgColor="bgMain">
                <ModalHeader>
                    <p>Backup Codes</p>
                </ModalHeader>
                <ModalCloseButton size="lg" />
                <ModalBody px={0}>
                    <div className="flex flex-col w-full gap-4 items-center">
                        <Alert status="info">
                            <AlertIcon />
                            Save your backup codes in a safe place. These codes will allow you to access your account in case you cannot use your second factor one-time code. If you cannot find these codes, you will lose access to your account!
                        </Alert>
                        {isLoading && (<Loading />)}
                        {error}
                        <div className="grid grid-cols-2 gap-6 self-center px-4">
                            <>
                                {codes.map((code) => (
                                    <div key={code.code}>
                                        <p className={code.hasBeenUsed ? "line-through" : ""}>{code.code}</p>
                                    </div>
                                ))}
                            </>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter justifyContent="start">
                    <ButtonGroup as={Wrap} variant="outline" colorScheme="button">
                        <Button onClick={downloadCodes}>
                            Download
                        </Button>
                        <Button onClick={copyCodes}>
                            Copy
                        </Button>
                        <Button onClick={regenerateCodes}>
                            Regenerate backup codes
                        </Button>
                    </ButtonGroup>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default function SecuritySettings(): ReactElement {
    const { user } = useUserContext();

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
    const {
        isOpen: isBackupCodesOpen,
        onOpen: onOpenBackupCodes,
        onClose: onCloseBackupCodes
    } = useDisclosure();

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

        axiosInstance
            .post<GenericBackendRes>("settings/change-password", form)
            .then((res) => {
                toast.success(res.data.message);
                setSubmitting(false);
            })
            .catch((err: AxiosError<GenericBackendRes>) => {
                toast.error(err.response?.data?.message ?? "An error has occurred");
                setSubmitting(false);
            });
    };

    return (
        <div className="flex flex-col w-full p-3 gap-6 items-start">
            <div className="flex w-full gap-2 items-center justify-between">
                <div className="flex flex-col items-start gap-2">
                    <p className="text-lg">Two-Factor Authentication</p>
                    <p className="text-sm text-[color:var(--chakra-colors-textMain)]">
                        Protect your account from unauthorized access by requiring a
                        second authentication method in addition to your password.
                    </p>
                    <p className="text-sm text-[color:var(--chakra-colors-textMain)]">
                        Toggling 2FA will log you out of all other devices for security reasons
                    </p>
                </div>
                <Switch
                    isChecked={user?.twoFactorAuth}
                    onChange={user?.twoFactorAuth ? onDisable2FA : onEnable2FA}
                />
            </div>
            {user?.twoFactorAuth && (
                <>
                    <p>We recommend viewing and saving your backup codes somewhere safe in the case you lose access to your 2FA generating device</p>
                    <Button colorScheme="button" onClick={onOpenBackupCodes}>
                        View 2FA Backup Codes
                    </Button>
                </>
            )}
            <Divider height="1px" bgColor="bgSecondary" />
            <p className="text-sm text-[color:var(--chakra-colors-textMain)]">
                Changing your password will automatically log you out of all your other devices for security reasons
            </p>
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
            {isBackupCodesOpen && (<BackupCodes isOpen={isBackupCodesOpen} onClose={onCloseBackupCodes} />)}
        </div>
    );
}
