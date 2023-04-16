import {
    Button,
    Icon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalOverlay,
    useDisclosure,
} from "@chakra-ui/react";
import { EyeOffIcon, EyeIcon } from "@heroicons/react/solid";
import { FormEvent, ReactElement, useRef, useState } from "react";
import Input from "src/components/Controls/Input";
import NextLink from "next/link";
import toast from "react-hot-toast";
import { GenericBackendRes, LoginRes } from "src/types/server";
import axios, { AxiosError } from "axios";
import { useUserContext } from "src/contexts/userContext";
import ModalHeader from "src/components/Modal/ModalHeader";

interface LoginData {
    username: string;
    password: string;
}

interface TwoFAModalProps {
    isOpen: boolean;
    onClose: () => void;
    twoFAToken: string;
}

const TwoFAModal = ({ isOpen, onClose, twoFAToken }: TwoFAModalProps): ReactElement => {
    const { login } = useUserContext();

    const initialFocusRef = useRef(null);

    const [passcode, setPasscode] = useState("");
    const [isSubmitting, setSubmitting] = useState(false);
    const [isDisabled, setDisabled] = useState(false);
    const [usingRecovery, setUsingRecovery] = useState(false);

    const handleSubmit = (e: FormEvent<HTMLButtonElement | HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setDisabled(true);

        axios.post<LoginRes>(
            `settings/${usingRecovery ? "verify-recovery-code" : "verify-totp-code"}`,
            { passcode },
            { headers: { Authorization: `Bearer ${twoFAToken}` } },
        )
            .then((res) => {
                toast.success(res.data.message);
                setSubmitting(false);
                login(res.data.user, res.data.deviceId);
            })
            .catch((e: AxiosError<GenericBackendRes>) => {
                toast.error(e.response?.data?.message ?? "An error has occurred");
                setSubmitting(false);
                setDisabled(false);
            });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            scrollBehavior="inside"
            initialFocusRef={initialFocusRef}
        >
            <ModalOverlay />
            <ModalContent bgColor="bgMain" pb={5}>
                <ModalHeader>
                    <p className="text-lg">
                        {usingRecovery ? "Recovery code" : "Two-factor authentication"}
                    </p>
                </ModalHeader>
                <ModalCloseButton size="lg" />
                <ModalBody>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col w-full items-start gap-4">
                            <p>{usingRecovery ? "Input one of your unused recovery codes" : "Input your 2FA code below"}</p>
                            <Input
                                ref={initialFocusRef}
                                placeholder={usingRecovery ? "XXXXXX-XXXXXX" : "6-digit two-factor authentication code"}
                                onChange={(e) => setPasscode(e.target.value)}
                            />
                            <p className="text-sm hover:cursor-pointer hover:underline usernameLink" onClick={() => setUsingRecovery(!usingRecovery)}>
                                {usingRecovery ? "Have access to your authenticator app again?. Click here" : "Lost access to your authenticator app? Log in with a recovery code"}
                            </p>
                            <Button
                                colorScheme="accent"
                                disabled={isDisabled}
                                isLoading={isSubmitting}
                                loadingText="Verifying"
                                onClick={handleSubmit}
                            >
                                Verify
                            </Button>
                        </div>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default function LoginForm(): ReactElement {
    const { login } = useUserContext();

    const [form, setForm] = useState<LoginData>({
        username: "",
        password: "",
    });

    const [passwordHidden, setPasswordHidden] = useState(true);
    const [isSubmitting, setSubmitting] = useState(false);
    const [isDisabled, setDisabled] = useState(false);
    const [twoFAToken, setTwoFaToken] = useState("");
    const { isOpen, onOpen: onOpen2FAModal, onClose } = useDisclosure();

    const togglePassword = () => setPasswordHidden((hidden) => !hidden);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name;
        const value = e.target.value;
        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleSubmit = (e: FormEvent<HTMLButtonElement | HTMLFormElement>) => {
        e.preventDefault();

        if (!form.username || !form.password) {
            toast.error("All fields must be set");
            return;
        }

        setSubmitting(true);
        setDisabled(true);

        axios
            .post<LoginRes>("auth/login", form)
            .then((res) => {
                if (res.data.requiresTwoFactorAuth) {
                    setTwoFaToken(res.data.twoFactorToken);
                    onOpen2FAModal();
                    setSubmitting(false);
                    setDisabled(false);
                } else {
                    toast.success(res.data.message);
                    setSubmitting(false);
                    login(res.data.user, res.data.deviceId);
                }
            })
            .catch((err: AxiosError<GenericBackendRes>) => {
                toast.error(err.response?.data?.message ?? "An error has occurred");
                setSubmitting(false);
                setDisabled(false);
            });
    };

    return (
        <div className="flex flex-col gap-10 p-5 rounded-[4px] bg-[color:var(--chakra-colors-bgPrimary)]">
            <div className="flex flex-col gap-3 items-start">
                <p className="text-3xl font-semibold">
                    Log in
                </p>
                <NextLink href="/register" passHref>
                    <a className="font-semibold hover:underline">
                        Not registered? Sign up
                    </a>
                </NextLink>
            </div>
            <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-5 items-stretch">
                    <Input
                        placeholder="Username or Email"
                        name="username"
                        withLabel="Username or Email"
                        onChange={handleChange}
                    />
                    <Input
                        placeholder="Password"
                        type={passwordHidden ? "password" : "text"}
                        name="password"
                        withLabel="Password"
                        icon={
                            <Icon
                                as={passwordHidden ? EyeOffIcon : EyeIcon}
                                w={5}
                                h={5}
                                color="textMain"
                                _hover={{ cursor: "pointer" }}
                                onClick={togglePassword}
                            />
                        }
                        onChange={handleChange}
                    />
                </div>
                <div className="flex flex-col gap-2 items-start">
                    <NextLink href="/forgot-password" passHref>
                        <a className="font-semibold hover:underline">
                            Forgot your password?
                        </a>
                    </NextLink>
                    <Button
                        alignSelf="stretch"
                        isLoading={isSubmitting}
                        loadingText="Logging in"
                        isDisabled={isSubmitting || isDisabled}
                        colorScheme="button"
                        onClick={handleSubmit}
                        type="submit"
                    >
                        Log in
                    </Button>
                </div>
            </form>
            <TwoFAModal isOpen={isOpen} onClose={onClose} twoFAToken={twoFAToken} />
        </div>
    );
}
