import { Spinner, VStack, Text } from "@chakra-ui/react";
import { ReactElement, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SearchUsersRes } from "src/types/server";
import { fetcher } from "src/utils/helpers";
import useSWRInfinite from "swr/infinite";
import User from "src/components/User/User";
import { ISearchUser, SearchResultsTabProps } from "src/types/interfaces";
import { Virtuoso } from "react-virtuoso";
import styles from "src/styles/SearchResults.module.scss";

export default function UsersResults({ query }: SearchResultsTabProps): ReactElement {
    const [results, setResults] = useState<ISearchUser[]>([]);
    const [reachedEnd, setReachedEnd] = useState(false);

    const getKey = (pageIndex: number) => {
        return `search?query=${query}&type=user&page=${pageIndex}`;
    };

    const {
        data,
        error,
        isValidating,
        size: page,
        setSize: setPage,
    } = useSWRInfinite(getKey, fetcher<SearchUsersRes>, {
        revalidateOnFocus: false,
    });

    const loadMoreUsers = async () => {
        if (reachedEnd) {
            return;
        }

        await setPage(page + 1);
    };

    const Footer = (): ReactElement | null => {
        if (!reachedEnd)
            return (
                <VStack width="full" py={5}>
                    <Spinner />
                </VStack>
            );

        return null;
    };

    useEffect(() => {
        if (data) {
            setResults(
                data.reduce((prev, curr) => curr.users.concat(prev), [] as ISearchUser[]),
            );

            if (data[data.length - 1].users.length < 20) {
                setReachedEnd(true);
            }
        }

        if (error) {
            toast.error(
                error?.response?.data?.message ?? "An error occurred while searching",
            );
        }
    }, [data, error]);

    if (!isValidating && data?.[0]?.users.length === 0)
        return (
            <VStack width="full" py={5}>
                <Text fontWeight="bold" fontSize="3xl">
                    No results found
                </Text>
            </VStack>
        );

    return (
        <Virtuoso
            className={styles.results}
            data={results}
            totalCount={results.length}
            endReached={loadMoreUsers}
            useWindowScroll
            components={{
                Footer: () => <Footer />,
            }}
            itemContent={(_, user) => (
                <User
                    key={user.id}
                    id={user.id}
                    displayName={user.displayName}
                    username={user.username}
                    avatarURL={user.avatarURL}
                    allowAllDMs={user.allowAllDMs}
                />
            )}
        />
    );
}
