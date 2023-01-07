import { Text, Spinner, VStack, Divider, Button, Flex } from "@chakra-ui/react";
import { ReactElement, useEffect } from "react";
import toast from "react-hot-toast";
import { IEvent, ISearchUser, SearchResultsTabProps } from "src/types/interfaces";
import { SearchAllRes } from "src/types/server";
import { fetcher } from "src/utils/helpers";
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
        <VStack width="full" align="start">
            <Text fontSize="2xl" fontWeight="bold">
                Users
            </Text>
            {users.map((user) => (
                <User
                    key={user.id}
                    id={user.id}
                    displayName={user.displayName}
                    username={user.username}
                    avatarURL={user.avatarURL}
                    allowAllDMs={user.allowAllDMs}
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
        </VStack>
    );
}

function Events({ events, mutate }: EventsResultsProps): ReactElement {
    return (
        <VStack width="full" align="start">
            <Text fontSize="2xl" fontWeight="bold">
                Events
            </Text>
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
        </VStack>
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
            <VStack width="full" py={5}>
                <Spinner />
            </VStack>
        );

    if (
        (!isValidating && !data) ||
        (data?.users.length === 0 && data?.events.length === 0)
    )
        return (
            <VStack width="full" py={5}>
                <Text fontWeight="bold" fontSize="3xl">
                    No results found
                </Text>
            </VStack>
        );

    if (!data) return <></>;

    return (
        <VStack width="full" spacing={10}>
            {data.users.length !== 0 ? <Users users={data.users} /> : null}
            {data.events.length !== 0 ? (
                <Events events={data.events} mutate={mutate} />
            ) : null}
        </VStack>
    );
}
