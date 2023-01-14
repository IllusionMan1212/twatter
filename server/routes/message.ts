import express from "express";
import { limiter, messagingGuard, sessionGuard } from "./utils/middleware";
import { deleteMessage, getConversations, getMessages, getRecommendedPeople, leaveConversation, startConversation } from "../controllers/message";
import { RateLimiterMemory } from "rate-limiter-flexible";

const router = express.Router();

const getLimit = new RateLimiterMemory({
    points: 20,
    duration: 60,
});

const postLimit = new RateLimiterMemory({
    points: 5,
    duration: 30,
});

const deleteLimit = new RateLimiterMemory({
    points: 10,
    duration: 20,
});

router.get("/get-conversations/:page", limiter(getLimit), sessionGuard, getConversations);
router.get("/get-messages/:conversationId/:page", limiter(getLimit), sessionGuard, messagingGuard, getMessages);
router.get("/get-recommended-people", limiter(getLimit), sessionGuard, getRecommendedPeople);

router.post("/start-conversation", limiter(postLimit), sessionGuard, startConversation);

router.delete("/delete-message/:id", limiter(deleteLimit), sessionGuard, deleteMessage);
router.delete("/leave-conversation/:conversationId", limiter(deleteLimit), sessionGuard, messagingGuard, leaveConversation);

export default router;
