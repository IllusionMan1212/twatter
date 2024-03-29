import { MenuItem, MenuList, useDisclosure, useMediaQuery } from "@chakra-ui/react";
import { memo, ReactElement, useEffect, useRef, useState } from "react";
import Avatar from "src/components/User/Avatar";
import { useUserContext } from "src/contexts/userContext";
import { Check, Checks, DotsThreeVertical } from "@phosphor-icons/react";
import MediaModal from "src/components/Attachments/MediaModal";
import HTMLToJSX from "html-react-parser";
import { parsingOptions } from "src/components/Post/Post";
import OptionsMenu from "../Options";
import { TrashIcon } from "@heroicons/react/solid";
import { GenericBackendRes } from "src/types/server";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { MessageAttachment } from "@prisma/client";
import { axiosInstance } from "src/utils/axios";

interface AttachmentProps {
    attachment: MessageAttachment | null;
    convoWidth: number;
}

function Attachment({ attachment, convoWidth }: AttachmentProps): ReactElement | null {
    const bgRef = useRef<HTMLDivElement | null>(null);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isLargerThanMd] = useMediaQuery(["(min-width: 52em)"]);
    const [imageWidth, setImageWidth] = useState(convoWidth * (isLargerThanMd ? 0.65 : 0.8) - 32 - 35 - 24 - 35); // lots of padding and gaps

    const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
        e.stopPropagation();
        onOpen();
    };

    useEffect(() => {
        setImageWidth(convoWidth * (isLargerThanMd ? 0.65 : 0.8) - 32 - 35 - 24 - 35); // lots of padding and gaps
    }, [convoWidth, isLargerThanMd]);

    useEffect(() => {
        if (!attachment) return;
        const bgImg = new Image();
        bgImg.src = attachment.url;
        bgImg.onload = () => {
            if (bgRef.current) {
                bgRef.current.remove();
            }
        };
    }, [attachment]);


    if (!attachment) return null;

    const width = attachment.width < imageWidth ? attachment.width : imageWidth;
    const ratio = attachment.width / attachment.height;

    return (
        <>
            <div className="max-h-[400px] max-w-full relative overflow-hidden">
                <div
                    ref={bgRef}
                    className="h-full w-full absolute top-0"
                    style={{
                        backgroundColor: attachment.bgColor,
                        width: width,
                        height: width / ratio
                    }}
                />
                <img
                    src={attachment.thumbUrl}
                    className="hover:cursor-pointer w-full"
                    style={{
                        maxWidth: "100%",
                        width: width,
                        height: width / ratio
                    }}
                    alt="Attachment"
                    onClick={handleClick}
                />
            </div>
            <MediaModal isOpen={isOpen} onClose={onClose} mediaIndex={0} media={[attachment.url]} />
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
    isGrouped?: boolean;
}

