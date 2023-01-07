interface Attachment {
    data: Buffer;
    mimetype: string;
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
    userId: string;
    conversationId: string;
    wasRead: boolean;
    attachmentURL: string | null;
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

export interface ClientToServerEvents {
    message: (data: ClientMessageEventData) => void;
    typing: (data: ClientTypingEventData) => void;
    markMessagesAsRead: (data: MarkMessagesAsReadData) => void;
}

export interface ServerToClientEvents {
    _message: (msg: string) => void;
    message: (data: ServerMessageEventData) => void;
    error: (data: ErrorEventData) => void;
    typing: (data: ServerTypingEventData) => void;
    markedMessagesAsRead: (data: MarkedMessagesAsReadData) => void;
}

