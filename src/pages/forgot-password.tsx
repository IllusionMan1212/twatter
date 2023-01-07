import { Container, Stack } from "@chakra-ui/react";
import { NextSeo } from "next-seo";
import { forgotPasswordSEO } from "next-seo.config";
import { ReactElement } from "react";
import ForgotPasswordForm from "src/components/Forms/ForgotPasswordForm";

export default function ForgotPassword(): ReactElement {
    return (
        <>
            <NextSeo {...forgotPasswordSEO} />
            <Stack justify="center" align="center" bgColor="bgMain">
                <Container maxWidth="lg" my={12}>
                    <ForgotPasswordForm />
                </Container>
            </Stack>
        </>
    );
}

ForgotPassword.defaultProps = {
    noAuthPage: true,
};
