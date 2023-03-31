import express from "express";
import { limiter, sessionGuard } from "./utils/middleware";
import {
    forgotPassword,
    login,
    logout,
    register,
    resetPassword,
    validateResetPasswordToken,
    me,
    getSessions,
    revokeSession,
    revokeAllSessions,
} from "../controllers/auth";
import { RateLimiterMemory } from "rate-limiter-flexible";

const router = express.Router();

const getLimit = new RateLimiterMemory({
    points: 60,
    duration: 60,
});

const postLimit = new RateLimiterMemory({
    points: 3,
    duration: 60,
});

const laxPostLimit = new RateLimiterMemory({
    points: 10,
    duration: 60,
});

const registerLimit = new RateLimiterMemory({
    points: 5,
    duration: 60 * 60,
});

router.get("/verify-reset-password-token", limiter(postLimit), validateResetPasswordToken);
router.get("/me", limiter(getLimit), sessionGuard, me);
router.get("/sessions", limiter(getLimit), sessionGuard, getSessions);

router.post("/register", limiter(registerLimit), register);
router.post("/login", limiter(postLimit), login);
router.post("/forgot-password", limiter(postLimit), forgotPassword);
router.post("/reset-password", limiter(postLimit), resetPassword);
router.post("/sessions/revoke", limiter(laxPostLimit), sessionGuard, revokeSession);
router.post("/sessions/revoke/all", limiter(laxPostLimit), sessionGuard, revokeAllSessions);

router.delete("/logout", limiter(postLimit), sessionGuard, logout);

export default router;
