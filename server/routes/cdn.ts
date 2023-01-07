import express from "express";
import { getEventImage, getMessageImage, getPostImages, getProfileImage } from "../controllers/cdn";
const router = express.Router();

router.get("/profile-images/:userId/:fileName", getProfileImage);
router.get("/events/:eventId/:fileName", getEventImage);
router.get("/posts/:postId/:fileName", getPostImages);
router.get("/messages/:conversationId/:fileName", getMessageImage);

export default router;
