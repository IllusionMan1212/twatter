import express from "express";
import { messagingGuard, sessionGuard } from "../controllers/utils/middleware";
import { deleteMessage, getConversations, getMessages, getRecommendedPeople, leaveConversation, startConversation } from "../controllers/message";
const router = express.Router();

router.get("/get-conversations/:page", sessionGuard, getConversations);
router.get("/get-messages/:conversationId/:page", sessionGuard, messagingGuard, getMessages);
router.get("/get-recommended-people", sessionGuard, getRecommendedPeople);

router.post("/start-conversation", sessionGuard, startConversation);

router.delete("/delete-message/:id", sessionGuard, deleteMessage);
router.delete("/leave-conversation/:conversationId", sessionGuard, messagingGuard, leaveConversation);

export default router;
