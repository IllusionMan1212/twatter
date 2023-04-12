import { ReactElement, useEffect, useState } from "react";
import {
    Tab,
    TabList,
    TabPanels,
    Tabs,
    TabPanel,
    VStack,
    Spinner,
    Image,
    Select,
    ModalOverlay,
    Modal,
    ModalContent,
    ModalBody,
    useDisclosure,
    ModalHeader,
    ModalFooter,
    Collapse,
    IconButton as ChakraIconButton
} from "@chakra-ui/react";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "src/utils/axios";
import { AxiosError } from "axios";
import { GenericBackendRes, GetReportersRes, GetReportsRes } from "src/types/server";
import { IReport, IReporter, IReportPost } from "src/types/interfaces";
import { Virtuoso } from "react-virtuoso";
import FullDate from "src/components/FullDate";
import NextLink from "next/link";
import Avatar from "../User/Avatar";
import Router from "next/router";
import { parsingOptions } from "../Post/Post";
import Attachments from "../Attachments/AttachmentsContainer";
import RelativeTime from "../Post/RelativeTime";
import HTMLToJSX from "html-react-parser";
import { Flag, Plus, Minus } from "@phosphor-icons/react";
import { CheckIcon, TrashIcon } from "@heroicons/react/solid";
import IconButton from "../IconButton";
import toast from "react-hot-toast";
import { KeyedMutator } from "swr";
import { axiosInstance } from "src/utils/axios";

interface EmbeddedPostProps {
    post: IReportPost;
}

function EmbeddedPost({ post }: EmbeddedPostProps): ReactElement {
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

interface ListOfReportersModalProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
    reason: string;
}

function ListOfReportersModal({
    isOpen,
    onClose,
    postId,
    reason,
}: ListOfReportersModalProps): ReactElement {
    const [reporters, setReporters] = useState<IReporter[]>([]);
    const [reachedEnd, setReachedEnd] = useState(false);

    const getKey = (pageIndex: number) => {
        return `admin/reporters/${postId}/${reason}/${pageIndex}`;
    };

    const {
        data,
        error,
        size: page,
        setSize: setPage,
    } = useSWRInfinite<GetReportersRes, AxiosError<GenericBackendRes>>(getKey, fetcher, {
        revalidateOnFocus: false,
    });

    const Footer = (): ReactElement | null => {
        if (!reachedEnd)
            return (
                <VStack py={4} width="full">
                    <Spinner size="lg" />
                </VStack>
            );

        return null;
    };

    const loadMoreReporters = async () => {
        if (reachedEnd) {
            return;
        }

        await setPage(page + 1);
    };

    useEffect(() => {
        if (data) {
            setReporters(
                data.reduce(
                    (prev, curr) => curr.reporters.concat(prev),
                    [] as IReporter[],
                ),
            );

            if (data[data.length - 1].reporters.length < 30) {
                setReachedEnd(true);
            }
        }
    }, [data]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent bgColor="bgMain">
                <ModalHeader />
                <ModalBody>
                    {error ? (
                        <div>
                            <p className="font-bold">
                                {error.response?.data.message ??
                                    "An error occurred while fetching report submitters"}
                            </p>
                        </div>
                    ) : (
                        <Virtuoso
                            data={reporters}
                            totalCount={reporters.length}
                            useWindowScroll
                            endReached={loadMoreReporters}
                            components={{
                                Footer
                            }}
                            itemContent={(_, reporter) => (
                                <div className="flex flex-col gap-1 mb-1">
                                    <div className="flex items-center gap-2">
                                        <Avatar
                                            src={reporter.Submitter.avatarURL}
                                            alt={`${reporter.Submitter.username}'s avatar`}
                                            width="40px"
                                            height="40px"
                                            pauseAnimation
                                        />
                                        <div className="flex flex-col">
                                            <p>@{reporter.Submitter.username}</p>
                                            <FullDate ISODate={reporter.createdAt} />
                                        </div>
                                    </div>
                                    <p className="text-sm">{reporter.comments}</p>
                                </div>
                            )}
                        />
                    )}
                </ModalBody>
                <ModalFooter />
            </ModalContent>
        </Modal>
    );
}

interface ReportProps extends Omit<IReport, "originalReportId"> {
    mutate?: KeyedMutator<GetReportsRes[]>;
}

