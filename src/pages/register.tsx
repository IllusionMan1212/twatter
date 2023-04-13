import { NextSeo } from "next-seo";
import { registerSEO } from "next-seo.config";
import { ReactElement } from "react";
import RegisterForm from "src/components/Forms/RegisterForm";

export default function Register(): ReactElement {
    return (
        <>
            <NextSeo {...registerSEO} />
            <div className="flex items-center justify-center bg-[color:var(--chakra-colors-bgMain)]">
                <div className="my-12 max-w-md container px-4">
                    <RegisterForm />
                </div>
            </div>
        </>
    );
}

Register.defaultProps = {
    noAuthPage: true,
};
