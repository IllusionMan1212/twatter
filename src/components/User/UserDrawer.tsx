import {
    Box,
    BoxProps,
    ChakraComponent,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    useColorMode,
    useDisclosure,
} from "@chakra-ui/react";
import { DrawerNavItem } from "src/components/Nav/NavItem";
import {
    CalendarIcon,
    CogIcon,
    UserIcon as UserIconSolid,
    LogoutIcon as LogoutIconSolid,
    MoonIcon as MoonIconSolid,
    SunIcon as SunIconSolid,
    TrendingUpIcon,
    UserCircleIcon,
} from "@heroicons/react/solid";
import Gauge from "@phosphor-icons/react/dist/icons/Gauge";
import { useUserContext } from "src/contexts/userContext";
import Avatar from "src/components/User/Avatar";

type CustomBox = ChakraComponent<"div", BoxProps>;

const DashboardIcon = () => {
    return <Gauge size="26" weight="fill" />;
};

const drawerLinksItems = [
    {
        href: "/events",
        icon: CalendarIcon,
        title: "Events",
        adminOnly: false,
    },
    {
        href: "/trends",
        icon: TrendingUpIcon,
        title: "Trending",
        adminOnly: false,
    },
    {
        href: "/dashboard",
        icon: DashboardIcon,
        title: "Admin Dashboard",
        adminOnly: true,
    },
];

interface DrawerProfileItemsProps {
    onClose: () => void;
    username: string;
    logout: () => void;
}

const DrawerProfileItems = ({ username, logout, onClose }: DrawerProfileItemsProps) => {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <>
            <DrawerNavItem
                href={`/@${username}`}
                icon={UserIconSolid}
                onClick={() => {
                    onClose();
                }}
            >
                Profile
            </DrawerNavItem>
            <DrawerNavItem
                href="/settings"
                icon={CogIcon}
                onClick={() => {
                    onClose();
                }}
            >
                Settings
            </DrawerNavItem>
            <DrawerNavItem
                href={null}
                icon={colorMode == "light" ? MoonIconSolid : SunIconSolid}
                onClick={() => {
                    toggleColorMode();
                    onClose();
                }}
            >
                {colorMode == "light" ? "Dark" : "Light"} Mode
            </DrawerNavItem>
            <DrawerNavItem
                href={null}
                icon={LogoutIconSolid}
                onClick={logout}
            >
                Logout
            </DrawerNavItem>
        </>
    );
};

const UserDrawer = ((props: BoxProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user, logout } = useUserContext();

    return (
        <Box {...props}>
            <UserCircleIcon width="28px" height="28px" onClick={onOpen} />
            <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent bgColor="bgMain" maxWidth="275px">
                    <DrawerCloseButton />
                    <DrawerHeader>
                        <div className="flex flex-col gap-2 items-start min-w-0">
                            <Avatar
                                src={user?.avatarURL}
                                alt={`${user?.username}'s avatar`}
                                width="45px"
                                height="45px"
                            />
                            <p className="truncate font-semibold max-w-full">{user?.displayName}</p>
                        </div>
                    </DrawerHeader>
                    <DrawerBody>
                        <div className="flex flex-col gap-6 items-center w-full">
                            <div className="flex flex-col gap-2 items-start w-full">
                                <p className="font-semibold">Profile</p>
                                <DrawerProfileItems
                                    username={user?.username ?? ""}
                                    onClose={onClose}
                                    logout={logout}
                                />
                            </div>
                            <div className="flex flex-col gap-2 items-start w-full">
                                <p className="font-semibold">Quick Links</p>
                                {drawerLinksItems.map((item) => {
                                    if (item.adminOnly && !user?.isAdmin) {
                                        return null;
                                    } else {
                                        return (
                                            <DrawerNavItem
                                                key={item.title}
                                                href={item.href}
                                                icon={item.icon}
                                                onClick={onClose}
                                            >
                                                {item.title}
                                            </DrawerNavItem>
                                        );
                                    }
                                })}
                            </div>
                        </div>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    );
}) as CustomBox;

export default UserDrawer;
