import {
    Flex,
    HStack,
    Button,
    Text,
    Image,
    Tag,
    Icon,
    VStack,
    Box,
    Spinner,
    ButtonGroup,
} from "@chakra-ui/react";
import { ChatCenteredDots } from "phosphor-react";
import { ReactElement, useEffect, useState } from "react";
import Post from "src/components/Post/Post";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { IPost, IUser } from "src/types/interfaces";
import {
    GenericBackendRes,
    GetPostsRes,
    GetUserRes,
    StartConversationRes,
} from "src/types/server";
import { axiosAuth, axiosNoAuth } from "src/utils/axios";
import Avatar from "src/components/User/Avatar";
import { AxiosError } from "axios";
import { useUserContext } from "src/contexts/userContext";
import toast from "react-hot-toast";
import useSWRInfinite from "swr/infinite";
import Router from "next/router";
import { Virtuoso } from "react-virtuoso";
import styles from "src/styles/userProfile.module.scss";
import { NextSeo } from "next-seo";
import BigNumber from "src/components/BigNumber";

interface Props {
    user: IUser & { _count: { posts: number } };
}

function Chat(): ReactElement {
    return <ChatCenteredDots size="24" />;
}

function Tags({ user }: Props): ReactElement {
    return (
        <Flex direction="column" align="start" gap={1}>
            {user.isAdmin ? (
                <Tag
                    variant="solid"
                    bgColor="bgPrimary"
                    color="textMain"
                    fontWeight="bold"
                    py={1}
                >
                    Administrator
                </Tag>
            ) : null}
        </Flex>
    );
}

function User({ user }: Props): ReactElement {
    const { user: currentUser } = useUserContext();

    const handleStartConversation = () => {
        axiosAuth
            .post<StartConversationRes>("message/start-conversation", { userId: user.id })
            .then((res) => {
                Router.push(`/messages/${res.data.conversationId}`);
            })
            .catch((e: AxiosError<GenericBackendRes>) => {
                toast.error(
                    e.response?.data.message ??
                        "An error occurred while starting the conversation",
                );
            });
    };

    return (
        <div className="flex flex-col gap-2 pt-6 md:pt-0 w-full items-center md:items-start">
            <Flex
                direction={{ base: "column", "600px": "row" }}
                gap={4}
                py={2}
                width="full"
                justify={{ base: "center", "600px": "space-between" }}
                align="center"
            >
                <HStack spacing={6}>
                    <Avatar
                        src={user.avatarURL}
                        alt={`${user.username}'s avatar`}
                        width="100px"
                        height="100px"
                    />
                    <Flex height="full" minWidth={0} gap={2} direction="column" align="start">
                        <Box minWidth={0}>
                            <p className="font-semibold text-2xl max-w-full break-all">
                                {user.displayName}
                            </p>
                            <Text fontSize="md" color="textMain" fontWeight="semibold">
                                @{user.username}
                            </Text>
                        </Box>
                        <Tags user={user} />
                    </Flex>
                </HStack>
                {currentUser ? (
                    <ButtonGroup
                        colorScheme="accent"
                        size="sm"
                    >
                        {/*TODO: follow button user.id !== currentUser?.id ? (
                            <Button variant="solid">
                                Follow
                            </Button>
                        ) : null */}
                        {!user.settings?.allowAllDMs ||
                        user.id === currentUser?.id ||
                        user.restricted ? null : (
                                <Button
                                    variant="outline"
                                    leftIcon={<Icon as={Chat} />}
                                    onClick={handleStartConversation}
                                >
                                    Message
                                </Button>
                            )}
                    </ButtonGroup>
                ) : null}
            </Flex>
            <div className="flex gap-2">
                <div>
                    <BigNumber className="font-semibold" num={0} />{" "}
                    <span className="text-[color:var(--chakra-colors-textMain)]">Followers</span>
                </div>
                <div>
                    <BigNumber className="font-semibold" num={0} />{" "}
                    <span className="text-[color:var(--chakra-colors-textMain)]">Following</span>
                </div>
                <div>
                    <BigNumber className="font-semibold" num={user._count.posts} />{" "}
                    <span className="text-[color:var(--chakra-colors-textMain)]">Posts</span>
                </div>
            </div>
        </div>
    );
}

