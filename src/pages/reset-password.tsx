import { NextSeo } from "next-seo";
import { resetPasswordSEO } from "next-seo.config";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ResetPasswordForm from "src/components/Forms/ResetPasswordForm";
import { IUser } from "src/types/interfaces";
import { VerifyResetPasswordTokenRes } from "src/types/server";
import { axiosInstance } from "src/utils/axios";

export default function ResetPassword(): ReactElement {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<IUser | null>(null);
    const [token, setToken] = useState("");

    useEffect(() => {
        if (router.query.token) {
            setToken(router.query.token as string);

            axiosInstance
                .get<VerifyResetPasswordTokenRes>(
                    `auth/verify-reset-password-token?token=${router.query.token}`,
                )
                .then((res) => {
                    setUser(res.data.user);
                    setLoading(false);
                })
                .catch((e) => {
                    toast.error(e?.response?.data?.message ?? "An error has occurred");
                    router.replace("/forgot-password");
                });
        }
    }, [router]);

    return (
        <>
            <NextSeo {...resetPasswordSEO} />
            <div className="flex justify-center items-center">
                <div className="my-12 max-w-md container px-4">
                    <ResetPasswordForm user={user} loading={loading} token={token} />
                </div>
            </div>
        </>
    );
}

ResetPassword.defaultProps = {
    noAuthPage: true,
};
