import { MessageAttachment, ReportResolveReason } from "@prisma/client";
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
    notificationSubHash: string;
}

export interface ISearchUser {
    id: string;
    displayName: string;
    username: string;
    avatarURL: string | undefined;
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
    members: { User: IUser }[];
    messages: { content: string }[];
    lastMessage: string;
    updatedAt: string;
}

export interface IMessage {
    id: string;
    content: string;
    createdAt: string;
    memberId: string;
    conversationId: string;
    wasRead: boolean;
    Attachment: MessageAttachment | null;
    deleted: boolean;
}

export interface IAttachment {
    url: string;
    thumbUrl: string;
    bgColor: string;
}

export interface IPost {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    authorUsername: string;
    authorAvatarURL: string;
    attachments: IAttachment[] | null;
    likes: number;
    liked: boolean;
    comments: number;
    parentAuthorUsername: string | null;
    muted?: boolean;
    createdAt: string;
}

export interface IThreadPost extends Omit<IPost, "content"> {
    content?: string;
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

export interface IReportPost extends Pick<IPost, "id" | "content" | "attachments" | "createdAt"> {
    author: Pick<IUser, "id" | "username" | "displayName" | "avatarURL">;
}

export interface IReport {
    originalReportId: string;
    reason: string;
    reports: number;
    originalReportComments?: string;
    firstReportedAt: string;
    lastReportedAt: string;
    resolvedAt: string;
    resolved: boolean;
    resolveReason: ReportResolveReason;
    originalReportSubmitterUsername: string;
    Post: IReportPost;
}

export interface IReporter {
    Submitter: Pick<IUser, "username" | "avatarURL">;
    comments?: string;
    createdAt: string;
}
