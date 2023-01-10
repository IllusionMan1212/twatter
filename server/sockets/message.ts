import { checkConversationMembers, createMessage, markMessagesAsRead } from "../database/message";
import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { ClientToServerEvents, ServerToClientEvents } from "./types";
import fs from "fs/promises";
import crypto from "crypto";
import { MESSAGE_MAX_CHARS } from "../../src/utils/constants";

export const handleMessage = (
    socket: Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>,
    connectedSockets: Map<string, Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>[]>
) => {
    socket.on("message", async (data) => {
        let attachmentURL: string | null = null;
        let attachmentPath: string | null = null;

        if (data.attachment) {
            const bytes = crypto.randomBytes(12).toString("hex");
            const fileName = `${bytes}-${Date.now()}`;
            const dir = `${__dirname}/../cdn/messages/${data.conversationId}`;

            const ext = data.attachment.mimetype.split("/").at(-1);
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(`${dir}/${fileName}.${ext}`, data.attachment.data);

            attachmentURL = `http://${socket.handshake.headers.host}/cdn/messages/${data.conversationId}/${fileName}.${ext}`;
            attachmentPath = `${dir}/${fileName}.${ext}`;
        }

        const message = data.message.replaceAll(/\n{2,}|\r{2,}|(\r\n){2,}/g, "\n\n").trim();

        if (message.length > MESSAGE_MAX_CHARS) {
            connectedSockets.get(socket.userId)?.forEach((_socket) => {
                _socket.emit("error", {
                    message: `Message cannot exceed ${MESSAGE_MAX_CHARS} characters`,
                });
            });
            return;
        }

        const newMessage = await createMessage(message, attachmentURL, data.conversationId, socket.userId, data.recipientId);

        if (!newMessage) {
            if (attachmentPath) {
                await fs.rm(attachmentPath, { recursive: true, force: true });
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
        if (socket.userId === data.recipientId) return;

        const convos = await checkConversationMembers([socket.userId, data.recipientId], data.conversationId);

        if (!convos.length || !convos?.[0]) {
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
        if (socket.userId === data.recipientId) return;

        const convos = await checkConversationMembers([socket.userId, data.recipientId], data.conversationId);

        if (!convos.length || !convos?.[0]) {
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