function Report({
    reason,
    firstReportedAt,
    lastReportedAt,
    originalReportSubmitterUsername,
    reports,
    originalReportComments,
    resolved,
    resolvedAt,
    resolveReason,
    Post,
    mutate,
}: ReportProps): ReactElement {
    const { isOpen, onClose, onOpen } = useDisclosure();
    const { isOpen: isPostOpen, onToggle } = useDisclosure();

    const resolveReport = (deleted: boolean) => {
        axiosInstance.patch<GenericBackendRes>("admin/resolve-report", { reason, postId: Post.id, deleted })
            .then(async (res) => {
                await mutate?.();
                toast.success(res.data.message);
            })
            .catch((err) => {
                toast.error(err.response?.data.message ?? "An error occurred while resolving report");
            });
    };

    return (
        <div className="flex flex-col gap-3 border-b-[color:var(--chakra-colors-bgPrimary)] border-b-[1px] py-3">
            <div className="flex gap-1 justify-between">
                <div className="flex w-full flex-col space-y-4">
                    <div className="flex gap-3 flex-wrap">
                        <div className="flex flex-col gap-1">
                            First Reported At: <FullDate ISODate={firstReportedAt} />
                        </div>
                        <div className="flex flex-col gap-1">
                            Last Reported At: <FullDate ISODate={lastReportedAt} />
                        </div>
                        {resolved && (
                            <div className="flex flex-col gap-1">
                                Resolved At: <FullDate ISODate={resolvedAt} />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <p className="text-lg">
                            Reason: <span className="font-semibold">{reason}</span>
                        </p>
                        {resolved && (
                            <p className="text-lg">
                                Resolve Reason: <span className="font-semibold">{resolveReason}</span>
                            </p>
                        )}
                    </div>
                    {originalReportComments && (
                        <div className="flex flex-col">
                            <p className="text-lg font-semibold">
                                @{originalReportSubmitterUsername}&apos;s Comments:
                            </p>
                            <p>{originalReportComments}</p>
                        </div>
                    )}
                </div>
                {!resolved && (
                    <div className="flex flex-col gap-3">
                        <IconButton
                            className="rounded-full bg-red-400/30"
                            ariaLabel="Delete"
                            hoverColor="hover:bg-red-400/10"
                            activeColor="active:bg-red-400/20"
                            icon={<TrashIcon width="24" height="24" color="var(--chakra-colors-red-400)" />}
                            onClick={() => resolveReport(true)}
                        />
                        <IconButton
                            className="rounded-full bg-gray-400/30"
                            ariaLabel="Approve"
                            hoverColor="hover:bg-gray-400/10"
                            activeColor="active:bg-gray-400/20"
                            icon={<CheckIcon width="24" height="24" color="var(--chakra-colors-gray-400)" />}
                            onClick={() => resolveReport(false)}
                        />
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="flex justify-center items-center p-2 bg-[color:var(--chakra-colors-bgPrimary)] rounded-full">
                        <Flag weight="fill" size={20} color="var(--chakra-colors-textMain)" />
                    </div>
                    <p className="text-sm text-[color:var(--chakra-colors-textMain)]">
                        {reports - 1 !== 0 ? (
                            <span className="hover:underline hover:cursor-pointer" onClick={onOpen}>
                                @{originalReportSubmitterUsername} and {reports - 1} others
                            </span>
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
                <ChakraIconButton
                    aria-label="Expand Post"
                    onClick={onToggle}
                    size="sm"
                    variant="ghost"
                    colorScheme="button"
                    icon={isPostOpen ? <Minus size="20" weight="bold" /> : <Plus size="20" weight="bold" />}
                />
            </div>
            <Collapse in={isPostOpen} animateOpacity>
                <EmbeddedPost post={Post} />
            </Collapse>
            {isOpen && (<ListOfReportersModal
                isOpen={isOpen}
                onClose={onClose}
                postId={Post.id}
                reason={reason}
            />)}
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
        mutate,
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
                    src="/graphics/Deleted.avif"
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
                    isDisabled
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
                        originalReportComments={report.originalReportComments}
                        firstReportedAt={report.firstReportedAt}
                        lastReportedAt={report.lastReportedAt}
                        resolved={report.resolved}
                        resolvedAt={report.resolvedAt}
                        resolveReason={report.resolveReason}
                        mutate={mutate}
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
                    src="/graphics/Deleted.avif"
                    alt="List is empty graphic"
                />
                <p className="font-bold text-3xl">
                    There are no resolved reports
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
                    isDisabled
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
                        originalReportComments={report.originalReportComments}
                        firstReportedAt={report.firstReportedAt}
                        lastReportedAt={report.lastReportedAt}
                        resolved={report.resolved}
                        resolvedAt={report.resolvedAt}
                        resolveReason={report.resolveReason}
                    />
                )}
            />
        </>
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
