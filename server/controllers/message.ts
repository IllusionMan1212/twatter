import { Request, Response } from "express";
import { ConversationData, DeleteMessageData, GetMessagesData, StartConversationData } from "../validators/message";
import { createOrUpdateConversation, deleteMessageDB, getConversationsDB, getMessagesDB, isValidUser, leaveConversationDB, queryRecommendedPeople } from "../database/message";
import { DatabaseError } from "../database/utils";
import { GetPagedData } from "../validators/general";

export async function startConversation(req: Request, res: Response) {
    const data = StartConversationData.safeParse(req.body);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const user = await isValidUser(data.data.userId);

    if (!user) {
        return res.status(400).json({ message: "Invalid user id" });
    }

    if (!user?.settings?.allowAllDMs) {
        return res.status(403).json({ message: "Cannot start a conversation with this user" });
    }

    const convoId = await createOrUpdateConversation(req.session.user.id, data.data.userId);

    if (!convoId) {
        return res.status(403).json({ message: "Cannot start a conversation with this user" });
    }

    return res.status(200).json({ message: "Successfully started conversation", conversationId: convoId });
}

export async function leaveConversation(req: Request, res: Response) {
    const data = ConversationData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const error = await leaveConversationDB(data.data.conversationId, req.session.user.id);

    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An internal error occurred while leaving the conversation" });
    }

    return res.status(200).json({ message: "Successfully left conversation" });
}

export async function getConversations(req: Request, res: Response) {
    const data = GetPagedData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const conversations = await getConversationsDB(req.session.user.id, data.data.page);

    return res.status(200).json({ message: "Successfully fetched conversations", conversations });
}

export async function getMessages(req: Request, res: Response) {
    const data = GetMessagesData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const messages = await getMessagesDB(data.data.conversationId, data.data.page);
    return res.status(200).json({ message: "Successfully fetched messages", messages: messages.reverse() });
}

export async function getRecommendedPeople(req: Request, res: Response) {
    const people = await queryRecommendedPeople(req.session.user.id);

    return res.status(200).json({ message: "Successfully fetched recommended people", people });
}

export async function deleteMessage(req: Request, res: Response) {
    const data = DeleteMessageData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const error = await deleteMessageDB(req.session.user.id, data.data.id, data.data.conversationId);

    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "Internal error occurred while deleting message" });
    } else if (error === DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND) {
        return res.status(404).json({ message: "Message not found" });
    }

    return res.status(200).json({ message: "Successfully deleted message" });
}
