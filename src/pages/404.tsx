import {
    VStack,
    Image,
    Text,
    Button,
    Link as ChakraLink,
    Flex,
    Box,
} from "@chakra-ui/react";
import { ReactElement } from "react";
import NextLink from "next/link";
import { useUserContext } from "src/contexts/userContext";

export default function NotFound(): ReactElement {
    const { user } = useUserContext();

    return (
        <Flex direction="column" align="center" m={10} gap={4}>
            <Box boxSize="250px">
                <Image
                    fit="cover"
                    src="/graphics/Page_Not_Found.avif"
                    alt="Page not found graphic"
                />
            </Box>
            <VStack spacing={0}>
                <Text fontSize="2xl" fontWeight="semibold" color="red.500">
                    404
                </Text>
                <Text fontSize="3xl" fontWeight="semibold">
                    Page Not Found
                </Text>
            </VStack>
            <NextLink href={user ? "/home" : "/"} passHref>
                <Button mt={6} as={ChakraLink} colorScheme="button" px={10} size="lg">
                    Return home
                </Button>
            </NextLink>
        </Flex>
    );
}

NotFound.defaultProps = {
    noAuthPage: true,
    notFoundPage: true,
};
