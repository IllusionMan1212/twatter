import { NextSeo } from "next-seo";
import { forgotPasswordSEO } from "next-seo.config";
import { ReactElement } from "react";
import ForgotPasswordForm from "src/components/Forms/ForgotPasswordForm";

export default function ForgotPassword(): ReactElement {
    return (
        <>
            <NextSeo {...forgotPasswordSEO} />
            <div className="flex justify-center items-center">
                <div className="my-12 max-w-md container px-4">
                    <ForgotPasswordForm />
                </div>
            </div>
        </>
    );
}

ForgotPassword.defaultProps = {
    noAuthPage: true,
};
