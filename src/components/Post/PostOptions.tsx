import {
    MenuItem,
    MenuList,
    useDisclosure,
} from "@chakra-ui/react";
import { FlagIcon, LinkIcon, ShareIcon, TrashIcon } from "@heroicons/react/solid";
import { AxiosError } from "axios";
import { SpeakerSimpleNone, SpeakerSimpleSlash } from "@phosphor-icons/react";
import { memo, ReactElement, useState } from "react";
import toast from "react-hot-toast";
import OptionsMenu from "src/components/Options";
import { GenericBackendRes } from "src/types/server";
import { axiosAuth } from "src/utils/axios";
import { useUserContext } from "src/contexts/userContext";
import ShareModal from "src/components/ShareModal";
import ReportModal from "src/components/ReportModal";

function MuteIcon({ className, muted }: { className: string, muted: boolean }) {
    if (muted) return <SpeakerSimpleNone className={className} weight="fill" size="24" />;
    return <SpeakerSimpleSlash className={className} weight="fill" size="24" />;
}

interface OptionsProps {
    openDeleteDialog: () => void;
    authorId: string;
    userId: string | undefined;
    authorUsername: string;
    postId: string;
    muted?: boolean;
}

const Options = memo(function Options({
    openDeleteDialog,
    authorId,
    userId,
    authorUsername,
    postId,
    muted,
}: OptionsProps): ReactElement {
    const {
        isOpen: isShareModalOpen,
        onOpen: onOpenShareModal,
        onClose: onCloseShareModal
    } = useDisclosure();

    const {
        isOpen: isReportModalOpen,
        onOpen: onOpenReportModal,
        onClose: onCloseReportModal
    } = useDisclosure();

    const { user } = useUserContext();

    const [isMuted, setMuted] = useState(muted);

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
            onOpenShareModal();
        }
    };

    const mutePost = () => {
        axiosAuth.patch(`posts/${isMuted ? "unmute" : "mute"}/${postId}`)
            .then(() => {
                toast.success(`Notifications ${isMuted ? "unmuted" : "muted"} for this post`);
                setMuted(!isMuted);
            }).catch((e: AxiosError<GenericBackendRes>) => {
                toast.error(e.response?.data.message ?? "An error occurred");
            });
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
                    {user && (
                        <MenuItem onClick={onOpenReportModal}>
                            <FlagIcon className="mr-3" height="24px" width="24px" />
                            <span>Report Post</span>
                        </MenuItem>
                    )}
                    {authorId === userId ? (
                        <>
                            {isMuted !== undefined ? (
                                <MenuItem onClick={mutePost}>
                                    <MuteIcon className="mr-3" muted={isMuted} />
                                    <span>{isMuted ? "Unmute" : "Mute"} Post</span>
                                </MenuItem>
                            ) : null}
                            <MenuItem color="red.500" onClick={openDeleteDialog}>
                                <TrashIcon className="mr-3" height="24px" width="24px" />
                                <span>Delete Post</span>
                            </MenuItem>
                        </>
                    ) : null}
                </MenuList>
            </OptionsMenu>
            <ShareModal isOpen={isShareModalOpen} onClose={onCloseShareModal} title={title} url={url} />
            <ReportModal isOpen={isReportModalOpen} onClose={onCloseReportModal} postId={postId} />
        </>
    );
});

export default Options;
