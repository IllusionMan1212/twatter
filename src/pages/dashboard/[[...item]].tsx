import dynamic from "next/dynamic";
import {
    VStack,
    Divider,
    Button,
    Icon,
    ButtonGroup,
    LinkBox,
    LinkOverlay,
    useDisclosure,
} from "@chakra-ui/react";
import Calendar from "@phosphor-icons/react/dist/icons/Calendar";
import UserList from "@phosphor-icons/react/dist/icons/UserList";
import { ComponentProps, ReactElement, useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
const DashboardContentArea = dynamic(
    () => import("src/components/Dashboard/DashboardContentArea"),
);
import { DashboardItem } from "src/types/interfaces";
import AddEventModal from "src/components/Event/AddEventModal";
import Reports from "src/components/Dashboard/Reports";
import { FlagIcon as Flag } from "@heroicons/react/outline";
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
    {
        id: "reports",
        title: "Review Reports",
        icon: FlagIcon,
        desc: "Review submitted reports",
        component: Reports,
    }
];

function UserListIcon(): ReactElement {
    return <UserList weight="duotone" size="100" />;
}

function CalendarIcon(): ReactElement {
    return <Calendar weight="duotone" size="100" />;
}

function FlagIcon(): ReactElement {
    return <Flag width="100" height="100" />;
}

interface SidebarProps {
    onEventOpen: () => void;
}

function Sidebar(props: SidebarProps): ReactElement {
    return (
        <div className="flex flex-col gap-4 w-full items-start">
            <div className="flex flex-col w-full items-start gap-1">
                <p className="font-semibold">Quick Access</p>
                <Divider height="1px" bgColor="bgSecondary" />
            </div>
            <ButtonGroup width="full" colorScheme="button">
                <div className="flex flex-col w-full gap-2 items-center">
                    <Button width="full" onClick={props.onEventOpen}>
                        Add Event
                    </Button>
                </div>
            </ButtonGroup>
        </div>
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
                        <div className="p-3 rounded-xl bg-[color:var(--chakra-colors-bgSecondary)]">
                            <Icon as={icon} />
                        </div>
                        <p className="text-md md:text-lg whitespace-normal">
                            {desc}
                        </p>
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
        <div className="flex gap-10">
            {activeItem ? (
                <div className="flex flex-col gap-10 items-start max-w-full w-full md:w-[unset]">
                    <DashboardContentArea item={activeItem} />
                </div>
            ) : (
                <div className="flex gap-10 w-full">
                    <div className="flex flex-col gap-10 flex-[7] items-start">
                        <div className="flex flex-col gap-4 w-full items-start">
                            <div className="grid grid-cols-2 gap-3">
                                {cards.map((card) => (
                                    <DashboardCard
                                        key={card.id}
                                        id={card.id}
                                        icon={card.icon}
                                        desc={card.desc}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex flex-col flex-[4] gap-2 items-center hidden">
                        <Sidebar onEventOpen={onEventOpen} />
                    </div>
                    <AddEventModal isOpen={isEventOpen} onClose={onEventClose} />
                </div>
            )}
        </div>
    );
}
