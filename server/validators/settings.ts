import z from "zod";

export const ToggleAllowAllDMsData = z.object({
    allowAllDMs: z.boolean({ required_error: "allowAllDMs is required" }),
});

export const ToggleReadReceiptsData = z.object({
    readReceipts: z.boolean({ required_error: "readReceipts is required" }),
});

export const ChangePasswordData = z.object({
    currentPassword: z.string({ required_error: "currentPassword is required" }).min(1, "Current password cannot be empty"),
    newPassword: z.string({ required_error: "newPassword is required" }).min(8, "Password is too short, at least 8 characters are required"),
    newPasswordConfirm: z.string({ required_error: "newPasswordConfirm is required" }).min(8, "Password confirmation is too short, at least 8 characters are required"),
});

export const Enable2FAData = z.object({
    passcode: z.string({ required_error: "passcode is required" }).length(6, "Passcode must be 6 digits"),
});

export const VerifyTOTPCodeData = z.object({
    passcode: z.string({ required_error: "passcode is required" }).length(6, "Passcode must be 6 digits"),
});

export const VerifyRecoveryCodeData = z.object({
    passcode: z.string({ required_error: "recovery code is required" }).length(13, "Recovery code must be 13 characters"),
});

export const UpdateProfileData = z.object({
    displayName: z.string(),
    username: z.string()
}).partial();
