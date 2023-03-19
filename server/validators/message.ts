import z from "zod";
import { GetPagedData } from "./general";

export const ConversationData = z.object({
    conversationId: z.string({ required_error: "conversationId is required" }).min(1, "Invalid conversation id"),
});

export const GetMessagesData = GetPagedData.extend({
    conversationId: z.string({ required_error: "conversationId is required" }).min(1, "Invalid conversation id"),
});

export const StartConversationData = z.object({
    userId: z.string({ required_error: "userId is required" }).min(1, "Invalid user id")
});

export const DeleteMessageData = z.object({
    id: z.string({ required_error: "message id is required" }).min(1, "Id cannot be empty"),
    conversationId: z.string({ required_error: "conversationId is required" }).min(1, "Conversation ID cannot be empty"),
});
