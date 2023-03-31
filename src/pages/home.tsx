import {
    Text,
    Image,
    Flex,
    Icon,
    VStack,
    Divider,
    Box,
    Spinner,
    IconButton,
    useDisclosure,
} from "@chakra-ui/react";
import { ReactElement, useEffect, useState } from "react";
import Post from "src/components/Post/Post";
import useSWRInfinite, { SWRInfiniteResponse } from "swr/infinite";
import { Virtuoso } from "react-virtuoso";
import { AxiosError } from "axios";
import { GenericBackendRes, GetFeedRes } from "src/types/server";
import { IPost } from "src/types/interfaces";
import styles from "src/styles/userProfile.module.scss";
import ComposePost from "src/components/Post/ComposePost";
import { NotePencil } from "@phosphor-icons/react";
import ComposePostModal from "src/components/Post/ComposePostModal";
import { homeSEO } from "next-seo.config";
import { NextSeo } from "next-seo";
import { fetcher } from "src/utils/axios";

function NotePencilIcon() {
    return <NotePencil weight="bold" size="25" />;
}

interface PostsProps {
    swr: SWRInfiniteResponse<GetFeedRes, AxiosError<GenericBackendRes>>;
}

function Posts({ swr }: PostsProps): ReactElement {
    const [reachedEnd, setReachedEnd] = useState(false);
    const [posts, setPosts] = useState<IPost[]>([]);
    const [isScrolling, setIsScrolling] = useState(false);

    const { data, error, mutate, isValidating, size: page, setSize: setPage } = swr;

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
                    <Spinner />
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
    }, [data]);

    if (error) return (
        <VStack width="full" textAlign="center">
            <p className="font-bold">{error.message}</p>
        </VStack>
    );

    if (!isValidating && data?.[0]?.posts.length === 0)
        return (
            <VStack width="full" textAlign="center">
                <Box boxSize="250px">
                    <Image
                        fit="cover"
                        src="/graphics/Something_Went_Wrong.png"
                        alt="No posts found graphic"
                    />
                </Box>
                <Text fontSize="3xl" fontWeight="bold">
                    There are no posts
                </Text>
            </VStack>
        );

    return (
        <Virtuoso
            className={styles.posts}
            data={posts}
            totalCount={posts.length}
            endReached={loadMorePosts}
            useWindowScroll
            isScrolling={setIsScrolling}
            overscan={{ main: 800, reverse: 800 }}
            components={{
                Footer,
            }}
            itemContent={(_, post) => (
                <Post
                    key={post.id}
                    id={post.id}
                    author={{
                        id: post.authorId,
                        username: post.authorUsername,
                        displayName: post.authorName,
                        avatarURL: post.authorAvatarURL,
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

export default function Home(): ReactElement {
    const getKey = (pageIndex: number) => {
        return `posts/get-feed/${pageIndex}`;
    };

    const swr = useSWRInfinite<GetFeedRes, AxiosError<GenericBackendRes>>(
        getKey,
        fetcher,
        {
            revalidateOnFocus: false,
        },
    );

    const { isOpen, onOpen, onClose } = useDisclosure();

    const cb = async () => {
        await swr.mutate();
    };

    return (
        <Flex>
            <NextSeo {...homeSEO} />
            <VStack spacing={{ base: 0, md: 4 }} align="start" width="full">
                <VStack
                    spacing={4}
                    width="full"
                    display={{ base: "none", md: "initial" }}
                >
                    <ComposePost
                        cb={async () => {
                            await swr.mutate();
                        }}
                        placeholder="What's on your mind..."
                        apiRoute="posts/create-post"
                    />
                    <Divider height="1px" bgColor="bgSecondary" />
                </VStack>
                <IconButton
                    display={{ base: "flex", md: "none" }}
                    aria-label="Mobile Compose Button"
                    border="2px solid var(--chakra-colors-accent-500)"
                    position="fixed"
                    size="lg"
                    colorScheme="accent"
                    bottom="calc(var(--chakra-navBarHeight) + 40px)"
                    right="4"
                    zIndex={3}
                    icon={<Icon as={NotePencilIcon} />}
                    onClick={onOpen}
                />
                <ComposePostModal isOpen={isOpen} onClose={onClose} cb={cb} />
                <Posts swr={swr} />
            </VStack>
        </Flex>
    );
}
