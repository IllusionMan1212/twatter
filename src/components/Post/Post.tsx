import { ButtonGroup, useDisclosure } from "@chakra-ui/react";
import { Chat, DotsThree, Heart } from "@phosphor-icons/react";
import { memo, ReactElement, useState } from "react";
import RelativeTime from "src/components/Post/RelativeTime";
import NextLink from "next/link";
import { Dialog } from "src/components/Dialog";
import { AxiosError } from "axios";
import {
    GenericBackendRes,
    GetCommentsRes,
    GetFeedRes,
    GetPostsRes,
    GetThreadRes,
} from "src/types/server";
import toast from "react-hot-toast";
import { IAttachment, IPostAuthor } from "src/types/interfaces";
import Avatar from "src/components/User/Avatar";
import { useUserContext } from "src/contexts/userContext";
import Attachments from "src/components/Attachments/AttachmentsContainer";
import { KeyedMutator } from "swr";
import Options from "src/components/Post/PostOptions";
import Router from "next/router";
import CommentModal from "src/components/Post/CommentModal";
import HTMLToJSX, { domToReact, Element } from "html-react-parser";
import Link from "next/link";
import BigNumber from "src/components/BigNumber";
import IconButton from "src/components/IconButton";
import { axiosInstance } from "src/utils/axios";

function ChatIcon() {
    return <Chat weight="bold" size="20" color="grey" />;
}

interface LikeIconProps {
    liked: boolean;
}

function LikeIcon({ liked }: LikeIconProps) {
    return (
        <Heart
            weight={liked ? "fill" : "bold"}
            size="22"
            color={liked ? "var(--chakra-colors-red-600)" : "grey"}
        />
    );
}

export interface PostProps {
    id: string;
    content: string;
    author: IPostAuthor;
    createdAt: string;
    attachments: IAttachment[] | null;
    likes: number;
    liked: boolean;
    comments: number;
    parentAuthorUsername: string | null;
    isScrolling: boolean;
    mutate:
        | KeyedMutator<GetFeedRes[]>
        | KeyedMutator<GetPostsRes[]>
        | KeyedMutator<GetCommentsRes[]>
        | KeyedMutator<GetThreadRes>;
    asComment: boolean;
}

interface DeleteDialogProps {
    postId: string;
    isOpen: boolean;
    onClose: () => void;
    mutate:
        | KeyedMutator<GetFeedRes[]>
        | KeyedMutator<GetPostsRes[]>
        | KeyedMutator<GetCommentsRes[]>
        | KeyedMutator<GetThreadRes>;
}

