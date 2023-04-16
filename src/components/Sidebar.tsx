import { ReactElement, useEffect, useState } from "react";
import { Button, Spinner } from "@chakra-ui/react";
import Event from "src/components/Event/Event";
import NextLink from "next/link";
import styles from "src/styles/sidebar.module.scss";
import useSWR, { KeyedMutator } from "swr";
import { fetcher } from "src/utils/axios";
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
        <p className="text-lg font-bold">
            {error.response?.data.message ?? "An error has occurred"}
        </p>
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
            <div className="flex flex-col gap-2 items-center w-full">
                <Spinner />
            </div>
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
        <div className="flex flex-col w-full gap-2 items-start">
            <p className="font-semibold">Upcoming Events</p>
            <div className="flex flex-col w-full gap-4 items-start">
                <Events
                    isValidating={isValidating}
                    error={error}
                    events={events}
                    mutate={mutate}
                />
                <NextLink href="/events" passHref>
                    <Button
                        as="a"
                        colorScheme="button"
                        variant="outline"
                        size="lg"
                    >
                        See All
                    </Button>
                </NextLink>
            </div>
        </div>
    );
}

export default function Sidebar(props: SidebarProps): ReactElement {
    return (
        <div className={styles.sidebar}>
            <div className="flex flex-col gap-8 items-center w-full">
                {props.withEvents && <UpcomingEvents />}
            </div>
        </div>
    );
}

Sidebar.defaultProps = {
    withEvents: true,
};
