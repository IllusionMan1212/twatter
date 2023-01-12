import {
    Flex,
    VStack,
    Text,
    Link as ChakraLink,
    ButtonGroup,
    Icon,
    useDisclosure,
    HStack,
    Box,
    IconButton,
    Spinner,
} from "@chakra-ui/react";
import { AxiosError } from "axios";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { MutableRefObject, ReactElement, useEffect, useRef, useState } from "react";
import { IPost } from "src/types/interfaces";
import { GenericBackendRes, GetCommentsRes, GetPostRes } from "src/types/server";
import { axiosAuth, axiosNoAuth } from "src/utils/axios";
import NextLink from "next/link";
import Avatar from "src/components/User/Avatar";
import Attachments from "src/components/Attachments/AttachmentsContainer";
import { useUserContext } from "src/contexts/userContext";
import { Chat, Heart } from "phosphor-react";
import toast from "react-hot-toast";
import { Dialog } from "src/components/Dialog";
import useSWRInfinite, { SWRInfiniteResponse } from "swr/infinite";
import { fetcher } from "src/utils/helpers";
import { Virtuoso } from "react-virtuoso";
import Post, { parsingOptions } from "src/components/Post/Post";
import styles from "src/styles/userProfile.module.scss";
import Router from "next/router";
import Options from "src/components/Post/PostOptions";
import { NextSeo } from "next-seo";
import CommentBox from "src/components/Post/CommentBox";
import parse from "html-react-parser";
import BigNumber from "src/components/BigNumber";

function ChatIcon() {
    return <Chat weight="bold" size="20" color="grey" />;
}

interface LikeIconProps {
    liked: boolean;
}

export function LikeIcon({ liked }: LikeIconProps) {
    return (
        <Heart
            weight={liked ? "fill" : "bold"}
            size="22"
            color={liked ? "var(--chakra-colors-red-600)" : "grey"}
        />
    );
}

interface DeleteDialogProps {
    postId: string;
    isOpen: boolean;
    onClose: () => void;
}

function DeleteDialog({ postId, isOpen, onClose }: DeleteDialogProps): ReactElement {
    const handleDelete = () => {
        axiosAuth
            .delete<GenericBackendRes>(`posts/delete-post?postId=${postId}`)
            .then((res) => {
                toast.success(res.data.message);
                Router.back();
            })
            .catch((e: AxiosError<GenericBackendRes>) => {
                toast.error(
                    e.response?.data.message ??
                        "An error occurred while deleting your post",
                );
            });
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            header="Delete Post"
            message="Are you sure you want to delete this post? This action cannot be undone."
            btnColor="red"
            confirmationBtnTitle="Delete"
            handleConfirmation={handleDelete}
        />
    );
}

interface DateProps {
    postDate: string;
}

function PostDate({ postDate }: DateProps): ReactElement {
    const date = new Date(postDate);

    const finalDate = `${date.toLocaleDateString()} · ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    })}`;

    return (
        <Text fontSize="sm" color="textMain">
            {finalDate}
        </Text>
    );
}

interface OriginalPostProps extends Props {
    commentBoxRef: MutableRefObject<HTMLTextAreaElement | null>;
}