function Posts({ user }: Props): ReactElement {
    const { user: currentUser } = useUserContext();

    const getKey = (pageIndex: number) => {
        return `posts/get-user-posts/${user.id}/${pageIndex}`;
    };

    const fetcher = <T,>(url: string) => {
        return currentUser ? axiosAuth.get<T>(url).then(res => res.data) : axiosNoAuth.get<T>(url).then(res => res.data);
    };

    const [reachedEnd, setReachedEnd] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const [posts, setPosts] = useState<IPost[]>([]);

    const {
        data,
        error,
        mutate,
        isValidating,
        size: page,
        setSize: setPage,
    } = useSWRInfinite(getKey, fetcher<GetPostsRes>, {
        revalidateOnFocus: false,
    });

    const loadMorePosts = async () => {
        if (reachedEnd) {
            return;
        }

        await setPage(page + 1);
    };

    const Footer = (): ReactElement | null => {
        if (!reachedEnd)
            return (
                <VStack width="full" my={3}>
                    <Spinner size="lg" />
                </VStack>
            );

        return null;
    };

    useEffect(() => {
        if (data) {
            setPosts(data.reduce((prev, curr) => prev.concat(curr.posts), [] as IPost[]));

            if (data[data.length - 1].posts.length < 30) {
                setReachedEnd(true);
            }
        }

        if (error) {
            toast.error(
                error?.response?.data?.message ??
                    "An error occurred while fetching posts",
            );
        }
    }, [data, error]);

    if (!isValidating && data?.[0].posts?.length === 0)
        return (
            <VStack width="full" textAlign="center" spacing={8}>
                <Box boxSize="250px">
                    <Image
                        fit="cover"
                        src="/graphics/Something_Went_Wrong.png"
                        alt="No posts found graphic"
                    />
                </Box>
                <Text fontSize="3xl" fontWeight="bold">
                    This user has not posted yet
                </Text>
            </VStack>
        );

    return (
        <Virtuoso
            className={styles.posts}
            data={posts}
            totalCount={posts.length}
            endReached={loadMorePosts}
            overscan={{ main: 500, reverse: 500 }}
            useWindowScroll
            isScrolling={setIsScrolling}
            components={{
                Footer,
            }}
            itemContent={(_, post) => (
                <Post
                    key={post.id}
                    id={post.id}
                    author={{
                        id: user.id,
                        displayName: user.displayName,
                        username: user.username,
                        avatarURL: user.avatarURL,
                    }}
                    isScrolling={isScrolling}
                    attachments={post.attachments}
                    createdAt={post.createdAt}
                    content={post.content}
                    likes={post.likes}
                    liked={post.liked}
                    comments={post.comments}
                    parentAuthorUsername={post.parentAuthorUsername}
                    mutate={mutate}
                />
            )}
        />
    );
}

export default function Profile({ user }: Props): ReactElement {
    return (
        <Flex gap="10">
            <NextSeo
                title={`${user.displayName} (@${user.username}) - Twatter`}
                description={`${user.displayName}'s profile'`}
                canonical={`https://twatter.social/@${user.username}`}
                openGraph={{
                    title: `${user.displayName} (@${user.username}) - Twatter`,
                    description: `${user.displayName}'s profile`,
                    url: `https://twatter.social/@${user.username}`,
                    type: "profile",
                    profile: {
                        username: user.username,
                    },
                    images: [
                        {
                            url: user.avatarURL,
                        },
                    ],
                }}
            />
            <VStack spacing={6} align="start" flex="7">
                <User user={user} />
                <Posts user={user} />
            </VStack>
        </Flex>
    );
}

export async function getServerSideProps(
    context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<Props>> {
    let user: (IUser & { _count: { posts: number } }) | null = null;

    try {
        const res = await axiosNoAuth.get<GetUserRes>(
            `users/get-user/${context.params?.username}`,
            context.req.cookies.session
                ? {
                    withCredentials: true,
                    headers: {
                        Cookie: `session=${context.req.cookies.session}`,
                    },
                }
                : {},
        );
        user = res.data.user ?? null;
    } catch (e) {
        if ((e as AxiosError).response?.status === 404) {
            return {
                notFound: true,
            };
        }
        console.error(e);
    }

    if (!user) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            user: user,
        },
    };
}
