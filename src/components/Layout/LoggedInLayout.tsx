import dynamic from "next/dynamic";
import { Box, Container, Flex, useMediaQuery } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { PropsWithChildren, ReactElement, useEffect } from "react";
import Nav from "src/components/Nav/Nav";
import { useUserContext } from "src/contexts/userContext";
import Sidebar from "src/components/Sidebar";
import { NovuProvider } from "@novu/notification-center";
import { LoggedInHeader } from "src/components/Header";
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

    const router = useRouter();

    const [isLargerThanMd] = useMediaQuery(["(min-width: 52em)"]);
    const fullScreenRoute = fullScreenRoutes.includes(router.pathname);
    const isGuest = !user && guestRoutes.includes(router.pathname);

    const hasSidebar = !nonSidebarRoutes.includes(router.pathname) && user;
    const withEvents = router.pathname !== "/events";

    useEffect(() => {
        if (user === null && !guestRoutes.includes(router.pathname)) {
            router.replace("/login");
            return;
        }

        if (adminRoutes.includes(router.pathname) && !user?.isAdmin) {
            router.replace("/home");
            return;
        }
    }, [user]);

    return (
        <NovuProvider
            subscriberId={user?.id}
            subscriberHash={user?.notificationSubHash}
            applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_APP_ID ?? ""}
            initialFetchingStrategy={{ fetchNotifications: true, fetchUserPreferences: true, fetchUnseenCount: true }}
        >
            <LoggedInHeader />
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
        </NovuProvider>
    );
}
