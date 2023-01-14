import express from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { getEventImage, getMessageImage, getPostImages, getProfileImage } from "../controllers/cdn";
import { limiter } from "./utils/middleware";

const router = express.Router();

const getLimit = new RateLimiterMemory({
    points: 5,
    duration: 1,
});

router.get("/profile-images/:userId/:fileName", limiter(getLimit), getProfileImage);
router.get("/events/:eventId/:fileName", limiter(getLimit), getEventImage);
router.get("/posts/:postId/:fileName", limiter(getLimit), getPostImages);
router.get("/messages/:conversationId/:fileName", limiter(getLimit), getMessageImage);

export default router;
