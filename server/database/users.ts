import { Prisma, User, UserSettings } from "@prisma/client";
import { prisma } from "./client";
import { DatabaseError } from "./utils";

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

export const queryFollowers = async (userId: string, page: number): Promise<{ Follower: Partial<User> }[]> => {
    return await prisma.follow.findMany({
        where: {
            followingId: userId,
        },
        select: {
            Follower: {
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarURL: true,
                    settings: {
                        select: {
                            allowAllDMs: true
                        }
                    },
                    followers: {
                        select: {
                            followerId: true
                        }
                    }
                }
            }
        },
        take: 30,
        skip: 30 * page
    });
};

export const queryFollowing = async (userId: string, page: number): Promise<{ Following: Partial<User> }[]> => {
    return await prisma.follow.findMany({
        where: {
            followerId: userId,
        },
        select: {
            Following: {
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarURL: true,
                    settings: {
                        select: {
                            allowAllDMs: true
                        }
                    },
                    followers: {
                        select: {
                            followerId: true
                        }
                    }
                }
            }
        },
        take: 30,
        skip: 30 * page
    });
};

