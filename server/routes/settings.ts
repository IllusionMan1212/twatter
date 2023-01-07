import express from "express";
import { sessionGuard } from "../controllers/utils/middleware";
import { toggleAllowAllDMs, changePassword, verifyTOTPCode, generateTOTPSecret, disable2FA, enable2FA, updateProfile, removeProfileImage, toggleReadReceipts } from "../controllers/settings";
const router = express.Router();

router.get("/generate-totp-secret", sessionGuard, generateTOTPSecret);

router.post("/toggle-allow-all-dms", sessionGuard, toggleAllowAllDMs);
router.post("/toggle-read-receipts", sessionGuard, toggleReadReceipts);
router.post("/change-password", sessionGuard, changePassword);
router.post("/verify-totp-code", verifyTOTPCode);

router.patch("/enable-2fa", sessionGuard, enable2FA);
router.patch("/disable-2fa", sessionGuard, disable2FA);
router.patch("/update-profile", sessionGuard, updateProfile);

router.delete("/remove-profile-image", sessionGuard, removeProfileImage);

export default router;
