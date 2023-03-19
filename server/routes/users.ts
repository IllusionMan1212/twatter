import express from "express";
import { limiter, sessionGuard } from "./utils/middleware";
import {
    forgotPassword,
    getUser,
    login,
    logout,
    register,
    resetPassword,
    validateResetPasswordToken,
    validateToken,
    follow,
    unfollow,
} from "../controllers/users";
import { RateLimiterMemory } from "rate-limiter-flexible";

const router = express.Router();

const postLimit = new RateLimiterMemory({
    points: 3,
    duration: 60,
});

const registerLimit = new RateLimiterMemory({
    points: 5,
    duration: 60 * 60,
});

const getLimit = new RateLimiterMemory({
    points: 60,
    duration: 60,
});

const followLimit = new RateLimiterMemory({
    points: 10,
    duration: 60,
});


router.get("/validate-reset-password-token", limiter(postLimit), validateResetPasswordToken);
router.get("/validate-token", limiter(getLimit), sessionGuard, validateToken);
router.get("/get-user/:username", limiter(getLimit), getUser);

router.post("/register", limiter(registerLimit), register);
router.post("/login", limiter(postLimit), login);
router.post("/forgot-password", limiter(postLimit), forgotPassword);
router.post("/reset-password", limiter(postLimit), resetPassword);
router.post("/follow/:userId", limiter(followLimit), sessionGuard, follow);
router.post("/unfollow/:userId", limiter(followLimit), sessionGuard, unfollow);

router.delete("/logout", limiter(postLimit), logout);

export default router;
