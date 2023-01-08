import {
    MenuItem,
    Link as ChakraLink,
    MenuList,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalHeader,
} from "@chakra-ui/react";
import { LinkIcon, ShareIcon, TrashIcon } from "@heroicons/react/solid";
import { FacebookLogo, RedditLogo, TwitterLogo } from "phosphor-react";
import { ComponentType, memo, ReactElement } from "react";
import toast from "react-hot-toast";
import OptionsMenu from "src/components/Options";

const facebookSharerPrefix = "https://facebook.com/sharer/sharer.php?u=";
const redditSharerPrefix = "https://reddit.com/submit?title=";
const twitterSharerPrefix = "https://twitter.com/share?text=";

function FacebookIcon() {
    return (
        <FacebookLogo weight="fill" size="40" color="var(--chakra-colors-facebook-400)" />
    );
}

function RedditIcon() {
    return <RedditLogo weight="fill" size="40" color="var(--chakra-colors-orange-400)" />;
}

function TwitterIcon() {
    return (
        <TwitterLogo weight="fill" size="40" color="var(--chakra-colors-twitter-400)" />
    );
}

interface ShareLinkProps {
    title: string;
    href: string;
    Icon: ComponentType<Record<string, never>>;
}

function ShareLink({ title, href, Icon }: ShareLinkProps): ReactElement {
    return (
        <ChakraLink href={href} isExternal>
            <div className="flex flex-col w-20 space-y-1 items-center">
                <Icon />
                <p className="text-sm">{title}</p>
            </div>
        </ChakraLink>
    );
}

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    url: string;
}

const ShareModal = memo(function ShareModal({
    isOpen,
    onClose,
    title,
    url,
}: ShareModalProps): ReactElement {
    return (
        <Modal isOpen={isOpen} size="xs" isCentered onClose={onClose}>
            <ModalOverlay />
            <ModalContent bgColor="bgMain">
                <ModalHeader>
                    <p>Share On</p>
                </ModalHeader>
                <ModalBody>
                    <div className="flex w-full justify-around">
                        <ShareLink
                            title="Facebook"
                            href={facebookSharerPrefix + url}
                            Icon={FacebookIcon}
                        />
                        <ShareLink
                            title="Reddit"
                            href={`${redditSharerPrefix}${title}&url=${url}`}
                            Icon={RedditIcon}
                        />
                        <ShareLink
                            title="Twitter"
                            href={`${twitterSharerPrefix}${title}&url=${url}`}
                            Icon={TwitterIcon}
                        />
                    </div>
                </ModalBody>
                <div className="py-2" />
            </ModalContent>
        </Modal>
    );
});

interface OptionsProps {
    openDeleteDialog: () => void;
    authorId: string;
    userId: string | undefined;
    authorUsername: string;
    postId: string;
}

const Options = memo(function Options({
    openDeleteDialog,
    authorId,
    userId,
    authorUsername,
    postId,
}: OptionsProps): ReactElement {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const url = `https://${process.env.NEXT_PUBLIC_DOMAIN}/@${authorUsername}/${postId}`;
    const title = `${authorUsername}'s post - Twatter`;

    const copyLink = () => {
        const tempInput = document.createElement("input");
        tempInput.value = url;
        tempInput.style.position = "fixed";
        tempInput.style.top = "0";
        document.body.appendChild(tempInput);
        tempInput.focus();
        tempInput.select();
        tempInput.setSelectionRange(0, 99999);
        try {
            document.execCommand("copy");
            toast.success("Copied Successfully");
        } catch (err) {
            toast.error("Error while copying link");
        } finally {
            document.body.removeChild(tempInput);
        }
    };

    const sharePost = () => {
        if (navigator.share) {
            navigator
                .share({
                    url: url,
                    title: title,
                })
                .then(() => {
                    console.log("shared successfully");
                })
                .catch(() => {
                    console.log("error while sharing");
                });
        } else {
            onOpen();
        }
    };

    return (
        <>
            <OptionsMenu buttonSize="30px">
                <MenuList onClick={(e) => e.stopPropagation()}>
                    <MenuItem onClick={sharePost}>
                        <ShareIcon className="mr-3" height="24px" width="24px" />
                        <span>Share Post</span>
                    </MenuItem>
                    <MenuItem onClick={copyLink}>
                        <LinkIcon className="mr-3" height="24px" width="24px" />
                        <span>Copy Link</span>
                    </MenuItem>
                    {authorId === userId ? (
                        <MenuItem color="red.500" onClick={openDeleteDialog}>
                            <TrashIcon className="mr-3" height="24px" width="24px" />
                            <span>Delete Post</span>
                        </MenuItem>
                    ) : null}
                </MenuList>
            </OptionsMenu>
            <ShareModal isOpen={isOpen} onClose={onClose} title={title} url={url} />
        </>
    );
});

export default Options;
