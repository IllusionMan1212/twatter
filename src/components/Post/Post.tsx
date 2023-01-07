import { ButtonGroup, Icon, useDisclosure, IconButton } from "@chakra-ui/react";
import { Chat, Heart } from "phosphor-react";
import { memo, ReactElement, useState } from "react";
import RelativeTime from "src/components/Post/RelativeTime";
import NextLink from "next/link";
import { Dialog } from "src/components/Dialog";
import { axiosAuth } from "src/utils/axios";
import { AxiosError } from "axios";
import {
    GenericBackendRes,
    GetCommentsRes,
    GetFeedRes,
    GetPostsRes,
} from "src/types/server";
import toast from "react-hot-toast";
import { IPostAuthor } from "src/types/interfaces";
import Avatar from "src/components/User/Avatar";
import { useUserContext } from "src/contexts/userContext";
import Attachments from "src/components/Attachments/AttachmentsContainer";
import { KeyedMutator } from "swr";
import Options from "src/components/Post/PostOptions";
import Router from "next/router";
import CommentModal from "src/components/Post/CommentModal";

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
    attachments: string[] | null;
    likes: number;
    liked: boolean;
    comments: number;
    parentAuthorUsername: string | null;
    mutate:
        | KeyedMutator<GetFeedRes[]>
        | KeyedMutator<GetPostsRes[]>
        | KeyedMutator<GetCommentsRes[]>;
    asComment: boolean;
}

interface DeleteDialogProps {
    postId: string;
    isOpen: boolean;
    onClose: () => void;
    mutate:
        | KeyedMutator<GetFeedRes[]>
        | KeyedMutator<GetPostsRes[]>
        | KeyedMutator<GetCommentsRes[]>;
}

const DeleteDialog = memo(function DeleteDialog({
    postId,
    isOpen,
    onClose,
    mutate,
}: DeleteDialogProps): ReactElement {
    const handleDelete = () => {
        axiosAuth
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

    const handleLike = async () => {
        if (likeDisabled) {
            return;
        }

        setLikeDisabled(true);

        axiosAuth
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

    return (
        <>
            <div
                className={`w-full hover:cursor-pointer ${
                    props.asComment
                        ? "border-b-[1px] border-[color:var(--chakra-colors-bgSecondary)]"
                        : ""
                }`}
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
                                />
                            </a>
                        </NextLink>
                        <div className="flex flex-col w-full items-start space-y-1">
                            <div className="flex items-center justify-between w-full">
                                <NextLink href={`/@${props.author.username}`} passHref>
                                    <a
                                        className="hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center w-full space-x-1">
                                            <p className="text-base font-semibold">
                                                {props.author.displayName}
                                            </p>
                                            <p className="text-sm text-[color:var(--chakra-colors-textMain)]">
                                                @{props.author.username}
                                            </p>
                                        </div>
                                    </a>
                                </NextLink>
                                <div>
                                    <Options
                                        openDeleteDialog={onOpenDeleteDialog}
                                        userId={user?.id}
                                        authorId={props.author.id}
                                        authorUsername={props.author.username}
                                        postId={props.id}
                                    />
                                </div>
                            </div>
                            {props.parentAuthorUsername ? (
                                <p className="text-sm text-[color:var(--chakra-colors-textMain)] whitespace-pre-line break-words">
                                    Replying to{" "}
                                    <NextLink
                                        href={`/@${props.parentAuthorUsername}`}
                                        passHref
                                    >
                                        <a
                                            className="font-semibold text-[color:var(--chakra-colors-accent-500)]"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            @{props.parentAuthorUsername}
                                        </a>
                                    </NextLink>
                                </p>
                            ) : null}
                            <p className="break-words whitespace-pre-line">
                                {props.content}
                            </p>
                            {props.attachments ? (
                                <div className="w-full">
                                    <Attachments urls={props.attachments} />
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
                                    aria-label="Comment Button"
                                    colorScheme="button"
                                    rounded="full"
                                    icon={<Icon as={ChatIcon} w={6} h={6} />}
                                    onClick={onOpenCommentModal}
                                />
                                <p className="text-xs">
                                    {props.comments > 0 ? props.comments : null}
                                </p>
                            </div>
                            <div className="flex items-center">
                                <IconButton
                                    aria-label="Like Button"
                                    colorScheme="red"
                                    rounded="full"
                                    icon={
                                        <Icon
                                            as={LikeIcon}
                                            liked={props.liked}
                                            w={6}
                                            h={6}
                                        />
                                    }
                                    onClick={handleLike}
                                />
                                <p className="text-xs">
                                    {props.likes > 0 ? props.likes : null}
                                </p>
                            </div>
                        </ButtonGroup>
                    </div>
                </div>
            </div>
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
    );
}

Post.defaultProps = {
    asComment: false,
};
