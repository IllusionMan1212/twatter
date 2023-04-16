import { Button } from "@chakra-ui/react";
import { Container } from "src/components/Container";
import { ReactElement } from "react";
import NextLink from "next/link";

export default function Landing(): ReactElement {
    return (
        <div className="flex justify-center items-center">
            <Container width="full" maxWidth="7xl" my={12}>
                <div className="flex gap-20 flex-col md:flex-row w-full mx-5 items-center md:items-start">
                    <div className="flex flex-col items-center gap-8 text-center md:py-5 mx-6 md:mx-10">
                        <p className="text-6xl font-bold leading-tight">
                            Connect with the world!
                        </p>
                        <p className="text-lg">
                            Twatter is a social platform made to help connect people
                        </p>
                        <NextLink href="/register" passHref>
                            <Button
                                as="a"
                                sx={{ "&:hover": { textDecoration: "none" } }}
                                colorScheme="button"
                                width="36"
                            >
                                Sign up
                            </Button>
                        </NextLink>
                    </div>
                    <div className="md:mx-10">
                        <img
                            className="object-cover"
                            alt="Twatter Graphic"
                            src="/graphics/LandingPageGraphic.avif"
                            width="700px"
                        />
                    </div>
                </div>
            </Container>
        </div>
    );
}

Landing.defaultProps = {
    noAuthPage: true,
};
