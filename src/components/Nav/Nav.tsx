import {
    Box,
    Text,
    Button,
    Icon,
    Divider,
    HStack,
    VStack,
    useDisclosure,
} from "@chakra-ui/react";
import {
    BellIcon,
    CalendarIcon,
    ChatAlt2Icon,
    HomeIcon,
    SearchIcon,
    TrendingUpIcon,
} from "@heroicons/react/solid";
import { Gauge, NotePencil } from "phosphor-react";
import { ReactElement } from "react";
import NavItem from "src/components/Nav/NavItem";
import { useUserContext } from "src/contexts/userContext";
import styles from "src/styles/nav.module.scss";
import ComposePostModal from "src/components/Post/ComposePostModal";
import UserDrawer from "src/components/User/UserDrawer";

const DashboardIcon = () => {
    return <Gauge size="26" weight="fill" />;
};

const NotePencilIcon = () => {
    return <NotePencil weight="bold" size="26" />;
};

const ComposePostItem = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <Button
                justifyContent="flex-start"
                py={6}
                rounded="full"
                leftIcon={<Icon as={NotePencilIcon} w="26px" h="26px" />}
                minWidth="200px"
                colorScheme="conversationItem"
                color="text"
                fontWeight="semibold"
                width="full"
                sx={{ "&:hover": { textDecoration: "none" } }}
                onClick={onOpen}
            >
                Make a Post
            </Button>
            <ComposePostModal isOpen={isOpen} onClose={onClose} />
        </>
    );
};

export default function Nav(): ReactElement {
    const { user } = useUserContext();

    return (
        <Box className={styles.nav}>
            <VStack display={{ base: "none", md: "flex" }} spacing={4} my={5}>
                {user ? (
                    <>
                        <NavItem href="/home" icon={HomeIcon}>
                            Home
                        </NavItem>
                        <NavItem href="/messages" icon={ChatAlt2Icon}>
                            Messages
                        </NavItem>
                        <NavItem href="/notifications" icon={BellIcon}>
                            Notifications
                        </NavItem>
                    </>
                ) : null}
                <NavItem href="/trends" icon={TrendingUpIcon}>
                    Trending
                </NavItem>
                {user ? (
                    <>
                        <NavItem href="/events" icon={CalendarIcon}>
                            Events
                        </NavItem>
                        <Divider height="1px" bgColor="bgSecondary" />
                        <ComposePostItem />
                    </>
                ) : null}
                {user?.isAdmin && (
                    <>
                        <NavItem href="/dashboard" icon={DashboardIcon}>
                            Admin Dashboard
                        </NavItem>
                    </>
                )}
            </VStack>
            {user ? (
                <HStack justify="space-around" p={1} display={{ base: "flex", md: "none" }}>
                    <NavItem href="/home" ariaLabel="Home" icon={HomeIcon} />
                    <NavItem href="/search" ariaLabel="Search" icon={SearchIcon} />
                    <NavItem href="/trends" ariaLabel="Trending" icon={TrendingUpIcon} />
                    <UserDrawer display={{ base: "initial", md: "none" }} />
                </HStack>
            ) : null}
        </Box>
    );
}
