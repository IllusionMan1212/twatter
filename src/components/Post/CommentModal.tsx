import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    Divider,
} from "@chakra-ui/react";
import { memo, ReactElement, useRef } from "react";
import { PostProps } from "src/components/Post/Post";
import Avatar from "src/components/User/Avatar";
import Attachments from "src/components/Attachments/AttachmentsContainer";
import NextLink from "next/link";
import CommentBox from "src/components/Post/CommentBox";
import toast from "react-hot-toast";
import HTMLToJSX from "html-react-parser";
import { parsingOptions } from "src/components/Post/Post";
import FullDate from "src/components/FullDate";

interface CommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: PostProps;
}

const CommentModal = memo(function CommentModal({
    isOpen,
    onClose,
    post,
}: CommentModalProps): ReactElement {
    const initialFocusRef = useRef<HTMLTextAreaElement | null>(null);

    const cb = async () => {
        onClose();
        toast.success("Successfully commented");
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            initialFocusRef={initialFocusRef}
            size="xl"
        >
            <ModalOverlay />
            <ModalContent bgColor="bgPrimary">
                <ModalBody py={6} px={0}>
                    <div className="flex flex-col px-5 space-y-2">
                        <div className="grid grid-cols-1 w-full gap-y-3">
                            <div className="min-w-0 col-start-1 col-end-2">
                                <NextLink href={`/@${post.author.username}`} passHref>
                                    <a className="hover:underline">
                                        <div className="flex space-x-3 items-center">
                                            <Avatar
                                                src={post.author.avatarURL}
                                                alt={`${post.author.username}'s avatar`}
                                                width="50px"
                                                height="50px"
                                            />
                                            <div className="flex flex-col items-start min-w-0">
                                                <p className="text-base font-semibold truncate max-w-full">
                                                    {post.author.displayName}
                                                </p>
                                                <p className="text-sm text-[color:var(--chakra-colors-textMain)] truncate max-w-full">
                                                    @{post.author.username}
                                                </p>
                                            </div>
                                        </div>
                                    </a>
                                </NextLink>
                            </div>
                            {post.parentAuthorUsername ? (
                                <div className="col-start-1 col-end-3">
                                    <p className="text-sm break-words whitespace-pre-line text-[color:var(--chakra-colors-textMain)]">
                                        Replying to{" "}
                                        <NextLink
                                            href={`/@${post.parentAuthorUsername}`}
                                            passHref
                                        >
                                            <a className="text-[color:var(--chakra-colors-accent-500)] font-semibold hover:underline">
                                                @{post.parentAuthorUsername}
                                            </a>
                                        </NextLink>
                                    </p>
                                </div>
                            ) : null}
                            <div className="col-start-1 col-end-4">
                                <p className="text-xl [overflow-wrap:anywhere] whitespace-pre-line">
                                    {HTMLToJSX(post.content, parsingOptions)}
                                </p>
                            </div>
                            {post.attachments ? (
                                <div className="col-start-1 col-end-4">
                                    <Attachments attachments={post.attachments} />
                                </div>
                            ) : null}
                            <div className="col-start-1 col-end-4">
                                <FullDate ISODate={post.createdAt} />
                            </div>
                        </div>
                    </div>
                    <Divider my={4} height="1px" bgColor="bgSecondary" />
                    <CommentBox cb={cb} parentPostId={post.id} ref={initialFocusRef} />
                </ModalBody>
            </ModalContent>
        </Modal>
    );
});

export default CommentModal;
