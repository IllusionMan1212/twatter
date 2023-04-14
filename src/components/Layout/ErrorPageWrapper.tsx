import { ReactElement } from "react";
import { useUserContext } from "src/contexts/userContext";
import { PageProps } from "src/pages/_app";
import { LoggedInHeader, LoggedOutHeader } from "src/components/Header";
import { NovuProvider } from "@novu/notification-center";
import { Box, Container, Flex, useMediaQuery } from "@chakra-ui/react";
import Nav from "src/components/Nav/Nav";

interface Props {
    children: ReactElement<PageProps>;
}

export default function LoggedOutLayout({ children }: Props): ReactElement {
    const { user } = useUserContext();
    const [isLargerThanMd] = useMediaQuery(["(min-width: 52em)"]);

    return (
        <NovuProvider
            subscriberId={user?.id}
            subscriberHash={user?.notificationSubHash}
            applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_APP_ID ?? ""}
            initialFetchingStrategy={{ fetchNotifications: true, fetchUserPreferences: true, fetchUnseenCount: true }}
        >
            {user ? <LoggedInHeader /> : <LoggedOutHeader />}
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
                        mb={{ base: user ? "var(--chakra-navBarHeight)" : "", md: user ? 5 : 0 }}
                        maxWidth="full"
                        minWidth="0"
                    >
                        <Box flex="7" maxWidth="full" minWidth="0">
                            {children}
                        </Box>
                    </Flex>
                </Flex>
            </Container>
        </NovuProvider>
    );
}
