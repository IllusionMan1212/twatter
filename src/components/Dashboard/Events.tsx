import {
    VStack,
    Text,
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    ButtonGroup,
    Button,
    useDisclosure,
    Spinner,
    HStack,
} from "@chakra-ui/react";
import { memo, ReactElement, useEffect, useState } from "react";
import CheckBox from "src/components/Controls/Checkbox";
import { formatEventDate } from "src/utils/helpers";
import { axiosInstance, fetcher } from "src/utils/axios";
import { Dialog } from "src/components/Dialog";
import { IEvent } from "src/types/interfaces";
import useSWR from "swr";
import { AdminEventsRes } from "src/types/server";
import toast from "react-hot-toast";
import CreationDate from "src/components/Dashboard/CreationDate";

interface EventDateProps {
    date: string;
}

const EventDate = memo(function EventDate(props: EventDateProps): ReactElement {
    return <>{formatEventDate(props.date)}</>;
});

export default function Events(): ReactElement {
    const [page, setPage] = useState(0);
    const [eventCount, setEventCount] = useState(0);
    const [events, setEvents] = useState<(IEvent & { selected: boolean })[]>([]);

    const { data, mutate, error, isValidating } = useSWR(
        `admin/get-all-events?page=${page}`,
        fetcher<AdminEventsRes>,
        {
            revalidateOnFocus: false,
        },
    );

    const allChecked = events.length ? events.every((a) => a.selected) : false;
    const anyChecked = events.length ? events.some((a) => a.selected) : false;
    const isIndeterminate = anyChecked && !allChecked;
    const pages = Math.ceil(eventCount / 25);

    const deleteDialog = useDisclosure();

    const maxTableHeight = {
        base: "calc(100vh - var(--chakra-headerHeight-mobile) - var(--chakra-navBarHeight) - 200px)",
        md: "calc(100vh - var(--chakra-headerHeight-desktop) - 220px)",
    };

    const handleDelete = async () => {
        const ids = events.reduce((prev, curr) => {
            if (curr.selected) prev.push(curr.id);
            return prev;
        }, [] as string[]);

        try {
            await mutate(axiosInstance.patch("admin/delete-events", { ids }), {
                optimisticData: {
                    events: events.filter((a) => !ids.includes(a.id)),
                    eventCount: eventCount - ids.length,
                },
                populateCache: false,
                revalidate:
                    (page === 0 && allChecked && pages > 1) || (page !== 0 && allChecked),
                rollbackOnError: true,
            });

            if (pages > 1 && allChecked) {
                setPage((page) => (page === 0 ? page : page - 1));
            }
        } catch (e) {
            toast.error("An error occurred while deleting the events");
        }
    };

    useEffect(() => {
        if (data) {
            setEvents(data.events.map((a) => ({ ...a, selected: false })));
            setEventCount(data.eventCount);
        }

        if (error) {
            toast.error(
                error?.response?.data?.message ??
                    "An error occurred while fetching events",
            );
        }
    }, [data, error]);

    return (
        <>
            <VStack align="start" width="full">
                <TableContainer
                    width="full"
                    border="1px solid var(--chakra-colors-bgSecondary)"
                    maxHeight={maxTableHeight}
                    overflowY="scroll"
                    rounded="2px"
                >
                    <Table
                        colorScheme="button"
                        sx={{
                            "& th": { textTransform: "none", color: "text" },
                            "& td": { textTransform: "none", fontSize: "sm" },
                            "& tr > *:nth-of-type(2)": { pl: "0px" },
                            "& tr > :first-of-type": { pl: "15px", pr: "15px" },
                        }}
                    >
                        <Thead
                            bgColor="bgSecondary"
                            textTransform="none"
                            position="sticky"
                            top="0"
                            zIndex={1}
                        >
                            <Tr>
                                <Th>
                                    <CheckBox
                                        isDisabled={isValidating || events.length === 0}
                                        isChecked={allChecked}
                                        isIndeterminate={isIndeterminate}
                                        onChange={(e) =>
                                            setEvents((a) => {
                                                return a.map((box) => {
                                                    box = {
                                                        ...box,
                                                        selected: e.target.checked,
                                                    };
                                                    return box;
                                                });
                                            })
                                        }
                                    />
                                </Th>
                                <Th>Creation Date</Th>
                                <Th>Title</Th>
                                <Th>Location</Th>
                                <Th>DateTime</Th>
                            </Tr>
                        </Thead>
                        <Tbody bgColor="bgPrimary">
                            {!isValidating && pages === 0 && events.length === 0 ? (
                                <Tr>
                                    <Td colSpan={6}>
                                        <VStack width="full">
                                            <Text>There are no events to manage</Text>
                                        </VStack>
                                    </Td>
                                </Tr>
                            ) : null}
                            {isValidating || (pages !== 0 && events.length === 0) ? (
                                <Tr>
                                    <Td colSpan={6}>
                                        <VStack width="full">
                                            <Spinner />
                                        </VStack>
                                    </Td>
                                </Tr>
                            ) : null}
                            {!isValidating &&
                                events.map((event, i) => (
                                    <Tr key={event.id}>
                                        <Td>
                                            <CheckBox
                                                id={event.id}
                                                isChecked={event.selected}
                                                onChange={(e) => {
                                                    setEvents((a) => {
                                                        return a.map((box, j) => {
                                                            if (j === i)
                                                                box = {
                                                                    ...box,
                                                                    selected:
                                                                        e.target.checked,
                                                                };
                                                            return box;
                                                        });
                                                    });
                                                }}
                                            />
                                        </Td>
                                        <Td>
                                            <CreationDate date={event.createdAt} />
                                        </Td>
                                        <Td>{event.title}</Td>
                                        <Td>{event.location}</Td>
                                        <Td>
                                            <EventDate date={event.time} />
                                        </Td>
                                    </Tr>
                                ))}
                        </Tbody>
                    </Table>
                </TableContainer>
                <HStack width="full" align="space-between">
                    <VStack align="start" width="full" spacing={5}>
                        <Text fontSize="sm">
                            <Text as="span" fontWeight="bold">
                                {events.length}
                            </Text>{" "}
                            Events - {events.filter((e) => e.selected).length} of{" "}
                            {events.length} selected
                        </Text>
                        <ButtonGroup size="sm" isDisabled={!anyChecked}>
                            <Button
                                rounded="8px"
                                colorScheme="red"
                                width="90px"
                                height="30px"
                                onClick={deleteDialog.onOpen}
                            >
                                Delete
                            </Button>
                        </ButtonGroup>
                    </VStack>
                    <VStack width="full" align="end" justify="space-between">
                        {pages !== 0 && (
                            <Text fontSize="sm" fontWeight="bold">
                                Page {page + 1}/{pages}
                            </Text>
                        )}
                        <ButtonGroup
                            isDisabled={Boolean(events.length)}
                            isAttached
                            colorScheme="accent"
                            size="sm"
                            variant="outline"
                        >
                            <Button
                                isDisabled={page === 0}
                                border="1px solid"
                                onClick={() => setPage((page) => page - 1)}
                            >
                                Prev
                            </Button>
                            <Button
                                isDisabled={page >= pages - 1}
                                border="1px solid"
                                onClick={() => setPage((page) => page + 1)}
                            >
                                Next
                            </Button>
                        </ButtonGroup>
                    </VStack>
                </HStack>
            </VStack>
            <Dialog
                isOpen={deleteDialog.isOpen}
                onClose={deleteDialog.onClose}
                header="Delete events"
                message={`Are you sure you want to delete ${
                    events.filter((e) => e.selected).length
                } event(s)?`}
                btnColor="red"
                confirmationBtnTitle="Delete"
                handleConfirmation={handleDelete}
            />
        </>
    );
}
