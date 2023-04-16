import { Button } from "@chakra-ui/react";
import { ReactElement } from "react";
import NextLink from "next/link";
import { useUserContext } from "src/contexts/userContext";

export default function NotFound(): ReactElement {
    const { user } = useUserContext();

    return (
        <div className="flex flex-col items-center m-10 gap-4">
            <div className="w-[250px] h-[250px]">
                <img
                    className="object-cover"
                    src="/graphics/Page_Not_Found.avif"
                    alt="Page not found graphic"
                />
            </div>
            <div className="flex flex-col items-center">
                <p className="text-2xl font-semibold text-red-500">
                    404
                </p>
                <p className="text-3xl font-semibold text-center">
                    Page Not Found
                </p>
            </div>
            <NextLink href={user ? "/home" : "/"} passHref>
                <Button mt={6} as="a" colorScheme="button" px={10} size="lg">
                    Return home
                </Button>
            </NextLink>
        </div>
    );
}

NotFound.defaultProps = {
    noAuthPage: true,
    notFoundPage: true,
};
