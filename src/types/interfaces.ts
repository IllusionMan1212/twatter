import { ComponentType } from "react";

interface IUserSettings {
    allowAllDMs: boolean;
    readReceipts: boolean;
}

export interface IUser {
    id: string;
    displayName: string;
    username: string;
    email?: string;
    avatarURL: string;
    settings?: IUserSettings;
    twoFactorAuth: boolean;
    isAdmin: boolean;
    restricted?: boolean;
}

export interface ISearchUser {
    id: string;
    displayName: string;
    username: string;
    avatarURL: string | null;
    allowAllDMs: boolean;
}

export interface IEvent {
    id: string;
    title: string;
    description?: string;
    time: string;
    location: string;
    imageURL?: string;
    interest: number;
    isInterested?: boolean;
    createdAt: string;
}

export interface IConversation {
    id: string;
    recipientId: string;
    recipientUsername: string;
    recipientName: string;
    recipientAvatarURL: string;
    lastMessage: string;
    updatedAt: string;
}

export interface IMessage {
    id: string;
    content: string;
    createdAt: string;
    userId: string;
    conversationId: string;
    wasRead: boolean;
    attachmentURL: string | null;
}

export interface IPost {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    authorUsername: string;
    authorAvatarURL: string;
    attachments: string[] | null;
    likes: number;
    liked: boolean;
    comments: number;
    parentAuthorUsername: string | null;
    createdAt: string;
}

export interface IPostAuthor {
    id: string;
    displayName: string;
    username: string;
    avatarURL: string;
}

export type SettingItem = {
    id: string;
    title: string;
    settings: ComponentType<Record<string, never>>;
};

export type DashboardItem = {
    id: string;
    title: string;
    component: ComponentType<Record<string, never>>;
};

export interface SearchResultsTabProps {
    query: string;
}
