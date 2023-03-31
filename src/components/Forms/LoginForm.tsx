import {
    Button,
    Icon,
    Link as ChakraLink,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Stack,
    Text,
    useDisclosure,
    VStack,
} from "@chakra-ui/react";
import { EyeOffIcon, EyeIcon } from "@heroicons/react/solid";
import { FormEvent, ReactElement, useState } from "react";
import Input from "src/components/Controls/Input";
import NextLink from "next/link";
import toast from "react-hot-toast";
import { GenericBackendRes, LoginRes } from "src/types/server";
import axios, { AxiosError } from "axios";
import { useUserContext } from "src/contexts/userContext";

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
        <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent bgColor="bgMain" pb={5}>
                <ModalHeader>
                    <Text fontSize="lg">{usingRecovery ? "Recovery code" : "Two-factor authentication"}</Text>
                </ModalHeader>
                <ModalCloseButton size="lg" />
                <ModalBody>
                    <form onSubmit={handleSubmit}>
                        <VStack width="full" alignItems="start" spacing={4}>
                            <Text>{usingRecovery ? "Input one of your unused recovery codes" : "Input your 2FA code below"}</Text>
                            <Input
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
                        </VStack>
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
        <Stack spacing={10} p={5} rounded="4px" bgColor="bgPrimary">
            <VStack spacing={3} align="start">
                <Text fontSize="3xl" fontWeight="semibold">
                    Log in
                </Text>
                <NextLink href="/register" passHref>
                    <ChakraLink fontWeight="semibold">Not registered? Sign up</ChakraLink>
                </NextLink>
            </VStack>
            <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
                <VStack spacing={5} align="stretch">
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
                </VStack>
                <VStack align="start">
                    <NextLink href="/forgot-password" passHref>
                        <ChakraLink fontWeight="semibold">Forgot your password?</ChakraLink>
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
                </VStack>
            </form>
            <TwoFAModal isOpen={isOpen} onClose={onClose} twoFAToken={twoFAToken} />
        </Stack>
    );
}
