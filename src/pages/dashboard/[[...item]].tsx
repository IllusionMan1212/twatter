import dynamic from "next/dynamic";
import {
    Flex,
    VStack,
    Text,
    Divider,
    Grid,
    Box,
    Button,
    Icon,
    ButtonGroup,
    LinkBox,
    LinkOverlay,
    useDisclosure,
} from "@chakra-ui/react";
import { Calendar, UserList } from "phosphor-react";
import { ComponentProps, ReactElement, useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
const DashboardContentArea = dynamic(
    () => import("src/components/Dashboard/DashboardContentArea"),
);
import { DashboardItem } from "src/types/interfaces";
import AddEventModal from "src/components/Event/AddEventModal";
const Accounts = dynamic(() => import("src/components/Dashboard/Accounts"));
const Events = dynamic(() => import("src/components/Dashboard/Events"));

const cards = [
    {
        id: "accounts",
        title: "Manage Accounts",
        icon: UserListIcon,
        desc: "View and manage accounts",
        component: Accounts,
    },
    {
        id: "events",
        title: "Manage Events",
        icon: CalendarIcon,
        desc: "View and manage events",
        component: Events,
    },
];

function UserListIcon(): ReactElement {
    return <UserList weight="duotone" size="100" />;
}

function CalendarIcon(): ReactElement {
    return <Calendar weight="duotone" size="100" />;
}

interface SidebarProps {
    onEventOpen: () => void;
}

function Sidebar(props: SidebarProps): ReactElement {
    return (
        <VStack spacing={4} width="full" align="start">
            <VStack width="full" align="start" spacing={1}>
                <Text fontWeight="semibold">Quick Access</Text>
                <Divider height="1px" bgColor="bgSecondary" />
            </VStack>
            <ButtonGroup width="full" colorScheme="button">
                <VStack width="full">
                    <Button width="full" onClick={props.onEventOpen}>
                        Add Event
                    </Button>
                </VStack>
            </ButtonGroup>
        </VStack>
    );
}

interface DashboardCardProps {
    id: string;
    icon: (props: ComponentProps<"svg">) => ReactElement;
    desc: string;
}

function DashboardCard({ id, icon, desc }: DashboardCardProps): ReactElement {
    return (
        <LinkBox>
            <NextLink href={`/dashboard/${id}`} passHref>
                <LinkOverlay>
                    <VStack
                        as={Button}
                        color="text"
                        spacing={4}
                        py={10}
                        height="full"
                        width="full"
                        colorScheme="conversationItem"
                    >
                        <Box bgColor="bgSecondary" p={3} rounded="xl">
                            <Icon as={icon} />
                        </Box>
                        <Text fontSize={{ base: "md", md: "lg" }} whiteSpace="normal">
                            {desc}
                        </Text>
                    </VStack>
                </LinkOverlay>
            </NextLink>
        </LinkBox>
    );
}

export default function Dashboard(): ReactElement {
    const router = useRouter();
    const [activeItem, setActiveItem] = useState<DashboardItem | null>(null);

    const {
        isOpen: isEventOpen,
        onOpen: onEventOpen,
        onClose: onEventClose,
    } = useDisclosure();

    useEffect(() => {
        if (router.query.item?.[0] === activeItem?.id) {
            return;
        }

        if (!router.query.item?.[0]) {
            setActiveItem(null);
            return;
        }

        if (router.query.item?.[0]) {
            setActiveItem(
                cards.find((card) => card.id === router.query.item![0]) ?? null,
            );
        }
    }, [router.query.item]);

    return (
        <Flex gap="10">
            {activeItem ? (
                <VStack
                    spacing={10}
                    align="start"
                    maxWidth="100%"
                    width={{ base: "full", md: "unset" }}
                >
                    <DashboardContentArea item={activeItem} />
                </VStack>
            ) : (
                <Flex gap="10" width="full">
                    <VStack spacing={10} align="start" flex="7">
                        <VStack width="full" spacing={4} align="start">
                            <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                                {cards.map((card) => (
                                    <DashboardCard
                                        key={card.id}
                                        id={card.id}
                                        icon={card.icon}
                                        desc={card.desc}
                                    />
                                ))}
                            </Grid>
                        </VStack>
                    </VStack>
                    <VStack display={{ base: "none", lg: "initial" }} flex="4">
                        <Sidebar onEventOpen={onEventOpen} />
                    </VStack>
                    <AddEventModal isOpen={isEventOpen} onClose={onEventClose} />
                </Flex>
            )}
        </Flex>
    );
}
