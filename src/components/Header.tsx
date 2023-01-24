import {
    Button,
    Container,
    HStack,
    Stack,
    Text,
    Link as ChakraLink,
    LinkOverlay,
    LinkBox,
    Flex,
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
import Router from "next/router";
import { useUserContext } from "src/contexts/userContext";
import { IUser } from "src/types/interfaces";
import { axiosAuth } from "src/utils/axios";
import Avatar from "src/components/User/Avatar";
import NavItem from "src/components/Nav/NavItem";
import { BellIcon, ChatAlt2Icon } from "@heroicons/react/solid";

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
            <HStack>
                <Avatar
                    src={props.user?.avatarURL}
                    alt={`${props.user?.username}'s avatar`}
                    width="45px"
                    height="45px"
                />
                <Text display={{ md: "none", lg: "initial" }}>
                    {props.user?.displayName}
                </Text>
            </HStack>
        </MenuButton>
    );
}) as CustomMenuButton;

const UserDropDown = ((props: BoxProps & UserDropDownProps) => {
    const { logout } = useUserContext();
    const { colorMode, toggleColorMode } = useColorMode();

    const _logout = async () => {
        await axiosAuth.delete("users/logout");
        logout();
    };

    return (
        <Box {...props}>
            <Menu placement="bottom-end">
                {({ isOpen }) => (
                    <>
                        <UserDropDownCardButton isOpen={isOpen} user={props.user} />
                        <Portal>
                            <MenuList zIndex={3}>
                                <NextLink href={`/@${props.user?.username}`} passHref>
                                    <MenuItem
                                        as={ChakraLink}
                                        _hover={{ textDecoration: "none" }}
                                    >
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
                                    <MenuItem
                                        as={ChakraLink}
                                        _hover={{ textDecoration: "none" }}
                                    >
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
                                <MenuItem onClick={_logout}>
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

function LoggedOutHeader(): ReactElement {
    return (
        <Stack
            bgColor="bgMain"
            position="sticky"
            top="0"
            zIndex={3}
        >
            <Container maxWidth="8xl" py={2}>
                <HStack justify="space-between">
                    <LinkBox>
                        <NextLink href="/" passHref>
                            <LinkOverlay>
                                <Text fontSize="2xl" fontWeight="bold">
                                    Twatter
                                </Text>
                            </LinkOverlay>
                        </NextLink>
                    </LinkBox>
                    <HStack>
                        <NextLink href="/login" passHref>
                            <Button
                                as={ChakraLink}
                                colorScheme="button"
                                variant="outline"
                                sx={{ "&:hover": { textDecoration: "none" } }}
                            >
                                Log in
                            </Button>
                        </NextLink>
                        <NextLink href="/register" passHref>
                            <Button
                                as={ChakraLink}
                                underline="none"
                                colorScheme="button"
                                sx={{ "&:hover": { textDecoration: "none" } }}
                            >
                                Sign up
                            </Button>
                        </NextLink>
                    </HStack>
                </HStack>
            </Container>
        </Stack>
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
};

function LoggedInHeader(): ReactElement {
    const { user } = useUserContext();

    const handleSearchSubmit = (input: HTMLInputElement | null) => {
        if (input) {
            if (Router.pathname === "/search") {
                Router.push(
                    `/search?q=${input.value}${
                        Router.query.type ? `&type=${Router.query.type}` : ""
                    }`,
                );
            } else {
                Router.push(`/search?q=${input.value}`);
            }
        }
    };

    return (
        <Stack
            bgColor="bgMain"
            position="sticky"
            top="0"
            zIndex={3}
        >
            <Container maxWidth="8xl" py={2}>
                <Flex align="center" justify="space-between">
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
                                <Text fontSize="2xl" fontWeight="bold">
                                    Twatter
                                </Text>
                            </LinkOverlay>
                        </NextLink>
                    </LinkBox>
                    <Box
                        display={{ base: "none", md: "initial" }}
                        width={{ md: "35%", xl: "40%" }}
                    >
                        <SearchBar size="md" withButton showRecent onSubmit={handleSearchSubmit} />
                    </Box>
                    <Flex
                        gap={7}
                        align="center"
                        marginLeft={{ md: "auto" }}
                        display={{ base: "none", md: "initial" }}
                    >
                        <UserDropDown user={user} />
                    </Flex>
                    <Flex
                        display={{ base: "flex", md: "none" }}
                        width="full"
                        justify="space-between"
                        align="center"
                    >
                        <Text fontSize="xl" fontWeight="bold">
                            {routesTitles[Router.pathname]}
                        </Text>
                        <Flex>
                            <NavItem
                                href="/messages"
                                ariaLabel="Messages"
                                icon={ChatAlt2Icon}
                            />
                            <NavItem
                                href="/notifications"
                                ariaLabel="Notifications"
                                icon={BellIcon}
                            />
                        </Flex>
                    </Flex>
                </Flex>
            </Container>
        </Stack>
    );
}

export default function Header(): ReactElement {
    const { user } = useUserContext();

    return user ? <LoggedInHeader /> : <LoggedOutHeader />;
}
