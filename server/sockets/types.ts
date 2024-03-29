import { MessageAttachment } from "@prisma/client";

interface Attachment {
    data: Buffer;
    mimetype: string;
}

export interface BlockedEventData {
    reason: string;
    additionalData?: Record<string, any>;
}

export interface ClientMessageEventData {
    message: string;
    attachment: Attachment | null;
    conversationId: string;
    recipientId: string;
}

export interface ServerMessageEventData {
    id: string;
    content: string;
    createdAt: string;
    memberId: string;
    conversationId: string;
    wasRead: boolean;
    Attachment: MessageAttachment | null;
    deleted: boolean;
}

export interface ErrorEventData {
    message: string;
}

export interface ClientTypingEventData {
    conversationId: string;
    recipientId: string;
}

export interface ServerTypingEventData {
    conversationId: string;
}

export interface MarkMessagesAsReadData {
    conversationId: string;
    userId: string;
    recipientId: string;
}

export interface MarkedMessagesAsReadData {
    conversationId: string;
}

export interface MarkMessagesAsSeenData {
    conversationId: string;
    recipientId: string;
}

export interface MarkedMessagesAsSeenData {
    conversationId: string;
}

export interface DeleteMessageData {
    conversationId: string;
    recipientId: string;
    messageId: string;
}

export interface DeletedMessageData {
    conversationId: string;
    messageId: string;
}

export interface ClientToServerEvents {
    message: (data: ClientMessageEventData) => void;
    typing: (data: ClientTypingEventData) => void;
    markMessagesAsRead: (data: MarkMessagesAsReadData) => void;
    markMessagesAsSeen: (data: MarkMessagesAsSeenData) => void;
    deleteMessage: (data: DeleteMessageData) => void;
}

export interface ServerToClientEvents {
    blocked: (data: BlockedEventData) => void;
    message: (data: ServerMessageEventData) => void;
    error: (data: ErrorEventData) => void;
    typing: (data: ServerTypingEventData) => void;
    markedMessagesAsRead: (data: MarkedMessagesAsReadData) => void;
    markedMessagesAsSeen: (data: MarkedMessagesAsSeenData) => void;
    deletedMessage: (data: DeletedMessageData) => void;
}

