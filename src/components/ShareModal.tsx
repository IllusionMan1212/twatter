import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
} from "@chakra-ui/react";
import FacebookLogo from "@phosphor-icons/react/dist/icons/FacebookLogo";
import RedditLogo from "@phosphor-icons/react/dist/icons/RedditLogo";
import TwitterLogo from "@phosphor-icons/react/dist/icons/TwitterLogo";
import { ComponentType, memo, ReactElement } from "react";
import ModalHeader from "src/components/Modal/ModalHeader";

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
        <a href={href} target="_blank" rel="noreferrer">
            <div className="flex flex-col w-20 space-y-1 items-center">
                <Icon />
                <p className="text-sm">{title}</p>
            </div>
        </a>
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

export default ShareModal;
