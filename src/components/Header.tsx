import {
    Button,
    Container,
    LinkOverlay,
    LinkBox,
    Box,
    Icon,
    Menu,
    MenuButton,
    ChakraComponent,
    MenuButtonProps,
    MenuItem,
    MenuList,
    MenuDivider,
    BoxProps,
    Portal,
    useColorMode,
} from "@chakra-ui/react";
import { ReactElement } from "react";
import NextLink from "next/link";
import SearchBar from "src/components/Search/SearchBar";
import {
    ChevronDownIcon,
    ChevronUpIcon,
    UserIcon as UserIconOutline,
    CogIcon as CogIconOutline,
    LogoutIcon,
    MoonIcon as MoonIconOutline,
    SunIcon as SunIconOutline,
} from "@heroicons/react/outline";
import { useRouter } from "next/router";
import { useUserContext } from "src/contexts/userContext";
import { IUser } from "src/types/interfaces";
import Avatar from "src/components/User/Avatar";
import NavItem from "src/components/Nav/NavItem";
import { BellIcon, ChatAlt2Icon } from "@heroicons/react/solid";
import UnreadIndicator from "src/components/UnreadIndicator";
import { useUnseenCount } from "@novu/notification-center";

interface UserDropDownCardButtonProps {
    isOpen: boolean;
    user: IUser | null | undefined;
}

interface UserDropDownProps {
    user: IUser | null | undefined;
}

type CustomMenuButton = ChakraComponent<"button", UserDropDownCardButtonProps>;
type CustomBox = ChakraComponent<"div", UserDropDownProps>;

const UserDropDownCardButton = ((
    props: MenuButtonProps & UserDropDownCardButtonProps,
) => {
    return (
        <MenuButton
            height="full"
            as={Button}
            variant="ghost"
            pl={0}
            rightIcon={
                <Icon
                    as={props.isOpen ? ChevronUpIcon : ChevronDownIcon}
                    w="22px"
                    h="22px"
                />
            }
        >
            <div className="flex gap-2 items-center">
                <Avatar
                    src={props.user?.avatarURL}
                    alt={`${props.user?.username}'s avatar`}
                    width="45px"
                    height="45px"
                />
                <p className="hidden lg:[display:initial]">
                    {props.user?.displayName}
                </p>
            </div>
        </MenuButton>
    );
}) as CustomMenuButton;

const UserDropDown = ((props: BoxProps & UserDropDownProps) => {
    const { logout } = useUserContext();
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <Box {...props}>
            <Menu placement="bottom-end">
                {({ isOpen }) => (
                    <>
                        <UserDropDownCardButton isOpen={isOpen} user={props.user} />
                        <Portal>
                            <MenuList zIndex={3}>
                                <NextLink href={`/@${props.user?.username}`} passHref>
                                    <MenuItem as="a">
                                        <Icon
                                            mr={3}
                                            as={UserIconOutline}
                                            h="20px"
                                            w="20px"
                                        />
                                        <span>Profile</span>
                                    </MenuItem>
                                </NextLink>
                                <NextLink href="/settings" passHref>
                                    <MenuItem as="a">
                                        <Icon
                                            mr={3}
                                            as={CogIconOutline}
                                            h="20px"
                                            w="20px"
                                        />
                                        <span>Settings</span>
                                    </MenuItem>
                                </NextLink>
                                <MenuItem onClick={toggleColorMode}>
                                    <Icon
                                        mr={3}
                                        as={
                                            colorMode == "light"
                                                ? MoonIconOutline
                                                : SunIconOutline
                                        }
                                        h="20px"
                                        w="20px"
                                    />
                                    <span>
                                        {colorMode == "light" ? "Dark" : "Light"} Mode
                                    </span>
                                </MenuItem>
                                <MenuDivider />
                                <MenuItem onClick={logout}>
                                    <Icon mr={3} as={LogoutIcon} h="20px" w="20px" />
                                    <span>Logout</span>
                                </MenuItem>
                            </MenuList>
                        </Portal>
                    </>
                )}
            </Menu>
        </Box>
    );
}) as CustomBox;

