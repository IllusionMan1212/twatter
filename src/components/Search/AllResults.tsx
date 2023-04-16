import { Spinner, Divider, Button, Flex } from "@chakra-ui/react";
import { ReactElement, useEffect } from "react";
import toast from "react-hot-toast";
import { IEvent, ISearchUser, SearchResultsTabProps } from "src/types/interfaces";
import { SearchAllRes } from "src/types/server";
import { fetcher } from "src/utils/axios";
import useSWR, { KeyedMutator } from "swr";
import User from "src/components/User/User";
import Event from "src/components/Event/Event";
import Router from "next/router";

interface UsersResultsProps {
    users: ISearchUser[];
}

interface EventsResultsProps {
    events: IEvent[];
    mutate: KeyedMutator<SearchAllRes>;
}

function Users({ users }: UsersResultsProps): ReactElement {
    return (
        <div className="flex flex-col w-full items-start gap-2">
            <p className="text-2xl font-bold">
                Users
            </p>
            {users.map((user) => (
                <User
                    key={user.id}
                    id={user.id}
                    displayName={user.displayName}
                    username={user.username}
                    avatarURL={user.avatarURL}
                    allowAllDMs={user.allowAllDMs}
                    isFollowing={user.isFollowing}
                />
            ))}
            {users.length === 5 ? (
                <Flex width="full" alignItems="center" gap={2}>
                    <Divider height="1px" bgColor="stroke" />
                    <Button
                        flexShrink="0"
                        colorScheme="accent"
                        px={6}
                        size="sm"
                        onClick={() =>
                            Router.replace({ query: { ...Router.query, type: "users" } })
                        }
                    >
                        Load More Users
                    </Button>
                    <Divider height="1px" bgColor="stroke" />
                </Flex>
            ) : null}
        </div>
    );
}

function Events({ events, mutate }: EventsResultsProps): ReactElement {
    return (
        <div className="flex flex-col w-full items-start gap-2">
            <p className="text-2xl font-bold">
                Events
            </p>
            {events.map((event) => (
                <Event
                    id={event.id}
                    key={event.id}
                    title={event.title}
                    date={event.time}
                    description={event.description ?? ""}
                    imageURL={event.imageURL ?? ""}
                    interest={event.interest}
                    location={event.location}
                    isInterested={event.isInterested ?? false}
                    mutateEvents={mutate}
                />
            ))}
            {events.length === 5 ? (
                <Flex width="full" alignItems="center" gap={2}>
                    <Divider height="1px" bgColor="stroke" />
                    <Button
                        flexShrink="0"
                        colorScheme="accent"
                        px={6}
                        size="sm"
                        onClick={() =>
                            Router.replace({ query: { ...Router.query, type: "events" } })
                        }
                    >
                        Load More Events
                    </Button>
                    <Divider height="1px" bgColor="stroke" />
                </Flex>
            ) : null}
        </div>
    );
}

export default function AllResults({ query }: SearchResultsTabProps): ReactElement {
    const { data, error, mutate, isValidating } = useSWR(
        `search?query=${query}&type=all&page=0`,
        fetcher<SearchAllRes>,
        {
            revalidateOnFocus: false,
        },
    );

    useEffect(() => {
        if (error) {
            toast.error(
                error?.response?.data?.message ?? "An error occurred while searching",
            );
        }
    }, [error]);

    if (isValidating && !data)
        return (
            <div className="flex flex-col w-full gap-2 items-center py-5">
                <Spinner />
            </div>
        );

    if (
        (!isValidating && !data) ||
        (data?.users.length === 0 && data?.events.length === 0)
    )
        return (
            <div className="flex flex-col w-full gap-2 items-center py-5">
                <p className="text-3xl font-bold">
                    No results found
                </p>
            </div>
        );

    if (!data) return <></>;

    return (
        <div className="flex flex-col w-full gap-10 items-center">
            {data.users.length !== 0 ? <Users users={data.users} /> : null}
            {data.events.length !== 0 ? (
                <Events events={data.events} mutate={mutate} />
            ) : null}
        </div>
    );
}
