import dynamic from "next/dynamic";
import {
    Divider,
    Flex,
    VStack,
    Text,
    IconButton,
    Icon,
    HStack,
    Tooltip,
    Image,
    Box,
    useDisclosure,
    ModalOverlay,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Spinner,
    ModalFooter,
} from "@chakra-ui/react";
import { PlusIcon } from "@heroicons/react/solid";
import { ChangeEvent, ReactElement, useEffect, useReducer, useState } from "react";
import { MessagingActions } from "src/actions/messaging";
import Conversation from "src/components/Messaging/Conversation";
import ConversationArea from "src/components/Messaging/ConversationArea";
import NewMessageIcon from "src/components/Icons/NewMessageIcon";
import SearchBar from "src/components/Search/SearchBar";
import { IConversation, IMessage, ISearchUser } from "src/types/interfaces";
import { MessagingState, messagingReducer } from "src/reducers/messaging";
import Fuse from "fuse.js";
import { useRouter } from "next/router";
import {
    GenericBackendRes,
    GetConversationsRes,
    GetRecommendedMessagingPeopleRes,
    SearchUsersRes,
} from "src/types/server";
import { fetcher } from "src/utils/helpers";
import useSWRInfinite from "swr/infinite";
import toast from "react-hot-toast";
import { Virtuoso } from "react-virtuoso";
const User = dynamic(() => import("src/components/User/User"));
import styles from "src/styles/messages.module.scss";
import { MarkMessagesAsReadData } from "server/sockets/types";
import { useUserContext } from "src/contexts/userContext";
import useSWR, { KeyedMutator } from "swr";
import { AxiosError } from "axios";
import { NextSeo } from "next-seo";
import { messagesSEO } from "next-seo.config";

const initialState: MessagingState = {
    activeConversation: null,
    conversations: [] as IConversation[],
    messages: [] as IMessage[],
};

interface RecommendedProps {
    onClose: () => void;
    mutateConvos: KeyedMutator<GetConversationsRes[]>;
}

function Recommended({ onClose, mutateConvos }: RecommendedProps): ReactElement {
    const [users, setUsers] = useState<ISearchUser[]>([]);

    const { data, error, isValidating } = useSWR<
        GetRecommendedMessagingPeopleRes,
        AxiosError<GenericBackendRes>
    >("message/get-recommended-people", fetcher, {
        revalidateOnFocus: false,
    });

    const startConvoCB = async () => {
        onClose();
        await mutateConvos();
    };

    useEffect(() => {
        if (data) {
            setUsers(data.people);
        }
    }, [data]);

    if (!isValidating && !users.length && !error) return <></>;

    if (error)
        return (
            <Text fontSize="lg" fontWeight="semibold">
                {error.response?.data.message ??
                    "An error occurred while fetching recommendations"}
            </Text>
        );

    if (!isValidating && !users.length)
        return (
            <VStack width="full">
                <Text fontSize="lg" fontWeight="semibold">
                    No results found
                </Text>
            </VStack>
        );

    return (
        <VStack align="start" width="full" spacing={2}>
            <Text fontSize="lg" fontWeight="semibold">
                Recommended
            </Text>
            {isValidating && !users.length ? (
                <VStack width="full">
                    <Spinner />
                </VStack>
            ) : (
                <VStack spacing={1} width="full">
                    {users.map((user) => (
                        <User
                            key={user.id}
                            id={user.id}
                            displayName={user.displayName}
                            username={user.username}
                            avatarURL={user.avatarURL}
                            allowAllDMs={user.allowAllDMs}
                            startConvoCB={startConvoCB}
                        />
                    ))}
                </VStack>
            )}
        </VStack>
    );
}

interface SearchResultsProps extends RecommendedProps {
    getKey: () => string;
    isTyping: boolean;
}

function SearchResults({
    onClose,
    mutateConvos,
    getKey,
    isTyping,
}: SearchResultsProps): ReactElement {
    const [results, setResults] = useState<ISearchUser[]>([]);

    const { data, error, isValidating } = useSWR<SearchUsersRes>(getKey, fetcher, {
        revalidateOnFocus: false,
    });

    const startConvoCB = async () => {
        onClose();
        await mutateConvos();
    };

    useEffect(() => {
        if (data) {
            setResults(data.users);
        }
    }, [data]);

    if (isTyping || (isValidating && !results.length))
        return (
            <VStack width="full">
                <Spinner />
            </VStack>
        );

    if (error)
        return (
            <Text fontSize="lg" fontWeight="semibold">
                {error.response?.data.message ??
                    "An error occurred while search for users"}
            </Text>
        );

    if (!isValidating && !results.length)
        return (
            <VStack width="full">
                <Text fontSize="lg" fontWeight="semibold">
                    No results found
                </Text>
            </VStack>
        );

    return (
        <VStack width="full" align="start" spacing={2}>
            <Text fontSize="lg" fontWeight="semibold">
                Results
            </Text>
            <VStack width="full" spacing={1}>
                {results.map((user) => (
                    <User
                        key={user.id}
                        id={user.id}
                        displayName={user.displayName}
                        username={user.username}
                        avatarURL={user.avatarURL}
                        allowAllDMs={user.allowAllDMs}
                        startConvoCB={startConvoCB}
                    />
                ))}
            </VStack>
        </VStack>
    );
}

