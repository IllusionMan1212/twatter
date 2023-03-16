import { MessagingAction, MessagingActions } from "src/actions/messaging";
import { IConversation, IMessage } from "src/types/interfaces";

export interface MessagingState {
    activeConversation: IConversation | null;
    conversations: IConversation[];
    messages: IMessage[];
}

export function messagingReducer(
    state: MessagingState,
    action: MessagingAction,
): MessagingState {
    switch (action.type) {
    case MessagingActions.CHANGE_CONVERSATION:
        return {
            ...state,
            activeConversation: action.payload.activeConversation,
            messages: [],
        };
    case MessagingActions.FETCH_CONVERSATIONS:
        return {
            ...state,
            conversations: action.payload.conversations,
        };
    case MessagingActions.FETCH_MESSAGES:
        return {
            ...state,
            messages: action.payload.messages,
        };
    case MessagingActions.RECEIVE_MESSAGE:
        return {
            ...state,
            messages: state.messages.concat([action.payload.message]),
            conversations: state.conversations.map((convo) => {
                if (convo.id === action.payload.message.conversationId) {
                    convo.lastMessage = action.payload.message.content;
                    convo.updatedAt = new Date().toISOString();
                }

                return convo;
            }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
        };
    case MessagingActions.RECEIVE_MESSAGE_WHEN_CONVO_NOT_OPEN:
        return {
            ...state,
            conversations: state.conversations.map((convo) => {
                if (convo.id === action.payload.message.conversationId) {
                    convo.lastMessage = action.payload.message.content;
                    convo.updatedAt = new Date().toISOString();
                }

                return convo;
            }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
        };
    case MessagingActions.MARK_MESSAGES_AS_READ:
        return {
            ...state,
            messages: state.messages.map((message) => {
                message.wasRead = true;
                return message;
            }),
        };
    case MessagingActions.DELETE_MESSAGE: {
        const newMessages = state.messages.map((message, i) => {
            if (message.id === action.payload.messageId) {
                message.deleted = true;
                if (i === (state.messages.length - 1)) {
                    state.conversations.map((convo) => {
                        if (convo.id === message.conversationId) {
                            convo.lastMessage = "";
                        }
                        return convo;
                    });
                }
            }

            return message;
        });

        return {
            ...state,
            messages: newMessages,
            conversations: state.conversations
        };
    }
    default:
        return state;
    }
}
