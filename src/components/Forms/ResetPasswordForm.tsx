import {
    Button,
    Icon,
    Spinner,
} from "@chakra-ui/react";
import { EyeOffIcon, EyeIcon } from "@heroicons/react/solid";
import { FormEvent, ReactElement, useState } from "react";
import Input from "src/components/Controls/Input";
import NextLink from "next/link";
import { IUser } from "src/types/interfaces";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { GenericBackendRes } from "src/types/server";
import axios, { AxiosError } from "axios";
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

        axios
            .post<GenericBackendRes>("auth/reset-password", {
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
        <div className="flex flex-col gap-10 p-5 rounded-[4px] bg-[color:var(--chakra-colors-bgPrimary)]">
            <div className="flex flex-col gap-3 items-start">
                <p className="text-3xl font-semibold">
                    Reset password
                </p>
                <NextLink href="/" passHref>
                    <a className="font-semibold">
                        Changed your mind? Return home
                    </a>
                </NextLink>
            </div>
            {loading ? (
                <div className="flex flex-col items-center w-full">
                    <Spinner />
                </div>
            ) : (
                <>
                    <div className="flex gap-3">
                        <Avatar
                            src={user?.avatarURL}
                            alt={`${user?.username}'s avatar`}
                            width="55px"
                            height="55px"
                        />
                        <p className="text-xl">
                            Welcome back{" "}
                            <span
                                className="font-bold"
                            >
                                {`${user?.displayName} (@${user?.username})`}
                            </span>
                        </p>
                    </div>
                    <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
                        <div className="flex flex-col items-stretch gap-5">
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
                        </div>
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
        </div>
    );
}