const MessageTime = memo(function MessageTime({ date, isGrouped }: MessageTimeProps): ReactElement {
    const now = new Date();
    const messageDate = new Date(date);
    const difference = now.getTime() - messageDate.getTime();

    if (isGrouped) return (
        <p className="text-[10px] text-[color:var(--chakra-colors-textSecondary)]">
            {messageDate
                .toLocaleString("default", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hourCycle: "h23"
                })
                .toUpperCase()}{" "}
        </p>
    );

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

interface DeletedMessageProps extends Omit<MessageProps,
"wasRead"
| "content"
| "attachment"
| "recipientAvatarURL"
| "recipientId"
| "conversationId"
| "isScrolling"
| "convoWidth"> {
    ownerAvatarURL: string | undefined | null;
}

export function DeletedMessage(props: DeletedMessageProps): ReactElement {
    const [hovering, setHovering] = useState(false);

    if (props.userOwned) return (
        <div
            className={`group flex w-full justify-end ${props.isGrouped ? "py-1" : "pt-4 pb-1"}`}
            onMouseOver={() => setHovering(true)}
            onMouseOut={() => setHovering(false)}
        >
            <div className="flex items-start gap-2 max-w-[80%] md:max-w-[65%]">
                <div className="flex flex-col gap-0.5 items-end">
                    {!props.isGrouped && (<MessageTime date={props.createdAt} />)}
                    <div className="flex gap-2 items-end">
                        <div className="flex flex-col gap-4 items-start px-4 py-2 border-2 border-gray-500 rounded-lg rounded-tr-[0]">
                            <p className="text-sm italic text-gray-500 leading-normal">
                                Deleted Message
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-0.5 items-start">
                    {!props.isGrouped ? (
                        <Avatar
                            src={props.ownerAvatarURL}
                            alt={`${props.ownerUsername}'s avatar`}
                            width="35px"
                            height="35px"
                            pauseAnimation={!hovering}
                        />
                    ) : (
                        <div className="w-[35px] min-w-[35px] opacity-0 group-hover:opacity-100">
                            <MessageTime date={props.createdAt} isGrouped />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div
            className={`group flex items-start gap-2 ${props.isGrouped ? "py-1" : "pt-4 pb-1"} max-w-[80%] md:max-w-[65%]`}
            onMouseOver={() => setHovering(true)}
            onMouseOut={() => setHovering(false)}
        >
            {!props.isGrouped ? (
                <Avatar
                    src={props.ownerAvatarURL}
                    alt={`${props.ownerUsername}'s avatar`}
                    width="35px"
                    height="35px"
                    pauseAnimation={!hovering}
                />
            ) : (
                <div className="w-[35px] min-w-[35px] opacity-0 group-hover:opacity-100">
                    <MessageTime date={props.createdAt} isGrouped />
                </div>
            )}
            <div className="flex flex-col gap-0.5 items-start">
                {!props.isGrouped && (<MessageTime date={props.createdAt} />)}
                <div className="flex flex-col gap-4 items-start px-4 py-2 border-2 border-gray-500 rounded-lg rounded-tl-[0]">
                    <p className="text-sm italic text-gray-500 leading-normal">
                        Message Deleted
                    </p>
                </div>
            </div>
        </div>
    );
}

interface MessageOptionsProps {
    messageId: string;
    conversationId: string;
    recipientId: string;
}

function MessageOptions({ messageId, conversationId, recipientId }: MessageOptionsProps): ReactElement {
    const { socket } = useUserContext();

    const handleDelete = () => {
        axiosInstance.delete(`message/delete-message/${conversationId}/${messageId}`)
            .then(async () => {
                socket?.emit("deleteMessage", {
                    messageId,
                    conversationId,
                    recipientId,
                });
            }).catch((e: AxiosError<GenericBackendRes>) => {
                toast.error(e.response?.data.message ?? "Failed to deleted message");
            });
    };

    return (
        <div className="text-sm">
            <OptionsMenu buttonSize="6" direction="vertical" placement="left-end">
                <MenuList minWidth="w-full">
                    <MenuItem width="26" color="red.500" onClick={handleDelete}>
                        <TrashIcon className="mr-3" height="20px" width="20px" />
                        <span>Delete</span>
                    </MenuItem>
                </MenuList>
            </OptionsMenu>
        </div>
    );
}

interface MessageProps {
    id: string;
    userOwned: boolean;
    content: string;
    attachment: MessageAttachment | null;
    recipientId: string;
    recipientAvatarURL: string | undefined | null;
    ownerUsername: string;
    isScrolling: boolean;
    wasRead: boolean;
    createdAt: string;
    conversationId: string;
    convoWidth: number;
    isGrouped: boolean;
}

export default function Message(props: MessageProps): ReactElement {
    const [hovering, setHovering] = useState(false);

    const { user } = useUserContext();

    return (
        <>
            {props.userOwned ? (
                <div
                    className={`group flex w-full ${props.isGrouped ? "py-1" : "pt-4 pb-1"} justify-end`}
                    onMouseOver={() => setHovering(true)}
                    onMouseOut={() => setHovering(false)}
                >
                    <div className={`flex gap-2 ${!props.isGrouped ? "items-start" : "items-end"} max-w-[80%] md:max-w-[65%]`}>
                        <div className="flex flex-col gap-0.5 items-end max-w-full overflow-hidden">
                            {!props.isGrouped && (<MessageTime date={props.createdAt} />)}
                            <div className="flex gap-2 items-end max-w-full">
                                {!props.isScrolling ? (
                                    <div className="flex gap-2 items-end opacity-0 group-hover:opacity-100">
                                        <MessageOptions
                                            messageId={props.id}
                                            conversationId={props.conversationId}
                                            recipientId={props.recipientId}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex gap-2 items-end opacity-0 group-hover:opacity-100">
                                        <div className="w-[24px] h-[24px]">
                                            <DotsThreeVertical color="var(--chakra-colors-textMain)" size={24} />
                                        </div>
                                    </div>
                                )}
                                <div className="flex flex-col gap-4 items-start max-w-[calc(100%_-_32px)] px-4 py-2 bg-[color:var(--chakra-colors-bgSecondary)] rounded-lg rounded-tr-[0]">
                                    <Attachment attachment={props.attachment} convoWidth={props.convoWidth} />
                                    <p className="text-sm whitespace-pre-line [overflow-wrap:anywhere] leading-normal">
                                        {HTMLToJSX(props.content, parsingOptions)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-0.5 items-start w-[35px] min-w-[35px]">
                            {!props.isGrouped ? (
                                <Avatar
                                    src={user?.avatarURL}
                                    alt={`${props.ownerUsername}'s avatar`}
                                    width="35px"
                                    height="35px"
                                    pauseAnimation={!hovering}
                                />
                            ) : (
                                <div className="w-[35px] min-w-[35px] opacity-0 group-hover:opacity-100">
                                    <MessageTime date={props.createdAt} isGrouped />
                                </div>
                            )}
                            {props.wasRead ? <ChecksIcon /> : <CheckIcon />}
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    className={`flex group items-start gap-2 ${props.isGrouped ? "py-1" : "pt-4 pb-1"} max-w-[80%] md:max-w-[65%]`}
                    onMouseOver={() => setHovering(true)}
                    onMouseOut={() => setHovering(false)}
                >
                    {!props.isGrouped ? (
                        <Avatar
                            src={props.recipientAvatarURL}
                            alt={`${props.ownerUsername}'s avatar`}
                            width="35px"
                            height="35px"
                            pauseAnimation={!hovering}
                        />
                    ) : (
                        <div className="w-[35px] min-w-[35px] opacity-0 group-hover:opacity-100">
                            <MessageTime date={props.createdAt} isGrouped />
                        </div>
                    )}
                    <div className="flex flex-col gap-0.5 items-start">
                        {!props.isGrouped ? (
                            <MessageTime date={props.createdAt} />
                        ) : null}
                        <div className="flex flex-col gap-4 items-start px-4 py-2 bg-[color:var(--chakra-colors-bgSecondary)] rounded-lg rounded-tl-[0]">
                            <Attachment attachment={props.attachment} convoWidth={props.convoWidth + 39} />
                            <p className="text-sm whitespace-pre-line [overflow-wrap:anywhere] leading-normal">
                                {HTMLToJSX(props.content, parsingOptions)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