const DeleteDialog = memo(function DeleteDialog({
    postId,
    isOpen,
    onClose,
    mutate,
}: DeleteDialogProps): ReactElement {
    const handleDelete = () => {
        axiosInstance
            .delete<GenericBackendRes>(`posts/delete-post?postId=${postId}`)
            .then((res) => {
                toast.success(res.data.message);
                mutate();
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
});

export const parsingOptions = {
    replace: (domNode: unknown) => {
        if (domNode instanceof Element && domNode.name === "a") {
            const className = domNode.attribs.class;
            delete domNode.attribs.class;

            if (domNode.attribs.target === "_blank") {
                return (
                    <a className={className} {...domNode.attribs} onClick={(e) => e.stopPropagation()}>{domToReact(domNode.children)}</a>
                );
            }

            return (
                <Link href={domNode.attribs.href} passHref>
                    <a className={className} {...domNode.attribs} onClick={(e) => e.stopPropagation()}>{domToReact(domNode.children)}</a>
                </Link>
            );
        }
    },
};

export default function Post(props: PostProps): ReactElement {
    const { user } = useUserContext();
    const {
        isOpen: isDeleteDialogOpen,
        onOpen: onOpenDeleteDialog,
        onClose: onCloseDeleteDialog,
    } = useDisclosure();
    const {
        isOpen: isCommentModalOpen,
        onOpen: onOpenCommentModal,
        onClose: onCloseCommentModal,
    } = useDisclosure();

    const [likeDisabled, setLikeDisabled] = useState(false);
    const [hovering, setHovering] = useState(false);

    const handleLike = async () => {
        if (likeDisabled) {
            return;
        }

        setLikeDisabled(true);

        axiosInstance
            .patch(`posts/${props.liked ? "unlike" : "like"}/${props.id}`)
            .then(async () => {
                await props.mutate();
                setLikeDisabled(false);
            })
            .catch((e: AxiosError<GenericBackendRes>) => {
                if (e.response?.status == 404) {
                    toast.error("Cannot like deleted post");
                }
                setLikeDisabled(false);
            });
    };

    const handleComment = () => {
        user && onOpenCommentModal();
    };

    return (
        <>
            <div
                className={`w-full hover:cursor-pointer ${
                    props.asComment
                        ? "border-b-[1px] border-[color:var(--chakra-colors-bgSecondary)]"
                        : ""
                }`}
                onMouseOver={() => setHovering(true)}
                onMouseOut={() => setHovering(false)}
                onClick={async () => {
                    await Router.push(`/@${props.author.username}/${props.id}`);
                }}
            >
                <div className="w-full bg-[color:var(--chakra-colors-bgPrimary)] p-3 pb-2 rounded space-y-1">
                    <div className="flex w-full space-x-3">
                        <NextLink href={`/@${props.author.username}`} passHref>
                            <a
                                className="self-start"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Avatar
                                    src={props.author.avatarURL}
                                    alt={`${props.author.username}'s avatar`}
                                    width="50px"
                                    height="50px"
                                    pauseAnimation={!hovering}
                                />
                            </a>
                        </NextLink>
                        <div className="flex flex-col w-full items-start space-y-1 min-w-0">
                            <div className="flex items-center justify-between w-full">
                                <NextLink href={`/@${props.author.username}`} passHref>
                                    <a
                                        className="hover:underline min-w-0"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center w-full space-x-1">
                                            <p className="text-base font-semibold truncate">
                                                {props.author.displayName}
                                            </p>
                                            <p className="text-sm text-[color:var(--chakra-colors-textMain)] truncate min-w-[60px]">
                                                @{props.author.username}
                                            </p>
                                        </div>
                                    </a>
                                </NextLink>
                                {!props.isScrolling ? (
                                    <div>
                                        <Options
                                            openDeleteDialog={onOpenDeleteDialog}
                                            userId={user?.id}
                                            authorId={props.author.id}
                                            authorUsername={props.author.username}
                                            postId={props.id}
                                        />
                                    </div>
                                ) : (
                                    <DotsThree color="var(--chakra-colors-textMain)" className="min-w-[30px]" size={30} />
                                )}
                            </div>
                            {props.parentAuthorUsername ? (
                                <p className="text-sm text-[color:var(--chakra-colors-textMain)] whitespace-pre-line break-words">
                                    Replying to{" "}
                                    <NextLink
                                        href={`/@${props.parentAuthorUsername}`}
                                        passHref
                                    >
                                        <a
                                            className="font-semibold hover:underline text-[color:var(--chakra-colors-accent-500)]"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            @{props.parentAuthorUsername}
                                        </a>
                                    </NextLink>
                                </p>
                            ) : null}
                            <p className="[overflow-wrap:anywhere] whitespace-pre-line">
                                {HTMLToJSX(props.content, parsingOptions)}
                            </p>
                            {props.attachments ? (
                                <div className="w-full">
                                    <Attachments attachments={props.attachments} />
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex w-full justify-between items-end">
                        <p className="text-xs py-2 text-[color:var(--chakra-colors-textMain)]">
                            <RelativeTime date={props.createdAt} />
                        </p>
                        <ButtonGroup
                            variant="ghost"
                            justifyContent="end"
                            spacing={2}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center">
                                <IconButton
                                    className="rounded-full"
                                    ariaLabel="Comment Button"
                                    hoverColor="hover:bg-gray-400/10"
                                    activeColor="active:bg-gray-400/20"
                                    icon={<ChatIcon />}
                                    onClick={handleComment}
                                />
                                {props.comments > 0 ? <BigNumber className="text-xs" num={props.comments} /> : null}
                            </div>
                            <div className="flex items-center">
                                <IconButton
                                    className="rounded-full"
                                    ariaLabel="Like Button"
                                    hoverColor="hover:bg-red-300/10"
                                    activeColor="active:bg-red-300/20"
                                    icon={
                                        <LikeIcon
                                            liked={props.liked}
                                        />
                                    }
                                    onClick={handleLike}
                                />
                                {props.likes > 0 ? <BigNumber className="text-xs" num={props.likes} /> : null}
                            </div>
                        </ButtonGroup>
                    </div>
                </div>
            </div>
            {!props.isScrolling ? (
                <>
                    <DeleteDialog
                        postId={props.id}
                        isOpen={isDeleteDialogOpen}
                        onClose={onCloseDeleteDialog}
                        mutate={props.mutate}
                    />
                    <CommentModal
                        isOpen={isCommentModalOpen}
                        onClose={onCloseCommentModal}
                        post={props}
                    />
                </>
            ) : null}
        </>
    );
}

Post.defaultProps = {
    asComment: false,
};
