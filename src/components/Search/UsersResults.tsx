import { Spinner } from "@chakra-ui/react";
import { ReactElement, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SearchUsersRes } from "src/types/server";
import { fetcher } from "src/utils/axios";
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
                <div className="flex flex-col w-full gap-2 items-center py-5">
                    <Spinner />
                </div>
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
            <div className="flex flex-col gap-2 items-center w-full py-5">
                <p className="text-3xl font-bold">
                    No results found
                </p>
            </div>
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
                    isFollowing={user.isFollowing}
                />
            )}
        />
    );
}
