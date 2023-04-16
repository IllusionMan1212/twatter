import {
    Icon,
    Divider,
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
import NotePencil from "@phosphor-icons/react/dist/icons/NotePencil";
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
                <div className="flex flex-col items-center w-full my-3">
                    <Spinner />
                </div>
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
        <div className="flex flex-col w-full items-center text-center">
            <p className="font-bold">{error.message}</p>
        </div>
    );

    if (!isValidating && data?.[0]?.posts.length === 0)
        return (
            <div className="flex flex-col w-full items-center text-center">
                <div className="w-[250px] h-[250px]">
                    <img
                        className="object-cover"
                        src="/graphics/Something_Went_Wrong.avif"
                        alt="No posts found graphic"
                    />
                </div>
                <p className="text-3xl font-bold">
                    There are no posts
                </p>
            </div>
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
        <div className="flex">
            <NextSeo {...homeSEO} />
            <div className="flex flex-col items-start w-full md:gap-4">
                <div
                    className="flex-col gap-4 w-full items-center hidden md:flex"
                >
                    <ComposePost
                        cb={async () => {
                            await swr.mutate();
                        }}
                        placeholder="What's on your mind..."
                        apiRoute="posts/create-post"
                    />
                    <Divider height="1px" bgColor="bgSecondary" />
                </div>
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
            </div>
        </div>
    );
}
