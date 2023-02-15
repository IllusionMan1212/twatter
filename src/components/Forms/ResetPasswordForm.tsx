import {
    Button,
    Icon,
    Link as ChakraLink,
    Stack,
    Text,
    VStack,
    HStack,
    Spinner,
} from "@chakra-ui/react";
import { EyeOffIcon, EyeIcon } from "@heroicons/react/solid";
import { FormEvent, ReactElement, useState } from "react";
import Input from "src/components/Controls/Input";
import NextLink from "next/link";
import { IUser } from "src/types/interfaces";
import { axiosNoAuth } from "src/utils/axios";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { GenericBackendRes } from "src/types/server";
import { AxiosError } from "axios";
import Avatar from "src/components/User/Avatar";

interface ResetPasswordFormProps {
    loading: boolean;
    user: IUser | null;
    token: string | string[] | undefined;
}

interface ResetPasswordData {
    password: string;
    passwordConfirm: string;
}

export default function ResetPasswordForm({
    loading,
    user,
    ...props
}: ResetPasswordFormProps): ReactElement {
    const router = useRouter();

    const [passwordHidden, setPasswordHidden] = useState(true);
    const [isSubmitting, setSubmitting] = useState(false);
    const [isDisabled, setDisabled] = useState(false);
    const [form, setForm] = useState<ResetPasswordData>({
        password: "",
        passwordConfirm: "",
    });

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

        setSubmitting(true);

        axiosNoAuth
            .post<GenericBackendRes>("users/reset-password", {
                ...form,
                token: props.token,
            })
            .then((res) => {
                toast.success(res.data.message);
                router.replace("/login");
                setSubmitting(false);
                setDisabled(true);
            })
            .catch((e: AxiosError<GenericBackendRes>) => {
                if (e.response?.status === 403) {
                    toast.error(e.response?.data?.message ?? "Token invalid or expired");
                    router.replace("/forgot-password");
                
                } else if (e.response?.status === 400) {
                    toast.error(e.response.data.message ?? "Bad request");
                    setSubmitting(false);
                } else if (e.response?.status === 500) {
                    toast.error(
                        e.response?.data?.message ??
                            "An internal error occurred, please try again later",
                    );
                    setSubmitting(false);
                }
            });
    };

    return (
        <Stack spacing={10} p={5} rounded="4px" bgColor="bgPrimary">
            <VStack spacing={3} align="start">
                <Text fontSize="3xl" fontWeight="semibold">
                    Reset password
                </Text>
                <NextLink href="/" passHref>
                    <ChakraLink fontWeight="semibold">
                        Changed your mind? Return home
                    </ChakraLink>
                </NextLink>
            </VStack>
            {loading ? (
                <VStack width="full">
                    <Spinner />
                </VStack>
            ) : (
                <>
                    <HStack spacing={3}>
                        <Avatar
                            src={user?.avatarURL}
                            alt={`${user?.username}'s avatar`}
                            width="55px"
                            height="55px"
                        />
                        <Text fontSize="xl">
                            Welcome back{" "}
                            <Text
                                as="span"
                                fontWeight="bold"
                            >{`${user?.displayName} (@${user?.username})`}</Text>
                        </Text>
                    </HStack>
                    <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
                        <VStack spacing={5} align="stretch">
                            <Input
                                placeholder="New Password"
                                type={passwordHidden ? "password" : "text"}
                                withLabel="New Password"
                                name="password"
                                required
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
                            <Input
                                placeholder="Confirm Password"
                                type={passwordHidden ? "password" : "text"}
                                withLabel="Confirm Password"
                                name="passwordConfirm"
                                required
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
                        <Button
                            alignSelf="stretch"
                            isLoading={isSubmitting}
                            loadingText="Resetting password"
                            isDisabled={isSubmitting || isDisabled}
                            colorScheme="button"
                            onClick={handleSubmit}
                            type="submit"
                        >
                            Reset Password
                        </Button>
                    </form>
                </>
            )}
        </Stack>
    );
}
