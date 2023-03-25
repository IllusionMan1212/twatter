import { Button, Icon, IconButton } from "@chakra-ui/react";
import { ChatAltIcon } from "@heroicons/react/solid";
import { AxiosError } from "axios";
import Router from "next/router";
import { ReactElement } from "react";
import toast from "react-hot-toast";
import { useUserContext } from "src/contexts/userContext";
import { GenericBackendRes, StartConversationRes } from "src/types/server";
import { axiosAuth } from "src/utils/axios";

interface ChatIconProps {
    size: string;
}

function Chat({ size }: ChatIconProps): ReactElement {
    return <ChatAltIcon width={size} height={size} />;
}

interface MessageButtonProps {
    allowAllDMs: boolean;
    userId: string;
    iconOnly: boolean;
    iconSize: string;
    messageCB?: () => Promise<void>;
}

export default function MessageButton({ userId, iconOnly, iconSize, messageCB, ...props }: MessageButtonProps): ReactElement | null {
    const { user: currentUser } = useUserContext();

    const handleStartConversation = async () => {
        axiosAuth
            .post<StartConversationRes>("message/start-conversation", {
                userId
            })
            .then(async (res) => {
                await messageCB?.();
                await Router.push(`/messages/${res.data.conversationId}`);
            })
            .catch((e: AxiosError<GenericBackendRes>) => {
                toast.error(
                    e.response?.data.message ??
                        "An error occurred while starting the conversation",
                );
            });
    };

    if (!currentUser || !props.allowAllDMs || userId === currentUser?.id) return null;

    if (iconOnly) return (
        <IconButton
            aria-label="Message"
            icon={<Icon as={() => <Chat size={iconSize} />} />}
            onClick={handleStartConversation}
        />
    );

    return (
        <Button
            variant="outline"
            leftIcon={<Icon as={() => <Chat size={iconSize} />} />}
            onClick={handleStartConversation}
        >
            Message
        </Button>
    );
}

MessageButton.defaultProps = {
    iconOnly: false,
    iconSize: "20"
};
