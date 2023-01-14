import express from "express";
import { limiter, sessionGuard } from "./utils/middleware";
import { createPost, deletePost, getPost, getPosts, getComments, getUserPosts, likePost, unlikePost } from "../controllers/posts";
import { RateLimiterMemory } from "rate-limiter-flexible";

const router = express.Router();

const getLimit = new RateLimiterMemory({
    points: 30,
    duration: 60,
});

const postLimit = new RateLimiterMemory({
    points: 10,
    duration: 60,
});

const patchLimit = new RateLimiterMemory({
    points: 1,
    duration: 1,
});

const deleteLimit = new RateLimiterMemory({
    points: 10,
    duration: 20,
});

router.get("/get-user-posts/:id/:page", limiter(getLimit), sessionGuard, getUserPosts);
router.get("/get-all-posts/:page", limiter(getLimit), sessionGuard, getPosts);
router.get("/get-post/:id", limiter(getLimit), sessionGuard, getPost);
router.get("/get-comments/:id/:page", limiter(getLimit), sessionGuard, getComments);

router.post("/create-post", limiter(postLimit), sessionGuard, createPost);

router.patch("/like/:postId", limiter(patchLimit), sessionGuard, likePost);
router.patch("/unlike/:postId", limiter(patchLimit), sessionGuard, unlikePost);

router.delete("/delete-post", limiter(deleteLimit), sessionGuard, deletePost);

export default router;
