import { Prisma, BackupCode } from "@prisma/client";
import { prisma } from "./client";
import { DatabaseError } from "./utils";
import crypto from "crypto";

export const updateAllowAllDMsSetting = async (userId: string, allowAllDMs: boolean): Promise<DatabaseError> => {
    try {
        await prisma.userSettings.update({
            where: {
                userId,
            },
            data: {
                allowAllDMs,
            }
        });
    } catch (e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const updateReadReceiptsSetting = async (userId: string, readReceipts: boolean): Promise<DatabaseError> => {
    try {
        await prisma.userSettings.update({
            where: {
                userId,
            },
            data: {
                readReceipts,
            }
        });
    } catch (e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const updatePassword = async (userId: string, password: string): Promise<DatabaseError> => {
    try {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                password,
            }
        });
    } catch (e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const setTOTPSecret = async (userId: string, secret: string): Promise<DatabaseError> => {
    try {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                totpSecret: secret,
            }
        });
    } catch (e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const toggle2FA = async (userId: string, twoFA: boolean): Promise<DatabaseError> => {
    try {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                twoFactorAuth: twoFA,
            }
        });
    } catch (e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const updateUserDisplayName = async (userId: string, displayName: string): Promise<DatabaseError> => {
    try {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                displayName,
            }
        });
    } catch (e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const updateUserUsername = async (userId: string, username: string): Promise<DatabaseError> => {
    try {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                username,
            }
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2002") {
                // Unique constraint failed
                return DatabaseError.DUPLICATE;
            }
        }

        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const updateUserProfileImage = async (userId: string, avatarURL: string): Promise<DatabaseError> => {
    try {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                avatarURL,
            }
        });
    } catch (e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const removeUserProfileImage = async (userId: string): Promise<DatabaseError> => {
    try {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                avatarURL: null,
            }
        });
    } catch (e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const queryBackupCodes = async (userId: string): Promise<BackupCode[]> => {
    return await prisma.backupCode.findMany({
        where: {
            userId
        }
    });
};

export const generateBackupCodesDB = async (userId: string): Promise<DatabaseError | Pick<BackupCode, "code" | "hasBeenUsed">[]> => {
    const pattern = "xxxxxx-xxxxxx";
    const patternLength = Math.ceil((pattern.split("x").length - 1) / 2);
    const codes: Pick<BackupCode, "code" | "hasBeenUsed">[] = [];

    try {
        const deleteCodes = prisma.backupCode.deleteMany({
            where: {
                userId
            }
        });
        const createCodes = new Array(10).fill(0).map(() => {
            let code = "";
            const bytes = crypto.randomBytes(patternLength).toString("hex");
            code = `${bytes.slice(0, bytes.length / 2)}-${bytes.slice(bytes.length / 2)}`;
            codes.push({ code: code, hasBeenUsed: false });
            return prisma.backupCode.create({
                data: {
                    userId,
                    code,
                }
            });
        });
        await prisma.$transaction([deleteCodes, ...createCodes]);
    } catch (e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return codes;
};

export const validateRecoveryCode = async (userId: string, code: string): Promise<number> => {
    const payload = await prisma.backupCode.updateMany({
        where: {
            AND: [
                { userId },
                { code },
                { hasBeenUsed: false }
            ]
        },
        data: {
            hasBeenUsed: true
        }
    });
    return payload.count;
};
