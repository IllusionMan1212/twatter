import { checkConversationMembers, createMessage, markMessagesAsRead, markMessagesAsSeen } from "../database/message";
import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { ClientToServerEvents, ServerToClientEvents } from "./types";
import fs from "fs/promises";
import { MESSAGE_MAX_CHARS } from "../../src/utils/constants";
import { linkUrls } from "../validators/posts";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import { htmlEscape } from "twitter-text";
import { MessageAttachment, processAttachment } from "./utils";

const limit = new RateLimiterMemory({
    points: 10,
    duration: 10,
});

const sendMessageLimit = new RateLimiterMemory({
    keyPrefix: "sendMessage",
    points: 15,
    duration: 10,
});

const deleteMessageLimit = new RateLimiterMemory({
    keyPrefix: "deleteMessage",
    points: 15,
    duration: 20,
});

export const handleMessage = (
    socket: Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>,
    connectedSockets: Map<string, Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>[]>
) => {
    socket.on("message", async (data) => {
        try {
            await sendMessageLimit.consume(socket.userId);
        } catch (e) {
            socket.emit("blocked", {
                reason: "Rate limit reached",
                additionalData: {
                    "retry-ms": (e as RateLimiterRes).msBeforeNext,
                    limit: sendMessageLimit.points,
                }
            });
            return;
        }

        if (socket.userId === data.recipientId) return;

        const convos = await checkConversationMembers([socket.userId, data.recipientId], data.conversationId);

        if (!convos.length || !convos?.[0]) {
            socket.emit("error", {
                message: "Forbidden",
            });
            return;
        }

        let attachment: MessageAttachment | null = null;

        if (data.attachment) {
            attachment = await processAttachment(data.attachment.data, data.conversationId, socket.request.headers.host);
        }

        let message = data.message.replaceAll("\r", "").replaceAll(/\n{2,}/g, "\n\n").trim();

        if (message.length > MESSAGE_MAX_CHARS) {
            connectedSockets.get(socket.userId)?.forEach((_socket) => {
                _socket.emit("error", {
                    message: `Message cannot exceed ${MESSAGE_MAX_CHARS} characters`,
                });
            });
            return;
        }

        message = (await linkUrls(htmlEscape(message))).val;

        const newMessage = await createMessage(message, attachment, data.conversationId, socket.userId, data.recipientId);

        if (!newMessage) {
            if (attachment) {
                await fs.rm(attachment.fullPath, { recursive: true, force: true });
                await fs.rm(attachment.thumbnailPath, { recursive: true, force: true });
            }
            socket.emit("error", {
                message: "An error occurred while sending message",
            });
            return;
        }

        connectedSockets.get(socket.userId)?.forEach((_socket) => {
            _socket.emit("message", {
                ...newMessage,
                createdAt: newMessage.createdAt.toISOString(),
            });
        });

        connectedSockets.get(data.recipientId)?.forEach((_socket) => {
            _socket.emit("message", {
                ...newMessage,
                createdAt: newMessage.createdAt.toISOString(),
            });
        });
    });
};

export const handleTyping = (
    socket: Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>,
    connectedSockets: Map<string, Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>[]>
) => {
    socket.on("typing", async (data) => {
        try {
            await limit.consume(`typing|${socket.userId}`);
        } catch (e) {
            socket.emit("blocked", {
                reason: "Rate limit reached",
                additionalData: {
                    "retry-ms": (e as RateLimiterRes).msBeforeNext,
                    limit: limit.points,
                }
            });
            return;
        }

        if (socket.userId === data.recipientId) return;

        const convos = await checkConversationMembers([socket.userId, data.recipientId], data.conversationId);

        if (!convos.length || !convos?.[0]) {
            socket.emit("error", {
                message: "Forbidden",
            });
            return;
        }

        connectedSockets.get(data.recipientId)?.forEach((_socket) => {
            _socket.emit("typing", {
                conversationId: data.conversationId,
            });
        });
    });
};

export const handleMarkMessagesAsRead = (
    socket: Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>,
    connectedSockets: Map<string, Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>[]>
) => {
    socket.on("markMessagesAsRead", async (data) => {
        try {
            await limit.consume(`markMessagesAsRead|${socket.userId}`);
        } catch (e) {
            socket.emit("blocked", {
                reason: "Rate limit reached",
                additionalData: {
                    "retry-ms": (e as RateLimiterRes).msBeforeNext,
                    limit: limit.points,
                }
            });
            return;
        }

        if (socket.userId === data.recipientId) return;

        const convos = await checkConversationMembers([socket.userId, data.recipientId], data.conversationId);

        if (!convos.length || !convos?.[0]) {
            socket.emit("error", {
                message: "Forbidden",
            });
            return;
        }

        const count = await markMessagesAsRead(data.conversationId, data.recipientId, data.userId);

        if (!count) {
            return;
        }

        connectedSockets.get(data.recipientId)?.forEach((_socket) => {
            _socket.emit("markedMessagesAsRead", {
                conversationId: data.conversationId,
            });
        });
    });
};

export const handleMarkMessagesAsSeen = (
    socket: Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>,
    connectedSockets: Map<string, Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>[]>
) => {
    socket.on("markMessagesAsSeen", async (data) => {
        try {
            await limit.consume(`markMessagesAsSeen|${socket.userId}`);
        } catch (e) {
            socket.emit("blocked", {
                reason: "Rate limit reached",
                additionalData: {
                    "retry-ms": (e as RateLimiterRes).msBeforeNext,
                    limit: limit.points,
                }
            });
            return;
        }

        if (socket.userId === data.recipientId) return;

        const convos = await checkConversationMembers([socket.userId, data.recipientId], data.conversationId);

        if (!convos.length || !convos?.[0]) {
            socket.emit("error", {
                message: "Forbidden",
            });
            return;
        }

        const count = await markMessagesAsSeen(data.conversationId, data.recipientId);

        if (!count) {
            return;
        }

        connectedSockets.get(socket.userId)?.forEach((_socket) => {
            _socket.emit("markedMessagesAsSeen", {
                conversationId: data.conversationId,
            });
        });
    });
};

export const handleDeleteMessage = (
    socket: Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>,
    connectedSockets: Map<string, Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>[]>
) => {
    socket.on("deleteMessage", async (data) => {
        try {
            await deleteMessageLimit.consume(socket.userId);
        } catch (e) {
            socket.emit("blocked", {
                reason: "Rate limit reached",
                additionalData: {
                    "retry-ms": (e as RateLimiterRes).msBeforeNext,
                    limit: deleteMessageLimit.points,
                }
            });
            return;
        }

        if (socket.userId === data.recipientId) return;

        const convos = await checkConversationMembers([socket.userId, data.recipientId], data.conversationId);

        if (!convos.length || !convos?.[0]) {
            socket.emit("error", {
                message: "Forbidden",
            });
            return;
        }

        connectedSockets.get(socket.userId)?.forEach((_socket) => {
            _socket.emit("deletedMessage", {
                messageId: data.messageId,
                conversationId: data.conversationId,
            });
        });

        connectedSockets.get(data.recipientId)?.forEach((_socket) => {
            _socket.emit("deletedMessage", {
                messageId: data.messageId,
                conversationId: data.conversationId,
            });
        });
    });
};
