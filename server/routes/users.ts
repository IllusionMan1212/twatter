import express from "express";
import { limiter, sessionGuard } from "./utils/middleware";
import {
    getUser,
    follow,
    unfollow,
    getFollowers,
    getFollowing,
} from "../controllers/users";
import { RateLimiterMemory } from "rate-limiter-flexible";

const router = express.Router();

const getLimit = new RateLimiterMemory({
    points: 60,
    duration: 60,
});

const followLimit = new RateLimiterMemory({
    points: 10,
    duration: 60,
});

router.get("/get-user/:username", limiter(getLimit), getUser);
router.get("/get-followers/:userId/:page", limiter(getLimit), getFollowers);
router.get("/get-following/:userId/:page", limiter(getLimit), getFollowing);

router.post("/follow/:userId", limiter(followLimit), sessionGuard, follow);
router.post("/unfollow/:userId", limiter(followLimit), sessionGuard, unfollow);

export default router;
