import {
    Button,
    Link as ChakraLink,
    Stack,
    Text,
    VStack,
    HStack,
} from "@chakra-ui/react";
import { ReactElement, useState } from "react";
import Input from "src/components/Controls/Input";
import NextLink from "next/link";
import { axiosNoAuth } from "src/utils/axios";
import { GenericBackendRes } from "src/types/server";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export default function ResetPasswordForm(): ReactElement {
    const [email, setEmail] = useState("");
    const [isSubmitting, setSubmitting] = useState(false);

    const handleSubmit = () => {
        setSubmitting(true);

        axiosNoAuth
            .post<GenericBackendRes>("users/forgot-password", { email })
            .then((res) => {
                toast.success(res.data.message, { duration: 5000 });
                setSubmitting(false);
            })
            .catch((e: AxiosError<GenericBackendRes>) => {
                toast.error(e.response?.data?.message ?? "An error has occurred", {
                    duration: 4000,
                });
                setSubmitting(false);
            });
    };

    return (
        <Stack spacing={10} p={5} rounded="4px" bgColor="bgPrimary">
            <VStack spacing={3} align="start">
                <Text fontSize="3xl" fontWeight="semibold">
                    Forgot your password?
                </Text>
                <NextLink href="/login" passHref>
                    <ChakraLink fontWeight="semibold">
                        Remembered your password? Log in
                    </ChakraLink>
                </NextLink>
            </VStack>
            <HStack spacing={3}>
                <Text fontSize="xl">
                    Enter your email to receive a recovery link to reset your password.
                </Text>
            </HStack>
            <Input
                placeholder="Email"
                type="email"
                withLabel="Email"
                onChange={(e) => setEmail(e.target.value)}
            />
            <Button
                alignSelf="stretch"
                isLoading={isSubmitting}
                loadingText="Sending email"
                colorScheme="button"
                onClick={handleSubmit}
            >
                Send Recovery Email
            </Button>
        </Stack>
    );
}