function OriginalPost({ post, commentBoxRef }: OriginalPostProps): ReactElement {
    const { user } = useUserContext();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [likeDisabled, setLikeDisabled] = useState(false);
    const [likes, setLikes] = useState(post.likes);
    const [liked, setLiked] = useState(post.liked);

    const handleLike = async () => {
        if (likeDisabled) {
            return;
        }

        setLikeDisabled(true);

        axiosAuth
            .patch(`posts/${liked ? "unlike" : "like"}/${post.id}`)
            .then(() => {
                liked ? setLikes(likes - 1) : setLikes(likes + 1);
                setLiked(!liked);
                setLikeDisabled(false);
            })
            .catch(() => {
                setLikeDisabled(false);
            });
    };

    const handleComment = () => {
        commentBoxRef?.current?.focus();
    };

    return (
        <>
            <VStack
                width="full"
                rounded="4px 4px 0px 0px"
                borderBottom="1px solid var(--chakra-colors-bgSecondary)"
                bgColor="inherit"
            >
                <VStack width="full" align="start" px={4} pt={4} pb={2}>
                    <VStack spacing={2} width="full" align="start">
                        <HStack width="full" justify="space-between" spacing={3}>
                            <NextLink
                                href={`/@${post.authorUsername}`}
                                passHref
                            >
                                <ChakraLink>
                                    <HStack>
                                        <Avatar
                                            src={post.authorAvatarURL}
                                            alt={`${post.authorUsername}'s avatar`}
                                            width="50px"
                                            height="50px"
                                        />
                                        <VStack spacing={0} align="start">
                                            <Text fontSize="md" fontWeight="semibold">
                                                {post.authorName}
                                            </Text>
                                            <Text fontSize="sm" color="textMain">
                                                @{post.authorUsername}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </ChakraLink>
                            </NextLink>
                            <div>
                                <Options
                                    openDeleteDialog={onOpen}
                                    userId={user?.id}
                                    authorId={post.authorId}
                                    authorUsername={post.authorUsername}
                                    postId={post.id}
                                />
                            </div>
                        </HStack>
                        {post.parentAuthorUsername ? (
                            <Text
                                fontSize="sm"
                                color="textMain"
                                wordBreak="break-word"
                                whiteSpace="break-spaces"
                            >
                                Replying to{" "}
                                <NextLink
                                    href={`/@${post.parentAuthorUsername}`}
                                    passHref
                                >
                                    <ChakraLink
                                        fontWeight="semibold"
                                        color="var(--chakra-colors-accent-500)"
                                    >
                                        @{post.parentAuthorUsername}
                                    </ChakraLink>
                                </NextLink>
                            </Text>
                        ) : null}
                        <Text
                            wordBreak="break-word"
                            fontSize="xl"
                            whiteSpace="break-spaces"
                        >
                            {parse(post.content, parsingOptions)}
                        </Text>
                        {post.attachments ? (
                            <Box width="full">
                                <Attachments urls={post.attachments} />
                            </Box>
                        ) : null}
                        <HStack width="full" justifyContent="space-between">
                            <PostDate postDate={post.createdAt} />
                            <ButtonGroup variant="ghost" justifyContent="end" spacing={2}>
                                <HStack spacing={0}>
                                    <IconButton
                                        aria-label="Comment Button"
                                        colorScheme="button"
                                        rounded="full"
                                        icon={<Icon as={ChatIcon} w={6} h={6} />}
                                        onClick={handleComment}
                                    />
                                    {post.comments > 0 ? <BigNumber className="text-xs" num={post.comments} /> : null}
                                </HStack>
                                <HStack spacing={0}>
                                    <IconButton
                                        aria-label="Like Button"
                                        colorScheme="red"
                                        rounded="full"
                                        icon={
                                            <Icon
                                                as={LikeIcon}
                                                liked={liked}
                                                w={6}
                                                h={6}
                                            />
                                        }
                                        onClick={handleLike}
                                    />
                                    {likes > 0 ? <BigNumber className="text-xs" num={likes} /> : null}
                                </HStack>
                            </ButtonGroup>
                        </HStack>
                    </VStack>
                </VStack>
            </VStack>
            <DeleteDialog postId={post.id} isOpen={isOpen} onClose={onClose} />
        </>
    );
}

interface CommentsProps {
    swr: SWRInfiniteResponse<GetCommentsRes, AxiosError<GenericBackendRes>>;
}

