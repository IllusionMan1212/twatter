import { IUser, IEvent, IConversation, IMessage, ISearchUser, IPost, IThreadPost, IReport, IReporter, ProfilePageUser, IFollowUser, IBackupCode } from "./interfaces";

export interface GenericBackendRes {
    message: string;
}

export interface LoginRes extends GenericBackendRes {
    user: IUser;
    requiresTwoFactorAuth: boolean;
}

export interface ValidateResetPasswordTokenRes extends GenericBackendRes {
    user: IUser;
}

export interface ValidateTokenRes {
    user: IUser;
}

export interface TwoFASecretRes extends GenericBackendRes {
    secret: string;
    qrcode: string;
}

export interface AdminAccountsRes {
    accounts: IUser[];
    accountCount: number;
}

export interface AdminEventsRes {
    events: IEvent[];
    eventCount: number;
}

export interface GetUserRes extends GenericBackendRes {
    user: ProfilePageUser | undefined;
}

export interface GetPostRes extends GenericBackendRes {
    post: IPost | undefined;
}

export interface GetPostsRes extends GenericBackendRes {
    posts: IPost[];
}

export interface GetConversationsRes extends GenericBackendRes {
    conversations: IConversation[];
}

export interface StartConversationRes extends GenericBackendRes {
    conversationId: string;
}

export interface GetMessagesRes extends GenericBackendRes {
    messages: IMessage[];
}

export interface SearchUsersRes extends GenericBackendRes {
    users: ISearchUser[];
}

export interface SearchEventsRes extends GenericBackendRes {
    events: IEvent[];
}

export interface SearchAllRes extends GenericBackendRes {
    users: ISearchUser[];
    events: IEvent[];
}

export interface GetEventsRes extends GenericBackendRes {
    events: IEvent[];
}

export interface GetFeedRes extends GenericBackendRes {
    posts: IPost[];
}

export interface GetCommentsRes extends GenericBackendRes {
    comments: IPost[];
}

export interface GetRecommendedMessagingPeopleRes extends GenericBackendRes {
    people: ISearchUser[];
}

export interface GetThreadRes extends GenericBackendRes {
    thread: IThreadPost[];
}

export interface GetReportsRes extends GenericBackendRes {
    reports: IReport[];
}

export interface GetReportersRes extends GenericBackendRes {
    reporters: IReporter[];
}

export interface GetUnreadMessagesRes extends GenericBackendRes {
    convos: {
        id: string;
        messages: number;
    }[]
}

export interface GetFollowersRes extends GenericBackendRes {
    followers: { Follower: IFollowUser }[];
}

export interface GetFollowingRes extends GenericBackendRes {
    following: { Following: IFollowUser }[];
}

export interface GetBackupCodes extends GenericBackendRes {
    codes: IBackupCode[];
}
