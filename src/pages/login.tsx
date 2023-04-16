import { NextSeo } from "next-seo";
import { loginSEO } from "next-seo.config";
import { ReactElement } from "react";
import LoginForm from "src/components/Forms/LoginForm";

export default function Login(): ReactElement {
    return (
        <>
            <NextSeo {...loginSEO} />
            <div className="flex justify-center items-center">
                <div className="my-12 max-w-md container px-4">
                    <LoginForm />
                </div>
            </div>
        </>
    );
}

Login.defaultProps = {
    noAuthPage: true,
};
