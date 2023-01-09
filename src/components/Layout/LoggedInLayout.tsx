import { Box, Container, Flex, useMediaQuery } from "@chakra-ui/react";
import Router, { useRouter } from "next/router";
import { PropsWithChildren, ReactElement, useEffect } from "react";
import Nav from "src/components/Nav/Nav";
import { useUserContext } from "src/contexts/userContext";
import Sidebar from "src/components/Sidebar";

const adminRoutes = ["/dashboard/[[...item]]"];

const fullScreenRoutes = [
    "/settings/[[...setting]]",
    "/messages/[[...conversationId]]",
    "/u/[username]/[postId]",
];

const nonSidebarRoutes = [
    "/messages/[[...conversationId]]",
    "/dashboard/[[...item]]",
    "/settings/[[...setting]]",
];

export default function LoggedInLayout({ children }: PropsWithChildren): ReactElement {
    const { user } = useUserContext();

    const router = useRouter();

    const [isLargerThanMd] = useMediaQuery(["(min-width: 52em)"]);
    const fullScreenRoute = fullScreenRoutes.includes(router.pathname);

    const hasSidebar = !nonSidebarRoutes.includes(router.pathname);
    const withEvents = router.pathname !== "/events";

    useEffect(() => {
        if (!user) {
            Router.replace("/login");
            return;
        }

        if (!user.isAdmin && adminRoutes.includes(Router.pathname)) {
            Router.replace("/home");
            return;
        }
    }, [user]);

    if (!user || (!user.isAdmin && adminRoutes.includes(Router.pathname))) return <></>;

    return (
        <Container
            maxWidth={!isLargerThanMd ? "full" : "8xl"}
            px={!isLargerThanMd ? 0 : "1rem"}
        >
            <Flex position="relative" gap={{ md: 12, lg: 16, xl: 24 }} align="start">
                <Nav />
                <Flex
                    gap={10}
                    flex="7"
                    flexBasis="70%"
                    position="relative"
                    mt={{
                        base: "initial",
                        md: 5,
                    }}
                    mb={{ base: "var(--chakra-navBarHeight)", md: fullScreenRoute ? 0 : 5 }}
                    maxWidth="full"
                    minWidth="0"
                >
                    <Box flex="7" maxWidth="full" minWidth="0">
                        {children}
                    </Box>
                    {hasSidebar && <Sidebar withEvents={withEvents} />}
                </Flex>
            </Flex>
        </Container>
    );
}
