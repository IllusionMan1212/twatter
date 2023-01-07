import { Prisma } from "@prisma/client";
import { prisma } from "./client";
import { DatabaseError } from "./utils";

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
