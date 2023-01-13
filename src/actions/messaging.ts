import { IConversation, IMessage } from "src/types/interfaces";

export enum MessagingActions {
    CHANGE_CONVERSATION = "CHANGE_CONVERSATION",
    FETCH_CONVERSATIONS = "FETCH_CONVERSATIONS",
    FETCH_MESSAGES = "FETCH_MESSAGES",
    RECEIVE_MESSAGE = "RECEIVE_MESSAGE",
    MARK_MESSAGES_AS_READ = "MARK_MESSAGES_AS_READ",
    DELETE_MESSAGE = "DELETE_MESSAGE",
}

interface ChangeConversationAction {
    type: MessagingActions.CHANGE_CONVERSATION;
    payload: {
        activeConversation: IConversation | null;
    };
}

interface FetchConversationsAction {
    type: MessagingActions.FETCH_CONVERSATIONS;
    payload: {
        conversations: IConversation[];
    };
}

interface FetchMessagesAction {
    type: MessagingActions.FETCH_MESSAGES;
    payload: {
        messages: IMessage[];
    };
}

interface ReceiveMessageAction {
    type: MessagingActions.RECEIVE_MESSAGE;
    payload: {
        message: IMessage;
    };
}

interface MarkMessagesAsReadAction {
    type: MessagingActions.MARK_MESSAGES_AS_READ;
}

interface DeleteMessageAction {
    type: MessagingActions.DELETE_MESSAGE;
    payload: {
        messageId: string;
    }
}

export type MessagingAction =
    | ChangeConversationAction
    | FetchConversationsAction
    | FetchMessagesAction
    | ReceiveMessageAction
    | MarkMessagesAsReadAction
    | DeleteMessageAction;
