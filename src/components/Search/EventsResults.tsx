import { Spinner } from "@chakra-ui/react";
import { ReactElement, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IEvent, SearchResultsTabProps } from "src/types/interfaces";
import { SearchEventsRes } from "src/types/server";
import { fetcher } from "src/utils/axios";
import useSWRInfinite from "swr/infinite";
import Event from "src/components/Event/Event";
import styles from "src/styles/SearchResults.module.scss";
import { Virtuoso } from "react-virtuoso";

export default function EventsResults({ query }: SearchResultsTabProps): ReactElement {
    const [results, setResults] = useState<IEvent[]>([]);
    const [reachedEnd, setReachedEnd] = useState(false);

    const getKey = (pageIndex: number) => {
        return `search?query=${query}&type=event&page=${pageIndex}`;
    };

    const {
        data,
        error,
        isValidating,
        mutate,
        size: page,
        setSize: setPage,
    } = useSWRInfinite(getKey, fetcher<SearchEventsRes>, {
        revalidateOnFocus: false,
    });

    const loadMoreEvents = async () => {
        if (reachedEnd) {
            return;
        }

        await setPage(page + 1);
    };

    const Footer = (): ReactElement | null => {
        if (!reachedEnd)
            return (
                <div className="flex flex-col w-full py-5 gap-2 items-center">
                    <Spinner />
                </div>
            );

        return null;
    };

    useEffect(() => {
        if (data) {
            setResults(
                data.reduce((prev, curr) => curr.events.concat(prev), [] as IEvent[]),
            );

            if (data[data.length - 1].events.length < 20) {
                setReachedEnd(true);
            }
        }

        if (error) {
            toast.error(
                error?.response?.data?.message ?? "An error occurred while searching",
            );
        }
    }, [data, error]);

    if (!isValidating && data?.[0]?.events.length === 0)
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
            endReached={loadMoreEvents}
            useWindowScroll
            components={{
                Footer: () => <Footer />,
            }}
            itemContent={(_, event) => (
                <Event
                    id={event.id}
                    key={event.id}
                    title={event.title}
                    date={event.time}
                    description={event.description ?? ""}
                    imageURL={event.imageURL ?? ""}
                    location={event.location}
                    isInterested={event.isInterested ?? false}
                    interest={event.interest}
                    mutateEvents={mutate}
                />
            )}
        />
    );
}
