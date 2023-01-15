import dynamic from "next/dynamic";
import { Box, Container, Flex, useMediaQuery } from "@chakra-ui/react";
import Router from "next/router";
import { PropsWithChildren, ReactElement, useEffect } from "react";
import Nav from "src/components/Nav/Nav";
import { useUserContext } from "src/contexts/userContext";
import Sidebar from "src/components/Sidebar";
const JoinReminder = dynamic(() => import("src/components/JoinReminder"));

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

const guestRoutes = [
    "/u/[username]",
    "/u/[username]/[postId]",
];

export default function LoggedInLayout({ children }: PropsWithChildren): ReactElement {
    const { user } = useUserContext();

    const [isLargerThanMd] = useMediaQuery(["(min-width: 52em)"]);
    const fullScreenRoute = fullScreenRoutes.includes(Router.pathname);
    const isGuest = !user && guestRoutes.includes(Router.pathname);

    const hasSidebar = !nonSidebarRoutes.includes(Router.pathname) && user;
    const withEvents = Router.pathname !== "/events";

    useEffect(() => {
        if (!user && !guestRoutes.includes(Router.pathname)) {
            Router.replace("/login");
            return;
        }

        if (adminRoutes.includes(Router.pathname) && !user?.isAdmin) {
            Router.replace("/home");
            return;
        }
    }, [user]);

    if ((!user && !guestRoutes.includes(Router.pathname)) || (!user?.isAdmin && adminRoutes.includes(Router.pathname))) return <></>;

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
                    mb={{ base: !isGuest ? "var(--chakra-navBarHeight)" : "", md: fullScreenRoute ? 0 : 5 }}
                    maxWidth="full"
                    minWidth="0"
                >
                    <Box flex="7" maxWidth="full" minWidth="0">
                        {children}
                    </Box>
                    {hasSidebar ? <Sidebar withEvents={withEvents} /> : null}
                    {isGuest ? <JoinReminder /> : null}
                </Flex>
            </Flex>
        </Container>
    );
}
