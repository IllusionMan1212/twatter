import {
    Flex,
    HStack,
    Text,
    Image,
    Tag,
    VStack,
    Box,
    Spinner,
    ButtonGroup,
    useDisclosure,
} from "@chakra-ui/react";
import { ReactElement, useEffect, useState } from "react";
import Post from "src/components/Post/Post";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { IPost, ProfilePageUser } from "src/types/interfaces";
import {
    GetPostsRes,
    GetUserRes,
} from "src/types/server";
import Avatar from "src/components/User/Avatar";
import axios, { AxiosError } from "axios";
import { useUserContext } from "src/contexts/userContext";
import toast from "react-hot-toast";
import useSWRInfinite from "swr/infinite";
import Router from "next/router";
import { Virtuoso } from "react-virtuoso";
import styles from "src/styles/userProfile.module.scss";
import { NextSeo } from "next-seo";
import BigNumber from "src/components/BigNumber";
import FollowButton from "src/components/User/FollowButton";
import { FollowersModal, FollowingModal } from "src/components/User/FollowersModal";
import MessageButton from "src/components/User/MessageButton";
import { fetcher } from "src/utils/axios";

interface Props {
    user: ProfilePageUser;
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
    const isFollowing = !!user.followers.find((f) => f.followerId === currentUser?.id);

    const { isOpen: isFollowerOpen, onOpen: onOpenFollower, onClose: onCloseFollower } = useDisclosure();
    const { isOpen: isFollowingOpen, onOpen: onOpenFollowing, onClose: onCloseFollowing } = useDisclosure();

    const followCB = async () => {
        await Router.replace(Router.asPath);
    };

    useEffect(() => {
        return () => {
            onCloseFollowing();
            onCloseFollower();
        };
    }, [user.id]);

    return (
        <div className="flex flex-col gap-2 pt-6 md:pt-0 w-full items-center md:items-start">
            <Flex
                direction={{ base: "column", "600px": "row" }}
                gap={4}
                py={2}
                width="full"
                maxWidth="90vw"
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
                <ButtonGroup
                    colorScheme="accent"
                    size="sm"
                >
                    <FollowButton isFollowing={isFollowing} userId={user.id} iconSize="24" followCB={followCB} />
                    <MessageButton userId={user.id} allowAllDMs={user.settings?.allowAllDMs ?? false} iconSize="24" />
                </ButtonGroup>
            </Flex>
            <div className="flex gap-2">
                <div className="hover:underline cursor-pointer" onClick={onOpenFollower}>
                    <BigNumber className="font-semibold" num={user._count.followers} />{" "}
                    <span className="text-[color:var(--chakra-colors-textMain)]">Followers</span>
                </div>
                <div className="hover:underline cursor-pointer" onClick={onOpenFollowing}>
                    <BigNumber className="font-semibold" num={user._count.following} />{" "}
                    <span className="text-[color:var(--chakra-colors-textMain)]">Following</span>
                </div>
                <div>
                    <BigNumber className="font-semibold" num={user._count.posts} />{" "}
                    <span className="text-[color:var(--chakra-colors-textMain)]">Posts</span>
                </div>
            </div>
            {isFollowerOpen && (<FollowersModal isOpen={isFollowerOpen} onClose={onCloseFollower} userId={user.id} />)}
            {isFollowingOpen && (<FollowingModal isOpen={isFollowingOpen} onClose={onCloseFollowing} userId={user.id} />)}
        </div>
    );
}

function Posts({ user }: Props): ReactElement {
    const getKey = (pageIndex: number) => {
        return `posts/get-user-posts/${user.id}/${pageIndex}`;
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
                            url: user.avatarURL ?? "",
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
    let user: ProfilePageUser | null = null;

    try {
        const res = await axios.get<GetUserRes>(
            `users/get-user/${context.params?.username}`,
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
