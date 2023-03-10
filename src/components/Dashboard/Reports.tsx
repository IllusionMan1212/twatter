import { ReactElement, useEffect, useState } from "react";
import { Tab, TabList, TabPanels, Tabs, TabPanel, VStack, Spinner, Image, Select } from "@chakra-ui/react";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "src/utils/helpers";
import { AxiosError } from "axios";
import { GenericBackendRes, GetReportsRes } from "src/types/server";
import { IReport, IReportPost } from "src/types/interfaces";
import { Virtuoso } from "react-virtuoso";
import FullDate from "src/components/FullDate";
import NextLink from "next/link";
import Avatar from "../User/Avatar";
import Router from "next/router";
import { parsingOptions } from "../Post/Post";
import Attachments from "../Attachments/AttachmentsContainer";
import RelativeTime from "../Post/RelativeTime";
import HTMLToJSX from "html-react-parser";
import { Flag } from "phosphor-react";

interface EmbeddedPostProps {
    post: IReportPost;
}

function EmbeddedPost({ post }: EmbeddedPostProps) {
    return (
        <>
            <div
                className="w-full hover:cursor-pointer"
                onClick={async () => {
                    await Router.push(`/@${post.author.username}/${post.id}`);
                }}
            >
                <div className="w-full bg-[color:var(--chakra-colors-bgPrimary)] p-3 pb-2 rounded space-y-1">
                    <div className="flex w-full space-x-3">
                        <NextLink href={`/@${post.author.username}`} passHref>
                            <a
                                className="self-start"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Avatar
                                    src={post.author.avatarURL}
                                    alt={`${post.author.username}'s avatar`}
                                    width="50px"
                                    height="50px"
                                    pauseAnimation
                                />
                            </a>
                        </NextLink>
                        <div className="flex flex-col w-full items-start space-y-1 min-w-0">
                            <div className="flex items-center justify-between w-full">
                                <NextLink href={`/@${post.author.username}`} passHref>
                                    <a
                                        className="hover:underline min-w-0"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center w-full space-x-1">
                                            <p className="text-base font-semibold truncate">
                                                {post.author.displayName}
                                            </p>
                                            <p className="text-sm text-[color:var(--chakra-colors-textMain)] truncate min-w-[60px]">
                                                @{post.author.username}
                                            </p>
                                        </div>
                                    </a>
                                </NextLink>
                            </div>
                            <p className="[overflow-wrap:anywhere] whitespace-pre-line">
                                {HTMLToJSX(post.content, parsingOptions)}
                            </p>
                            {post.attachments ? (
                                <div className="w-full">
                                    <Attachments attachments={post.attachments} />
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex w-full justify-between items-end">
                        <p className="text-xs py-2 text-[color:var(--chakra-colors-textMain)]">
                            <RelativeTime date={post.createdAt} />
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

type ReportProps = Omit<IReport, "originalReportId">;

function Report({
    reason,
    firstReportedAt,
    lastReportedAt,
    originalReportSubmitterUsername,
    reports,
    resolved,
    resolvedAt,
    Post,
}: ReportProps): ReactElement {
    return (
        <div className="flex flex-col space-y-4 border-b-[color:var(--chakra-colors-bgPrimary)] border-b-[1px] py-3">
            <div className="flex gap-2 wrap">
                <div className="flex flex-col gap-1">
                    First Reported At: <FullDate ISODate={firstReportedAt} />
                </div>
                <div className="flex flex-col gap-1">
                    Last Reported At: <FullDate ISODate={lastReportedAt} />
                </div>
                {resolved && (<div className="flex flex-col gap-1">
                    Resolved At: <FullDate ISODate={resolvedAt} />
                </div>)}
            </div>
            <div className="flex flex-col">
                <p className="text-lg">
                    Reason: <span className="font-semibold">{reason}</span>
                </p>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex justify-center items-center p-2 bg-[color:var(--chakra-colors-bgPrimary)] rounded-full">
                    <Flag weight="fill" size={20} color="var(--chakra-colors-textMain)" />
                </div>
                <p className="text-sm text-[color:var(--chakra-colors-textMain)]">
                    {reports - 1 !== 0 ? (
                        <span>@{originalReportSubmitterUsername} and {reports - 1} others</span>
                    ) : (
                        <NextLink href={`/@${originalReportSubmitterUsername}`} passHref>
                            <a className="hover:underline usernameLink">
                                <span className="font-semibold">
                                    @{originalReportSubmitterUsername}
                                </span>
                            </a>
                        </NextLink>
                    )}
                </p>
            </div>
            <EmbeddedPost post={Post} />
            {/* <ListOfReportersModal isOpen={isOpen} onClose={onClose} postId={Post.id} reason={reason} /> */}
        </div>
    );
}

function PendingReports(): ReactElement {
    const [reachedEnd, setReachedEnd] = useState(false);
    const [reports, setReports] = useState<IReport[]>([]);

    const getKey = (pageIndex: number) => {
        return `admin/get-pending-reports/${pageIndex}`;
    };

    const {
        data,
        isValidating,
        error,
        size: page,
        setSize: setPage,
    } = useSWRInfinite<GetReportsRes, AxiosError<GenericBackendRes>>(getKey, fetcher, {
        revalidateOnFocus: false
    });

    const loadMoreReports = async () => {
        if (reachedEnd) {
            return;
        }

        await setPage(page + 1);
    };

    const Footer = (): ReactElement | null => {
        if (!reachedEnd)
            return (
                <VStack py={4} width="full">
                    <Spinner size="lg" />
                </VStack>
            );

        return null;
    };

    useEffect(() => {
        if (data) {
            setReports(
                data.reduce((prev, curr) => curr.reports.concat(prev), [] as IReport[]),
            );

            if (data[data.length - 1].reports.length < 25) {
                setReachedEnd(true);
            }
        }
    }, [data]);

    if (error) {
        return (
            <div>
                <p className="font-bold">
                    {error.response?.data.message ?? "An error occurred while fetching resolved reports"}
                </p>
            </div>
        );
    }

    if (!isValidating && data?.[0]?.reports.length === 0) {
        return (
            <VStack width="full" spacing={4} textAlign="center">
                <Image
                    fit="cover"
                    width="250px"
                    src="/graphics/Deleted.png"
                    alt="List is empty graphic"
                />
                <p className="font-bold text-3xl">
                    There are no pending reports
                </p>
            </VStack>
        );
    }

    return (
        <>
            <div className="flex items-center gap-3 mb-6">
                <p className="text-xl font-bold">Filter:</p>
                <Select
                    placeholder="All"
                    variant="outline"
                    borderColor="stroke"
                    size="sm"
                    rounded="md"
                    isDisabled={isValidating}
                    width="max-content"
                >
                    <option value="nudity-sex">Nudity or Sex</option>
                    <option value="terrorism-violence">Terrorism or Violence</option>
                    <option value="spam">Spam</option>
                    <option value="other">Other</option>
                </Select>
            </div>
            <Virtuoso
                data={reports}
                totalCount={reports.length}
                endReached={loadMoreReports}
                useWindowScroll
                components={{
                    Footer,
                }}
                itemContent={(_, report) => (
                    <Report
                        key={report.originalReportId}
                        reason={report.reason}
                        originalReportSubmitterUsername={report.originalReportSubmitterUsername}
                        Post={report.Post}
                        reports={report.reports}
                        firstReportedAt={report.firstReportedAt}
                        lastReportedAt={report.lastReportedAt}
                        resolved={report.resolved}
                        resolvedAt={report.resolvedAt}
                    />
                )}
            />
        </>
    );
}

function ResolvedReports(): ReactElement {
    const [reachedEnd, setReachedEnd] = useState(false);
    const [reports, setReports] = useState<IReport[]>([]);

    const getKey = (pageIndex: number) => {
        return `admin/get-resolved-reports/${pageIndex}`;
    };

    const {
        data,
        isValidating,
        error,
        size: page,
        setSize: setPage,
    } = useSWRInfinite<GetReportsRes, AxiosError<GenericBackendRes>>(getKey, fetcher, {
        revalidateOnFocus: false
    });

    const loadMoreReports = async () => {
        if (reachedEnd) {
            return;
        }

        await setPage(page + 1);
    };

    const Footer = (): ReactElement | null => {
        if (!reachedEnd)
            return (
                <VStack py={4} width="full">
                    <Spinner size="lg" />
                </VStack>
            );

        return null;
    };

    useEffect(() => {
        if (data) {
            setReports(
                data.reduce((prev, curr) => curr.reports.concat(prev), [] as IReport[]),
            );

            if (data[data.length - 1].reports.length < 25) {
                setReachedEnd(true);
            }
        }
    }, [data]);

    if (error) {
        return (
            <div>
                <p className="font-bold">
                    {error.response?.data.message ?? "An error occurred while fetching resolved reports"}
                </p>
            </div>
        );
    }

    if (!isValidating && data?.[0]?.reports.length === 0) {
        return (
            <VStack width="full" spacing={4} textAlign="center">
                <Image
                    fit="cover"
                    width="250px"
                    src="/graphics/Deleted.png"
                    alt="List is empty graphic"
                />
                <p className="font-bold text-3xl">
                    There are no resolved reports
                </p>
            </VStack>
        );
    }

    return (
        <Virtuoso
            data={reports}
            totalCount={reports.length}
            endReached={loadMoreReports}
            useWindowScroll
            components={{
                Footer,
            }}
            itemContent={(_, report) => (
                <Report
                    key={report.originalReportId}
                    reason={report.reason}
                    originalReportSubmitterUsername={report.originalReportSubmitterUsername}
                    Post={report.Post}
                    reports={report.reports}
                    firstReportedAt={report.firstReportedAt}
                    lastReportedAt={report.lastReportedAt}
                    resolved={report.resolved}
                    resolvedAt={report.resolvedAt}
                />
            )}
        />
    );
}

export default function Reports(): ReactElement {
    return (
        <div className="flex w-full">
            <Tabs width="40em">
                <TabList>
                    <Tab width="full">Pending</Tab>
                    <Tab width="full">Resolved</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <PendingReports />
                    </TabPanel>
                    <TabPanel>
                        <ResolvedReports />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    );
}