function Comments({ swr }: CommentsProps): ReactElement {
    const { data, error, mutate, size: page, setSize: setPage } = swr;

    const [reachedEnd, setReachedEnd] = useState(false);
    const [comments, setComments] = useState<IPost[]>([]);

    const loadMoreComments = async () => {
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
            setComments(
                data.reduce((prev, curr) => prev.concat(curr.comments), [] as IPost[]),
            );

            if (data[data.length - 1].comments.length < 20) {
                setReachedEnd(true);
            }
        }

        if (error) {
            toast.error(
                error.response?.data.message ??
                    "An error occurred while fetching the comments",
            );
        }
    }, [data, error]);

    return (
        <VStack
            spacing={0}
            bgColor="inherit"
            flex="1"
            width="full"
            minHeight="1px" // HACK: used to get the scrollbar to play nice
        >
            <Virtuoso
                className={styles.posts}
                data={comments}
                totalCount={comments.length}
                endReached={loadMoreComments}
                useWindowScroll
                components={{
                    Footer,
                }}
                itemContent={(_, comment) => (
                    <Post
                        key={comment.id}
                        id={comment.id}
                        author={{
                            id: comment.authorId,
                            username: comment.authorUsername,
                            displayName: comment.authorName,
                            avatarURL: comment.authorAvatarURL,
                        }}
                        attachments={comment.attachments}
                        createdAt={comment.createdAt}
                        content={comment.content}
                        likes={comment.likes}
                        liked={comment.liked}
                        comments={comment.comments}
                        parentAuthorUsername={comment.parentAuthorUsername}
                        mutate={mutate}
                        asComment
                    />
                )}
            />
        </VStack>
    );
}

interface Props {
    post: IPost;
}

export default function PostPage({ post }: Props): ReactElement {
    const commentBoxRef = useRef<HTMLTextAreaElement | null>(null);

    const getKey = (pageIndex: number) => {
        return `posts/get-comments/${post.id}/${pageIndex}`;
    };

    const swr = useSWRInfinite<GetCommentsRes, AxiosError<GenericBackendRes>>(
        getKey,
        fetcher,
        {
            revalidateOnFocus: false,
        },
    );

    const cb = async () => {
        await swr.mutate();
    };

    return (
        <Flex gap="10">
            <NextSeo
                title={`${post.authorName}'s post - Twatter`}
                description={post.content}
                canonical={`https://twatter.social/@${post.authorUsername}/${post.id}`}
                openGraph={{
                    title: `${post.authorName}'s post - Twatter`,
                    description: post.content,
                    url: `https://twatter.social/@${post.authorUsername}/${post.id}`,
                    type: "article",
                    article: {
                        authors: [`@${post.authorUsername}`],
                        publishedTime: post.createdAt,
                    },
                    images: [
                        {
                            url: post.attachments?.[0] ?? "",
                        },
                        {
                            url: post.attachments?.[1] ?? "",
                        },
                        {
                            url: post.attachments?.[2] ?? "",
                        },
                        {
                            url: post.attachments?.[3] ?? "",
                        },
                    ],
                }}
            />
            <VStack
                minHeight={{
                    base: "calc(100vh - var(--chakra-headerHeight-mobile) - var(--chakra-navBarHeight))",
                    lg: "calc(100vh - var(--chakra-headerHeight-desktop) - var(--chakra-space-5))",
                }}
                spacing={0}
                align="start"
                flex="7"
                bgColor="bgPrimary"
            >
                <OriginalPost post={post} commentBoxRef={commentBoxRef} />
                <div className="w-full py-4 border-b-[1px] border-[color:var(--chakra-colors-bgSecondary)]">
                    <CommentBox cb={cb} parentPostId={post.id} ref={commentBoxRef} />
                </div>
                <Comments swr={swr} />
            </VStack>
        </Flex>
    );
}

export async function getServerSideProps(
    context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<Props>> {
    let post: IPost | null = null;

    try {
        const res = await axiosNoAuth.get<GetPostRes>(
            `posts/get-post/${context.params?.postId}`,
            {
                withCredentials: true,
                headers: {
                    Cookie: `session=${context.req.cookies.session}`,
                },
            },
        );
        post = res.data.post ?? null;
    } catch (e) {
        if ((e as AxiosError).response?.status === 404) {
            return {
                notFound: true,
            };
        }
        console.error(e);
    }

    if (!post) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            post,
        },
    };
}
