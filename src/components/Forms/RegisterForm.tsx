import { Button, Icon, Link as ChakraLink, Stack, Text, VStack } from "@chakra-ui/react";
import { EyeOffIcon, EyeIcon } from "@heroicons/react/solid";
import { ReactElement, useState } from "react";
import Input from "src/components/Controls/Input";
import NextLink from "next/link";
import toast from "react-hot-toast";
import { axiosNoAuth } from "src/utils/axios";
import { GenericBackendRes } from "src/types/server";
import { AxiosError } from "axios";
import { useRouter } from "next/router";

interface RegisterData {
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
}

export default function RegisterForm(): ReactElement {
    const router = useRouter();

    const [form, setForm] = useState<RegisterData>({
        username: "",
        email: "",
        password: "",
        passwordConfirm: "",
    });

    const [passwordHidden, setPasswordHidden] = useState(true);
    const [isSubmitting, setSubmitting] = useState(false);
    const [isDisabled, setDisabled] = useState(false);

    const togglePassword = () => setPasswordHidden((hidden) => !hidden);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name;
        const value = e.target.value;
        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleSignup = () => {
        if (!form.username || !form.email || !form.password || !form.passwordConfirm) {
            toast.error("All fields must be set");
            return;
        }

        if (form.username.length < 3 || form.username.length > 16) {
            toast.error(
                "Username length must be at least 3 character and at most 16 characters",
            );
            return;
        }

        if (form.password.length < 8) {
            toast.error("Password must consist of at least 8 characters");
            return;
        }

        if (form.password !== form.passwordConfirm) {
            toast.error("Passwords don't match");
            return;
        }

        setSubmitting(true);
        axiosNoAuth
            .post<GenericBackendRes>("users/register", form)
            .then((res) => {
                toast.success(res.data.message, { duration: 7000 });
                router.push("/login");
                setSubmitting(false);
                setDisabled(true);
            })
            .catch((err: AxiosError<GenericBackendRes>) => {
                toast.error(err.response?.data?.message ?? "An error has occurred");
                setSubmitting(false);
            });
    };

    return (
        <Stack spacing={10} p={5} rounded="4px" bgColor="bgPrimary">
            <VStack spacing={3} align="start">
                <Text fontSize="3xl" fontWeight="semibold">
                    Sign Up
                </Text>
                <NextLink href="/login" passHref>
                    <ChakraLink fontWeight="semibold">
                        Already a member? Log in
                    </ChakraLink>
                </NextLink>
            </VStack>
            <VStack spacing={5} align="stretch">
                <Input
                    placeholder="Username"
                    name="username"
                    withLabel="Username"
                    onChange={handleChange}
                />
                <Input
                    placeholder="Email"
                    name="email"
                    type="email"
                    withLabel="Email"
                    onChange={handleChange}
                />
                <Input
                    placeholder="Password"
                    type={passwordHidden ? "password" : "text"}
                    withLabel="Password"
                    name="password"
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
                isLoading={isSubmitting}
                loadingText="Submitting"
                isDisabled={isSubmitting || isDisabled}
                colorScheme="button"
                onClick={handleSignup}
            >
                Sign up
            </Button>
        </Stack>
    );
}
