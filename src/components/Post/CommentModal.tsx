import {
    Grid,
    GridItem,
    Link as ChakraLink,
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
        <p className="text-sm text-[color:var(--chakra-colors-textMain)]">{finalDate}</p>
    );
}

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
                        <Grid
                            width="full"
                            rowGap={3}
                            columnGap={5}
                            templateColumns="max-content 1fr max-content"
                        >
                            <GridItem colStart={1} colEnd={2}>
                                <NextLink href={`/@${post.author.username}`} passHref>
                                    <ChakraLink>
                                        <div className="flex space-x-3 items-center">
                                            <Avatar
                                                src={post.author.avatarURL}
                                                alt={`${post.author.username}'s avatar`}
                                                width="50px"
                                                height="50px"
                                            />
                                            <div className="flex flex-col items-start">
                                                <p className="text-base font-semibold">
                                                    {post.author.displayName}
                                                </p>
                                                <p className="text-sm text-[color:var(--chakra-colors-textMain)]">
                                                    @{post.author.username}
                                                </p>
                                            </div>
                                        </div>
                                    </ChakraLink>
                                </NextLink>
                            </GridItem>
                            {post.parentAuthorUsername ? (
                                <GridItem colStart={1} colEnd={3}>
                                    <p className="text-sm break-words whitespace-pre-line text-[color:var(--chakra-colors-textMain)]">
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
                                    </p>
                                </GridItem>
                            ) : null}
                            <GridItem colStart={1} colEnd={4}>
                                <p className="text-xl [overflow-wrap:anywhere] whitespace-pre-line">
                                    {HTMLToJSX(post.content, parsingOptions)}
                                </p>
                            </GridItem>
                            {post.attachments ? (
                                <GridItem colStart={1} colEnd={4}>
                                    <Attachments attachments={post.attachments} />
                                </GridItem>
                            ) : null}
                            <GridItem colStart={1} colEnd={4}>
                                <PostDate postDate={post.createdAt} />
                            </GridItem>
                        </Grid>
                    </div>
                    <Divider my={4} height="1px" bgColor="bgSecondary" />
                    <CommentBox cb={cb} parentPostId={post.id} ref={initialFocusRef} />
                </ModalBody>
            </ModalContent>
        </Modal>
    );
});

export default CommentModal;
