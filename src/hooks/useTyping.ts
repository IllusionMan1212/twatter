import { useCallback, useEffect, useState } from "react";
import { ServerMessageEventData, ServerTypingEventData } from "server/sockets/types";
import { useUserContext } from "src/contexts/userContext";

export default function useTyping(activeConversationId: string): boolean {
    const { socket } = useUserContext();

    const [typing, setTyping] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>(undefined);

    const handleTyping = useCallback(
        (payload: ServerTypingEventData) => {
            clearTimeout(timeoutId);
            setTimeoutId(undefined);
            if (activeConversationId === payload.conversationId) {
                setTyping(true);
            }

            setTimeoutId(
                setTimeout(() => {
                    setTyping(false);
                }, 4000),
            );
        },
        [activeConversationId, timeoutId],
    );

    const handleMessage = useCallback(
        (message: ServerMessageEventData) => {
            if (message.conversationId === activeConversationId) {
                setTyping(false);
                clearTimeout(timeoutId);
                setTimeoutId(undefined);
            }
        },
        [activeConversationId, timeoutId],
    );

    useEffect(() => {
        if (socket) {
            socket.on("typing", handleTyping);
            socket.on("message", handleMessage);
        }

        return () => {
            if (socket) {
                socket.off("typing", handleTyping);
                socket.off("message", handleMessage);
            }
        };
    }, [socket, handleTyping, handleMessage]);

    return typing;
}
