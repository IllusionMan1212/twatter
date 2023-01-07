import { Container, Stack } from "@chakra-ui/react";
import { NextSeo } from "next-seo";
import { loginSEO } from "next-seo.config";
import { ReactElement } from "react";
import LoginForm from "src/components/Forms/LoginForm";

export default function Login(): ReactElement {
    return (
        <>
            <NextSeo {...loginSEO} />
            <Stack justify="center" align="center">
                <Container maxWidth="md" my={12}>
                    <LoginForm />
                </Container>
            </Stack>
        </>
    );
}

Login.defaultProps = {
    noAuthPage: true,
};
