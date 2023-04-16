import { Button } from "@chakra-ui/react";
import { FormEvent, ReactElement, useState } from "react";
import Input from "src/components/Controls/Input";
import NextLink from "next/link";
import { GenericBackendRes } from "src/types/server";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";

export default function ResetPasswordForm(): ReactElement {
    const [email, setEmail] = useState("");
    const [isSubmitting, setSubmitting] = useState(false);

    const handleSubmit = (e: FormEvent<HTMLButtonElement | HTMLFormElement>) => {
        e.preventDefault();

        setSubmitting(true);

        axios
            .post<GenericBackendRes>("auth/forgot-password", { email })
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
        <div className="flex flex-col gap-10 p-5 rounded-[4px] bg-[color:var(--chakra-colors-bgPrimary)]">
            <div className="flex flex-col gap-3 items-start">
                <p className="text-3xl font-semibold">
                    Forgot your password?
                </p>
                <NextLink href="/login" passHref>
                    <a className="font-semibold">
                        Remembered your password? Log in
                    </a>
                </NextLink>
            </div>
            <div className="flex gap-3">
                <p className="text-xl">
                    Enter your email to receive a recovery link to reset your password.
                </p>
            </div>
            <form className="flex flex-col w-full gap-10" onSubmit={handleSubmit}>
                <Input
                    placeholder="Email"
                    type="email"
                    withLabel="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Button
                    alignSelf="stretch"
                    isLoading={isSubmitting}
                    loadingText="Sending email"
                    isDisabled={isSubmitting}
                    colorScheme="button"
                    onClick={handleSubmit}
                    type="submit"
                >
                    Send Recovery Email
                </Button>
            </form>
        </div>
    );
}
