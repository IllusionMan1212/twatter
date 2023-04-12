import {
    Button,
    Stack,
    Text,
    VStack,
    Link as ChakraLink,
    Flex,
    Image,
    Box,
} from "@chakra-ui/react";
import { Container } from "src/components/Container";
import { ReactElement } from "react";
import NextLink from "next/link";

export default function Landing(): ReactElement {
    return (
        <Stack justify="center" align="center">
            <Container width="full" maxWidth="7xl" my={12}>
                <Flex
                    gap="20"
                    direction={{ base: "column", md: "row" }}
                    width="full"
                    alignItems={{ base: "center", md: "start" }}
                    mx={5}
                >
                    <VStack
                        spacing={8}
                        textAlign="center"
                        py={{ base: "0", md: "5" }}
                        mx={{ base: "6", md: "10" }}
                    >
                        <Text fontSize="6xl" fontWeight="bold" lineHeight="1.2">
                            Connect with the world!
                        </Text>
                        <Text fontSize="lg">
                            Twatter is a social platform made to help connect people
                        </Text>
                        <NextLink href="/register" passHref>
                            <Button
                                as={ChakraLink}
                                sx={{ "&:hover": { textDecoration: "none" } }}
                                colorScheme="button"
                                width="36"
                            >
                                Sign up
                            </Button>
                        </NextLink>
                    </VStack>
                    <Box mx={{ base: "0", md: "10" }}>
                        <Image
                            alt="Twatter Graphic"
                            src="/graphics/LandingPageGraphic.avif"
                            fit="cover"
                            width="700px"
                        />
                    </Box>
                </Flex>
            </Container>
        </Stack>
    );
}

Landing.defaultProps = {
    noAuthPage: true,
};
