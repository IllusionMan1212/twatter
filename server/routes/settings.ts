import express from "express";
import { limiter, sessionGuard } from "./utils/middleware";
import {
    toggleAllowAllDMs,
    changePassword,
    verifyTOTPCode,
    generateTOTPSecret,
    disable2FA,
    enable2FA,
    updateProfile,
    removeProfileImage,
    toggleReadReceipts,
    getBackupCodes,
    generateBackupCodes,
    downloadBackupCodes,
    verifyRecoveryCode,
} from "../controllers/settings";
import { RateLimiterMemory } from "rate-limiter-flexible";

const router = express.Router();

const totpLimit = new RateLimiterMemory({
    points: 1,
    duration: 5,
});

const toggleLimit = new RateLimiterMemory({
    points: 1,
    duration: 1,
});

const changePassLimit = new RateLimiterMemory({
    points: 5,
    duration: 10,
});

const updateProfileLimit = new RateLimiterMemory({
    points: 10,
    duration: 10,
});

const getBackupCodesLimit = new RateLimiterMemory({
    points: 10,
    duration: 10,
});

router.get("/generate-totp-secret", limiter(totpLimit), sessionGuard, generateTOTPSecret);
router.get("/backup-codes", limiter(getBackupCodesLimit), sessionGuard, getBackupCodes);
router.get("/backup-codes/download", limiter(getBackupCodesLimit), sessionGuard, downloadBackupCodes);

router.post("/toggle-allow-all-dms", limiter(toggleLimit), sessionGuard, toggleAllowAllDMs);
router.post("/toggle-read-receipts", limiter(toggleLimit), sessionGuard, toggleReadReceipts);
router.post("/change-password", limiter(changePassLimit), sessionGuard, changePassword);
router.post("/verify-totp-code", limiter(totpLimit), verifyTOTPCode);
router.post("/generate-backup-codes", limiter(totpLimit), sessionGuard, generateBackupCodes);
router.post("/verify-recovery-code", limiter(totpLimit), verifyRecoveryCode);

router.patch("/enable-2fa", limiter(totpLimit), sessionGuard, enable2FA);
router.patch("/disable-2fa", limiter(totpLimit), sessionGuard, disable2FA);
router.patch("/update-profile", limiter(updateProfileLimit), sessionGuard, updateProfile);

router.delete("/remove-profile-image", limiter(updateProfileLimit), sessionGuard, removeProfileImage);

export default router;
