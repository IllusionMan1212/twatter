import z from "zod";
import { GetPagedData } from "./general";

export const ConversationData = z.object({
    conversationId: z.string().min(1, "Invalid conversation id"),
});

export const GetMessagesData = GetPagedData.extend({
    conversationId: z.string().min(1, "Invalid conversation id"),
});

export const StartConversationData = z.object({
    userId: z.string().min(1, "Invalid user id")
});
