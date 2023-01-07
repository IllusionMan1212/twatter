import {
    Button,
    Icon,
    IconButton,
    Link as ChakraLink,
    useMediaQuery,
} from "@chakra-ui/react";
import {
    ComponentProps,
    MouseEventHandler,
    PropsWithChildren,
    ReactElement,
} from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";

interface NavItemProps {
    icon: (props: ComponentProps<"svg">) => ReactElement;
    href: string;
    ariaLabel?: string;
}

export default function NavItem({
    icon,
    href,
    ariaLabel,
    children,
}: PropsWithChildren<NavItemProps>): ReactElement {
    const [isLargerThanMd] = useMediaQuery(["(min-width: 52em)"]);
    const router = useRouter();
    const isActive = router.pathname === href || router.pathname.startsWith(href);

    return (
        <NextLink href={href} passHref>
            {isLargerThanMd ? (
                <Button
                    as={ChakraLink}
                    justifyContent="flex-start"
                    py={6}
                    rounded="full"
                    leftIcon={<Icon as={icon} w="26px" h="26px" />}
                    colorScheme={isActive ? "accent" : "navItem"}
                    color={isActive ? "textOpposite" : "text"}
                    fontWeight={isActive ? "bold" : "semibold"}
                    width="full"
                    sx={{ "&:hover": { textDecoration: "none" } }}
                >
                    {children}
                </Button>
            ) : (
                <IconButton
                    variant="ghost"
                    aria-label={ariaLabel ?? ""}
                    as={ChakraLink}
                    icon={<Icon as={icon} w="26px" h="26px" />}
                />
            )}
        </NextLink>
    );
}

interface DrawerNavItem extends Omit<NavItemProps, "ariaLabel" | "href"> {
    href: string | null;
    onClick: MouseEventHandler<HTMLElement>;
}

export function DrawerNavItem({
    icon,
    href,
    onClick,
    children,
}: PropsWithChildren<DrawerNavItem>): ReactElement {
    return (
        <>
            {href !== null ? (
                <NextLink href={href} passHref>
                    <Button
                        as={ChakraLink}
                        justifyContent="flex-start"
                        py={6}
                        leftIcon={<Icon as={icon} w="26px" h="26px" />}
                        colorScheme="drawerNavItem"
                        color="text"
                        fontWeight="semibold"
                        width="full"
                        sx={{ "&:hover": { textDecoration: "none" } }}
                        iconSpacing={5}
                        onClick={onClick}
                    >
                        {children}
                    </Button>
                </NextLink>
            ) : (
                <Button
                    justifyContent="flex-start"
                    py={6}
                    leftIcon={<Icon as={icon} w="26px" h="26px" />}
                    colorScheme="drawerNavItem"
                    color="text"
                    fontWeight="semibold"
                    width="full"
                    sx={{ "&:hover": { textDecoration: "none" } }}
                    iconSpacing={5}
                    onClick={onClick}
                >
                    {children}
                </Button>
            )}
        </>
    );
}
