import { useDisclosure } from "@chakra-ui/react";
import { memo, ReactElement, useEffect, useRef } from "react";
import Avatar from "src/components/User/Avatar";
import { useUserContext } from "src/contexts/userContext";
import { Check, Checks } from "phosphor-react";
import MediaModal from "src/components/Attachments/MediaModal";
import parse from "html-react-parser";
import { parsingOptions } from "src/components/Post/Post";

interface AttachmentProps {
    url: string | null;
}

function Attachment({ url }: AttachmentProps): ReactElement | null {
    const imageRef = useRef<HTMLImageElement | null>(null);

    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
        e.stopPropagation();
        onOpen();
    };

    useEffect(() => {
        if (!url) return;
        const bgImg = new Image();
        bgImg.src = url;
        bgImg.onload = () => {
            if (imageRef.current) {
                imageRef.current.style.backgroundColor = "#0000";
                imageRef.current.style.backgroundImage = `url(${url})`;
            }
        };
    }, [url]);

    if (!url) return null;

    return (
        <>
            <div className="max-h-[400px]">
                <img
                    src={url}
                    className="hover:cursor-pointer max-h-[400px] w-full"
                    alt="Attachment"
                    onClick={handleClick}
                />
            </div>
            <MediaModal isOpen={isOpen} onClose={onClose} mediaIndex={0} media={[url]} />
        </>
    );
}

const CheckIcon = () => {
    return <Check weight="bold" color="var(--chakra-colors-textMain)" />;
};

const ChecksIcon = () => {
    return <Checks weight="bold" color="var(--chakra-colors-blue-500)" />;
};

interface MessageTimeProps {
    date: string;
}

const MessageTime = memo(function MessageTime({ date }: MessageTimeProps): ReactElement {
    const now = new Date();
    const messageDate = new Date(date);
    const difference = now.getTime() - messageDate.getTime();

    if (now.getFullYear() > messageDate.getFullYear()) {
        // different years
        return (
            <p className="text-[10px] text-[color:var(--chakra-colors-textSecondary)]">
                {messageDate
                    .toLocaleString("default", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    })
                    .toUpperCase()}{" "}
                | {messageDate.getDate()}{" "}
                {messageDate.toLocaleString("default", { month: "short" })}{" "}
                {messageDate.getFullYear()}
            </p>
        );
    } else if (difference >= 1000 * 60 * 60 * 24 * 7) {
        // older than 7 days. display hour, day and month
        return (
            <p className="text-[10px] text-[color:var(--chakra-colors-textSecondary)]">
                {messageDate
                    .toLocaleString("default", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    })
                    .toUpperCase()}{" "}
                | {messageDate.getDate()}{" "}
                {messageDate.toLocaleString("default", { month: "short" })}
            </p>
        );
    } else if (now.getDate() !== messageDate.getDate()) {
        // different days. display hour, weekday
        return (
            <p className="text-[10px] text-[color:var(--chakra-colors-textSecondary)]">
                {messageDate
                    .toLocaleString("default", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    })
                    .toUpperCase()}{" "}
                {messageDate.toLocaleString("default", { weekday: "short" })}
            </p>
        );
    } else {
        return (
            <p className="text-[10px] text-[color:var(--chakra-colors-textSecondary)]">
                {messageDate
                    .toLocaleString("default", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    })
                    .toUpperCase()}{" "}
                Today
            </p>
        );
    }
});

interface MessageProps {
    userOwned: boolean;
    content: string;
    attachmentURL: string | null;
    recipientAvatarURL: string | undefined;
    ownerUsername: string;
    wasRead: boolean;
    createdAt: string;
}

export default function Message(props: MessageProps): ReactElement {
    const { user } = useUserContext();

    return (
        <>
            {props.userOwned ? (
                <div className="flex w-full justify-end py-4">
                    <div className="flex items-start gap-2 max-w-[80%] md:max-w-[65%]">
                        <div className="flex flex-col gap-0.5 items-end">
                            <MessageTime date={props.createdAt} />
                            <div className="flex flex-col gap-4 items-start px-4 py-2 bg-[color:var(--chakra-colors-bgSecondary)] rounded-lg rounded-tr-[0]">
                                <Attachment url={props.attachmentURL} />
                                <p className="text-sm whitespace-pre-line [overflow-wrap:anywhere] leading-normal">
                                    {parse(props.content, parsingOptions)}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-0.5 items-start">
                            <Avatar
                                src={user?.avatarURL}
                                alt={`${props.ownerUsername}'s avatar`}
                                width="35px"
                                height="35px"
                            />
                            {props.wasRead ? <ChecksIcon /> : <CheckIcon />}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-start gap-2 py-4 max-w-[80%] md:max-w-[65%]">
                    <Avatar
                        src={props.recipientAvatarURL}
                        alt={`${props.ownerUsername}'s avatar`}
                        width="35px"
                        height="35px"
                    />
                    <div className="flex flex-col gap-0.5 items-start">
                        <MessageTime date={props.createdAt} />
                        <div className="flex flex-col gap-4 items-start px-4 py-2 bg-[color:var(--chakra-colors-bgSecondary)] rounded-lg rounded-tl-[0]">
                            <Attachment url={props.attachmentURL} />
                            <p className="text-sm whitespace-pre-line [overflow-wrap:anywhere] leading-normal">
                                {parse(props.content, parsingOptions)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
