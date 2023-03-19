import { Prisma, User, UserSettings } from "@prisma/client";
import { prisma } from "./client";
import { DatabaseError } from "./utils";

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

export const setUserResetToken = async (userId: string, token: string, expiration: Date): Promise<DatabaseError> => {
    try {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                resetPasswordToken: token,
                resetPasswordTokenExpiry: expiration,
            }
        });
    } catch (e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const getUserByResetToken = async (token: string): Promise<User | null> => {
    return await prisma.user.findFirst({
        where: {
            AND: [
                {
                    resetPasswordToken: token,
                },
                {
                    resetPasswordTokenExpiry: {
                        gt: new Date(),
                    }
                }
            ],
        },
    });
};

export const updateUserPassword = async (hash: string, token: string): Promise<DatabaseError> => {
    try {
        const payload = await prisma.user.updateMany({
            where: {
                AND: [
                    {
                        resetPasswordToken: token,
                    },
                    {
                        resetPasswordTokenExpiry: {
                            gt: new Date(),
                        }
                    }
                ],
            },
            data: {
                resetPasswordTokenExpiry: null,
                password: hash,
                twoFactorAuth: false,
            }
        });

        if (!payload.count) {
            return DatabaseError.NOT_FOUND;
        }
    } catch (e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const getUserById = async (id: string): Promise<User & { settings: UserSettings | null, notificationSubHash: string } | null> => {
    const user = await prisma.user.findUnique({
        where: {
            id,
        },
        include: {
            settings: true,
        }
    });

    return user ? { ...user, notificationSubHash: "" } : null;
};

export const getUserByUsername = async (username: string): Promise<Partial<User> & { settings: UserSettings | null } | null> => {
    const users = await prisma.user.findMany({
        where: {
            username: { equals: username, mode: "insensitive" },
        },
        select: {
            id: true,
            displayName: true,
            username: true,
            avatarURL: true,
            isAdmin: true,
            settings: true,
            _count: {
                select: {
                    posts: {
                        where: {
                            deleted: false,
                        }
                    },
                    followers: true,
                    following: true
                }
            },
            followers: {
                select: {
                    followerId: true
                }
            }
        },
    });

    if (!users.length) return null;

    return users[0];
};

export const followUser = async (userId: string, targetId: string): Promise<DatabaseError> => {
    try {
        await prisma.follow.create({
            data: {
                followerId: userId,
                followingId: targetId
            }
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2002") {
                return DatabaseError.DUPLICATE;
            }
        }
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const unfollowUser = async (userId: string, targetId: string): Promise<DatabaseError> => {
    try {
        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: targetId
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
