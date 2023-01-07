import express from "express";
import { sessionGuard } from "../controllers/utils/middleware";
import { forgotPassword, getUser, login, logout, register, resetPassword, validateResetPasswordToken, validateToken } from "../controllers/users";
const router = express.Router();

router.get("/validate-reset-password-token", validateResetPasswordToken);
router.get("/validate-token", sessionGuard, validateToken);
router.get("/get-user/:username", sessionGuard, getUser);

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.delete("/logout", logout);

export default router;
