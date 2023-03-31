import { Prisma, User, UserSettings, Session } from "@prisma/client";
import { prisma } from "./client";
import { DatabaseError } from "./utils";

type Tokens = Pick<Session, "accessToken" | "refreshToken">;

export const createUser = async (username: string, email: string, password: string): Promise<[DatabaseError, string | null, string | null]> => {
    let userId: string | null = null;
    try {
        userId = (await prisma.user.create({
            data: {
                displayName: username,
                username: username,
                email: email,
                password: password,
                settings: {
                    create: {},
                },
            },
        })).id;
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2002") {
                // Unique constraint failed
                return [DatabaseError.DUPLICATE, (err.meta?.["target"] as string[])[0] as string, null];
            }
        }

        console.error(
            "Unknown error:",
            typeof err === "string" ? err : JSON.stringify(err),
        );
        return [DatabaseError.UNKNOWN, null, null];
    }

    return [DatabaseError.SUCCESS, null, userId];
};

export const setUserResetToken = async (userId: string, tokenHashed: string, expiration: Date): Promise<DatabaseError> => {
    try {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                resetPasswordToken: tokenHashed,
                resetPasswordTokenExpiry: expiration,
            }
        });
    } catch (e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const getUserByEmailOrUsername = async (usernameOrEmail: string): Promise<User & { settings: UserSettings | null, notificationSubHash: string } | null> => {
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                {
                    email: { equals: usernameOrEmail, mode: "insensitive" },
                },
                {
                    username: { equals: usernameOrEmail, mode: "insensitive" },
                }
            ],
        },
        include: {
            settings: true,
        },
    });

    return user ? { ...user, notificationSubHash: "" } : null;
};

export const getUserByResetToken = async (tokenHashed: string): Promise<User | null> => {
    return await prisma.user.findUnique({
        where: {
            resetPasswordToken: tokenHashed,
            AND: [
                {
                    resetPasswordTokenExpiry: {
                        gt: new Date(),
                    }
                }
            ],
        },
    });
};

export const updateUserPassword = async (hash: string, tokenHashed: string): Promise<DatabaseError> => {
    try {
        await prisma.user.update({
            where: {
                resetPasswordToken: tokenHashed,
                AND: [
                    {
                        resetPasswordTokenExpiry: {
                            gt: new Date(),
                        }
                    }
                ],
            },
            data: {
                resetPasswordToken: null,
                resetPasswordTokenExpiry: null,
                password: hash,
                twoFactorAuth: false,
                sessions: {
                    deleteMany: {}
                }
            }
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2025") {
                return DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND;
            }
        }
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const querySessions = async (userId: string): Promise<Partial<Session>[]> => {
    return await prisma.session.findMany({
        where: {
            userId
        },
        select: {
            ip: true,
            deviceId: true,
            userAgent: true,
            lastLoginTime: true,
        },
        orderBy: {
            lastLoginTime: "desc"
        }
    });
};

export const deleteSession = async (deviceId: string, userId: string): Promise<DatabaseError> => {
    try {
        await prisma.session.delete({
            where: {
                userId_deviceId: {
                    userId,
                    deviceId
                }
            }
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025") {
                return DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND;
            }
        }
        console.error(err);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const deleteSessions = async (activeDeviceId: string, userId: string): Promise<DatabaseError> => {
    try {
        await prisma.session.deleteMany({
            where: {
                AND: [
                    { userId },
                    { deviceId: {
                        not: activeDeviceId
                    } }
                ]
            }
        });
    } catch (err) {
        console.error(err);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const createOrUpdateSession = async (deviceId: string, userId: string, userAgent: string, ip: string, tokens: Tokens): Promise<DatabaseError | Session> => {
    try {
        const sess = await prisma.session.upsert({
            where: {
                userId_deviceId: {
                    userId,
                    deviceId
                }
            },
            update: {
                deviceId,
                lastLoginTime: new Date(),
                accessToken: tokens.accessToken,
                accessTokenExpiresAt: new Date(Date.now() + (1000 * 3600 * 2)), // + 2 hours
                refreshToken: tokens.refreshToken,
                refreshTokenExpiresAt: new Date(Date.now() + (1000 * 3600 * 24 * 7)) // + 7 days
            },
            create: {
                deviceId,
                userId,
                userAgent,
                ip,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
        });

        return sess;
    } catch (err) {
        console.error(err);
        return DatabaseError.UNKNOWN;
    }
};

export const checkIfNewIp = async (userId: string, ip: string): Promise<boolean> => {
    const sessions = await prisma.session.findMany({
        where: {
            AND: [
                { userId },
                { ip }
            ]
        },
        select: {
            ip: true,
        }
    });

    return sessions.length === 0;
};

export const updateTokens = async (deviceId: string, userId: string, tokens: Tokens): Promise<DatabaseError> => {
    try {
        await prisma.session.update({
            where: {
                userId_deviceId: {
                    deviceId,
                    userId
                }
            },
            data: {
                lastLoginTime: new Date(),
                accessToken: tokens.accessToken,
                accessTokenExpiresAt: new Date(Date.now() + (1000 * 3600 * 2)), // + 2 hours
                refreshToken: tokens.refreshToken,
                refreshTokenExpiresAt: new Date(Date.now() + (1000 * 3600 * 24 * 7)) // + 7 days
            }
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025") {
                return DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND;
            }
        }
        console.error(err);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const findSessionByToken = async (token: string): Promise<Session | null> => {
    return (await prisma.session.findMany({
        where: {
            accessToken: token
        }
    }))?.[0] ?? null;
};
