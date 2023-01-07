import { Container, Stack } from "@chakra-ui/react";
import { NextSeo } from "next-seo";
import { registerSEO } from "next-seo.config";
import { ReactElement } from "react";
import RegisterForm from "src/components/Forms/RegisterForm";

export default function Register(): ReactElement {
    return (
        <>
            <NextSeo {...registerSEO} />
            <Stack justify="center" align="center" bgColor="bgMain">
                <Container maxWidth="md" my={12}>
                    <RegisterForm />
                </Container>
            </Stack>
        </>
    );
}

Register.defaultProps = {
    noAuthPage: true,
};
