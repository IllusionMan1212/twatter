import {
    Button,
    Icon,
    Divider,
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
import Gauge from "@phosphor-icons/react/dist/icons/Gauge";
import NotePencil from "@phosphor-icons/react/dist/icons/NotePencil";
import { ReactElement } from "react";
import NavItem from "src/components/Nav/NavItem";
import { useUserContext } from "src/contexts/userContext";
import styles from "src/styles/nav.module.scss";
import ComposePostModal from "src/components/Post/ComposePostModal";
import UserDrawer from "src/components/User/UserDrawer";
import UnreadIndicator from "src/components/UnreadIndicator";
import { useUnseenCount } from "@novu/notification-center";

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
    const { user, unreadMessages } = useUserContext();
    const { data: unreadNotifications } = useUnseenCount();

    return (
        <div className={styles.nav}>
            <div className="hidden md:flex flex-col items-center gap-4 my-5">
                {user ? (
                    <>
                        <NavItem href="/home" icon={HomeIcon}>
                            Home
                        </NavItem>
                        <NavItem href="/messages" icon={ChatAlt2Icon} indicator={<UnreadIndicator position="top-1 left-2" count={unreadMessages.size} />}>
                            Messages
                        </NavItem>
                        <NavItem href="/notifications" icon={BellIcon} indicator={<UnreadIndicator position="top-1 left-2" count={unreadNotifications?.count ?? 0} />}>
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
            </div>
            {user ? (
                <div className="flex md:hidden justify-around items-center p-1">
                    <NavItem href="/home" ariaLabel="Home" icon={HomeIcon} />
                    <NavItem href="/search" ariaLabel="Search" icon={SearchIcon} />
                    <NavItem href="/trends" ariaLabel="Trending" icon={TrendingUpIcon} />
                    <UserDrawer display={{ base: "initial", md: "none" }} />
                </div>
            ) : null}
        </div>
    );
}