interface NewConversationProps {
    isOpen: boolean;
    onClose: () => void;
    mutateConvos: KeyedMutator<GetConversationsRes[]>;
}

function NewConversationModal({
    onClose,
    isOpen,
    mutateConvos,
}: NewConversationProps): ReactElement {
    const [isTyping, setIsTyping] = useState(false);
    const [query, setQuery] = useState("");
    const [hasText, setHasText] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>(undefined);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setHasText(!!e.target.value.trim());

        clearTimeout(timeoutId);
        setTimeoutId(undefined);
        setIsTyping(true);

        setTimeoutId(
            setTimeout(() => {
                setQuery(e.target.value.trim());
                setIsTyping(false);
            }, 500),
        );
    };

    const getKey = () => {
        return `search?query=${query}&type=user&page=0`;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent bgColor="bgMain">
                <ModalHeader fontWeight="normal">
                    <SearchBar rounded="lg" size="md" onChange={handleChange} />
                </ModalHeader>
                <ModalBody>
                    {hasText ? (
                        <SearchResults
                            onClose={onClose}
                            isTyping={isTyping}
                            mutateConvos={mutateConvos}
                            getKey={getKey}
                        />
                    ) : null}
                    <Box display={!hasText ? "initial" : "none"}>
                        <Recommended onClose={onClose} mutateConvos={mutateConvos} />
                    </Box>
                </ModalBody>
                <ModalFooter />
            </ModalContent>
        </Modal>
    );
}

function NoActiveConversation(): ReactElement {
    return (
        <VStack
            width="full"
            textAlign="center"
            height="full"
            align="center"
            justify="center"
        >
            <Text fontSize="3xl">You haven&apos;t opened a conversation yet</Text>
            <Text fontSize="lg" color="textMain">
                Open one of your existing conversations or start a new one
            </Text>
        </VStack>
    );
}

function NoMessages(): ReactElement {
    return (
        <VStack my={4} spacing={10} align="center" justify="center" width="full">
            <Box boxSize="250px">
                <Image
                    fit="cover"
                    alt="No new messages graphic"
                    src="/graphics/No_New_Messages.png"
                />
            </Box>
            <VStack>
                <Text fontSize="3xl" fontWeight="bold">
                    No Messages
                </Text>
                <Text align="center" color="textMain">
                    Looks like you haven&apos;t initiated a conversation with anyone yet.
                </Text>
            </VStack>
        </VStack>
    );
}

const fuseOptions = {
    includeScore: true,
    keys: [
        {
            name: "members.User.username",
            weight: 0.5,
        },
        {
            name: "members.User.displayName",
        },
    ],
};

const getKey = (pageIndex: number) => {
    return `message/get-conversations/${pageIndex}`;
};

