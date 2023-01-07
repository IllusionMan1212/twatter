import { ReactElement, useEffect, useState } from "react";
import { Button, Text, VStack, Link as ChakraLink, Box, Spinner } from "@chakra-ui/react";
import Event from "src/components/Event/Event";
import NextLink from "next/link";
import styles from "src/styles/sidebar.module.scss";
import useSWR, { KeyedMutator } from "swr";
import { fetcher } from "src/utils/helpers";
import { GenericBackendRes, GetEventsRes } from "src/types/server";
import { AxiosError } from "axios";
import { IEvent } from "src/types/interfaces";

interface SidebarProps {
    withEvents?: boolean;
}

interface SidebarData {
    isValidating: boolean;
    error: AxiosError<GenericBackendRes> | undefined;
}

interface ErrorProps {
    error: AxiosError<GenericBackendRes>;
}

function Error({ error }: ErrorProps): ReactElement {
    return (
        <Text fontSize="lg" fontWeight="bold">
            {error.response?.data.message ?? "An error has occurred"}
        </Text>
    );
}

interface EventsProps extends SidebarData {
    events: IEvent[];
    mutate: KeyedMutator<GetEventsRes>;
}

function Events({ isValidating, error, events, mutate }: EventsProps): ReactElement {
    if (error) return <Error error={error} />;

    if (isValidating && !events.length) {
        return (
            <VStack width="full">
                <Spinner />
            </VStack>
        );
    }

    return (
        <>
            {events.map((event) => (
                <Event
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    description={event.description ?? ""}
                    location={event.location}
                    imageURL={event.imageURL ?? ""}
                    interest={event.interest}
                    date={event.time}
                    isInterested={event.isInterested ?? false}
                    mutateEvents={mutate}
                />
            ))}
        </>
    );
}

function UpcomingEvents(): ReactElement {
    const [events, setEvents] = useState<IEvent[]>([]);

    const { data, error, isValidating, mutate } = useSWR<
        GetEventsRes,
        AxiosError<GenericBackendRes>
    >("events/get-sidebar-events", fetcher, {
        revalidateOnFocus: false,
    });

    useEffect(() => {
        if (data) {
            setEvents(data.events);
        }
    }, [data]);

    if (!isValidating && !events.length) return <></>;

    return (
        <VStack width="full" align="start">
            <Text fontWeight="semibold">Upcoming Events</Text>
            <VStack width="full" spacing={4} align="start">
                <Events
                    isValidating={isValidating}
                    error={error}
                    events={events}
                    mutate={mutate}
                />
                <NextLink href="/events" passHref>
                    <Button
                        as={ChakraLink}
                        colorScheme="button"
                        variant="outline"
                        size="lg"
                    >
                        See All
                    </Button>
                </NextLink>
            </VStack>
        </VStack>
    );
}

export default function Sidebar(props: SidebarProps): ReactElement {
    return (
        <Box className={styles.sidebar}>
            <VStack width="full" spacing={8}>
                {props.withEvents && <UpcomingEvents />}
            </VStack>
        </Box>
    );
}

Sidebar.defaultProps = {
    withEvents: true,
};