export function LoggedOutHeader(): ReactElement {
    return (
        <div className="flex sticky top-0 z-[3] bg-[color:var(--chakra-colors-bgMain)]">
            <Container maxWidth="8xl" py={2}>
                <div className="flex gap-2 items-center justify-between">
                    <LinkBox>
                        <NextLink href="/" passHref>
                            <LinkOverlay>
                                <p className="text-2xl font-bold">
                                    Twatter
                                </p>
                            </LinkOverlay>
                        </NextLink>
                    </LinkBox>
                    <div className="flex gap-2 items-center">
                        <NextLink href="/login" passHref>
                            <Button
                                as="a"
                                colorScheme="button"
                                variant="outline"
                                sx={{ "&:hover": { textDecoration: "none" } }}
                            >
                                Log in
                            </Button>
                        </NextLink>
                        <NextLink href="/register" passHref>
                            <Button
                                as="a"
                                colorScheme="button"
                                sx={{ "&:hover": { textDecoration: "none" } }}
                            >
                                Sign up
                            </Button>
                        </NextLink>
                    </div>
                </div>
            </Container>
        </div>
    );
}

const routesTitles: Record<string, string> = {
    "/home": "Home",
    "/events": "Events",
    "/trends": "Trending",
    "/search": "Search",
    "/notifications": "Notifications",
    "/messages/[[...conversationId]]": "Messages",
    "/settings/[[...setting]]": "Settings",
    "/dashboard/[[...item]]": "Dashboard",
    "/u/[username]": "User Profile",
    "/u/[username]/[postId]": "Post",
    "/404": "Not Found",
    "/500": "Error",
};

export function LoggedInHeader(): ReactElement {
    const { user, unreadMessages } = useUserContext();
    const { data: unreadNotifications } = useUnseenCount();
    const router = useRouter();

    const handleSearchSubmit = (input: HTMLInputElement | null) => {
        if (input) {
            if (router.pathname === "/search") {
                router.push(
                    `/search?q=${input.value}${
                        router.query.type ? `&type=${router.query.type}` : ""
                    }`,
                );
            } else {
                router.push(`/search?q=${input.value}`);
            }
        }
    };

    return (
        <div className="flex sticky top-0 z-[3] bg-[color:var(--chakra-colors-bgMain)]">
            <Container maxWidth="8xl" py={2}>
                <div className="flex items-center justify-between">
                    <LinkBox
                        display={{ base: "none", md: "initial" }}
                        width={{ base: "initial", md: "25%" }}
                    >
                        <NextLink href="/home" passHref>
                            <LinkOverlay
                                display="flex"
                                width="fit-content"
                                _before={{ width: "fit-content" }}
                            >
                                <p className="text-2xl font-bold">
                                    Twatter
                                </p>
                            </LinkOverlay>
                        </NextLink>
                    </LinkBox>
                    <div className="hidden md:[display:initial] md:w-[35%] xl:w-[40%]">
                        <SearchBar size="md" withButton showRecent onSubmit={handleSearchSubmit} />
                    </div>
                    <div className="hidden md:flex gap-7 items-center md:ml-auto">
                        <UserDropDown user={user} />
                    </div>
                    <div className="flex md:hidden w-full justify-between items-center">
                        <p className="text-xl font-bold">
                            {routesTitles[router.pathname]}
                        </p>
                        <div className="flex">
                            <NavItem
                                href="/messages"
                                ariaLabel="Messages"
                                icon={ChatAlt2Icon}
                                indicator={<UnreadIndicator position="top-0 right-0" count={unreadMessages.size} />}
                            />
                            <NavItem
                                href="/notifications"
                                ariaLabel="Notifications"
                                icon={BellIcon}
                                indicator={<UnreadIndicator position="top-0 right-0" count={unreadNotifications?.count ?? 0} />}
                            />
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