export default function Messages(): ReactElement {
    const { user, socket } = useUserContext();
    const [state, dispatch] = useReducer(messagingReducer, initialState);
    const [filteredConversations, setFilteredConversations] = useState<IConversation[]>(
        state.conversations,
    );
    const [reachedEnd, setReachedEnd] = useState(false);
    const [isFiltering, setFiltering] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const router = useRouter();
    const fuse = new Fuse(state.conversations, fuseOptions);

    const {
        data,
        error,
        isValidating,
        mutate,
        size: page,
        setSize: setPage,
    } = useSWRInfinite(getKey, fetcher<GetConversationsRes>, {
        initialSize: 2,
        revalidateOnFocus: false,
    });

    const loadMoreConversations = async () => {
        if (reachedEnd) {
            return;
        }

        await setPage(page + 1);
    };

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.value) {
            setFilteredConversations(state.conversations);
            setFiltering(false);
            return;
        }

        setFiltering(true);

        const res = fuse.search(e.target.value).sort((a, b) => {
            if (a.score && b.score) {
                return a.score < b.score ? 1 : -1;
            }
            return 0;
        });

        const newConversations = res.reduce((prevVal, currVal) => {
            prevVal.push(currVal.item);
            return prevVal;
        }, [] as IConversation[]);

        setFilteredConversations(newConversations);
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
        if (router.query.conversationId?.[0] === state.activeConversation?.id) {
            return;
        }

        if (!router.query?.conversationId?.[0]) {
            dispatch({
                type: MessagingActions.CHANGE_CONVERSATION,
                payload: {
                    activeConversation: null,
                },
            });
            return;
        }

        const conversation =
            state.conversations.find(
                (convo) => convo.id === router.query.conversationId![0],
            ) ?? null;
        if (user?.settings?.readReceipts) {
            if (conversation && user) {
                const payload: MarkMessagesAsReadData = {
                    conversationId: conversation.id,
                    userId: user.id,
                    recipientId: conversation.members[0].User.id,
                };
                socket?.emit("markMessagesAsRead", payload);
            }
        }

        dispatch({
            type: MessagingActions.CHANGE_CONVERSATION,
            payload: {
                activeConversation: conversation,
            },
        });
    }, [router.query.conversationId, state.conversations]);

    useEffect(() => {
        if (data) {
            dispatch({
                type: MessagingActions.FETCH_CONVERSATIONS,
                payload: {
                    conversations: data.reduce(
                        (prev, curr) => curr.conversations.concat(prev),
                        [] as IConversation[],
                    ),
                },
            });

            if (data[data.length - 1].conversations.length < 20) {
                setReachedEnd(true);
            }
        }

        if (error) {
            toast.error(
                error?.response?.data?.message ??
                    "An error occurred while fetching conversations",
            );
        }
    }, [error, data]);

    useEffect(() => {
        setFilteredConversations(state.conversations);
    }, [state.conversations]);

    return (
        <Flex gap={{ base: 0, lg: 10 }} position="relative">
            <NextSeo {...messagesSEO} />
            <Flex
                gap={4}
                direction="column"
                height={{
                    base: "calc(100vh - var(--chakra-headerHeight-mobile) - var(--chakra-navBarHeight))",
                    md: "calc(100vh - var(--chakra-headerHeight-desktop) - 2.5rem)",
                }}
                align="center"
                flex="4"
            >
                <VStack
                    display={{ base: "none", lg: "initial" }}
                    align="start"
                    width="full"
                >
                    <HStack width="full" justify="space-between">
                        <Text fontSize="xl" fontWeight="semibold">
                            Messages
                        </Text>
                        <Tooltip openDelay={300} label="Start New Conversation">
                            <IconButton
                                boxSize="28px"
                                minWidth="28px"
                                variant="ghost"
                                aria-label="Start new conversation"
                                icon={<Icon as={PlusIcon} w="24px" h="24px" />}
                                onClick={onOpen}
                            />
                        </Tooltip>
                    </HStack>
                    <Divider height="1px" bgColor="bgSecondary" />
                </VStack>
                <HStack width="full" px={{ base: 3, md: 0 }}>
                    <SearchBar
                        placeholder="Search conversations..."
                        isDisabled={!state.conversations.length}
                        rounded="lg"
                        size="md"
                        onChange={handleSearchChange}
                    />
                    <IconButton
                        width="80px"
                        display={{ base: "initial", lg: "none" }}
                        variant="solid"
                        colorScheme="accent"
                        aria-label="Start new conversation"
                        icon={<NewMessageIcon strokeWidth={2} boxSize="30" />}
                        onClick={onOpen}
                    />
                </HStack>
                <Divider
                    width="80%"
                    height="2px"
                    bgColor="bgSecondary"
                    display={{ base: "initial", lg: "none" }}
                />
                <VStack
                    width="full"
                    height="full"
                    overflowY="scroll"
                    spacing={{ base: 0, md: 1 }}
                    align="start"
                >
                    {filteredConversations.length > 0 ? (
                        <Virtuoso
                            className={styles.conversations}
                            data={filteredConversations}
                            totalCount={filteredConversations.length}
                            endReached={loadMoreConversations}
                            components={{
                                Footer,
                            }}
                            itemContent={(_, convo) => (
                                <Conversation
                                    key={convo.id}
                                    recipientName={convo.members[0].User.displayName}
                                    recipientUsername={convo.members[0].User.username}
                                    recipientAvatarURL={convo.members[0].User.avatarURL}
                                    lastMessage={convo.lastMessage}
                                    updatedAt={convo.updatedAt}
                                    isActive={convo.id === state.activeConversation?.id}
                                    onClick={() => {
                                        if (
                                            router.query?.conversationsId?.[0] !==
                                            convo.id
                                        ) {
                                            router.push(`/messages/${convo.id}`);
                                        }
                                    }}
                                />
                            )}
                        />
                    ) : null}
                    {isValidating && state.conversations.length === 0 ? (
                        <VStack width="full">
                            <Spinner size="lg" />
                        </VStack>
                    ) : null}
                    {!isValidating && state.conversations.length === 0 && reachedEnd ? (
                        <NoMessages />
                    ) : null}
                    {!isValidating &&
                        isFiltering &&
                        state.conversations.length > 0 &&
                        !filteredConversations.length && (
                        <Text fontSize="xl" py={4} alignSelf="center">
                            No results found
                        </Text>
                    )}
                </VStack>
            </Flex>
            <VStack
                display={{
                    base: state.activeConversation ? "initial" : "none",
                    lg: "initial",
                }}
                flex={{ base: "0", lg: "7" }}
            >
                {state.activeConversation ? (
                    <ConversationArea
                        conversation={state.activeConversation}
                        state={state}
                        dispatch={dispatch}
                        mutateConvos={mutate}
                    />
                ) : (
                    <NoActiveConversation />
                )}
            </VStack>
            <NewConversationModal
                isOpen={isOpen}
                onClose={onClose}
                mutateConvos={mutate}
            />
        </Flex>
    );
}
