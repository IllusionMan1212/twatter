import { Conversation, ConversationMember, Message, Prisma, User, UserSettings } from "@prisma/client";
import { prisma } from "./client";
import { DatabaseError } from "./utils";

export const getConversationsDB = async (userId: string, page: number): Promise<Conversation[]> => {
    return await prisma.conversation.findMany({
        where: {
            members: {
                some: {
                    userId,
                    isParticipating: true,
                }
            }
        },
        orderBy: {
            updatedAt: "desc",
        },
        take: 20,
        skip: 20 * page,
        include: {
            messages: {
                orderBy: {
                    createdAt: "desc",
                },
                take: 1,
                select: {
                    content: true,
                }
            },
            members: {
                where: {
                    userId: {
                        not: userId,
                    }
                },
                select: {
                    User: {
                        select: {
                            id: true,
                            displayName: true,
                            username: true,
                            avatarURL: true,
                        }
                    }
                },
            },
        }
    });
};

export const leaveConversationDB = async (conversationId: string, userId: string): Promise<DatabaseError> => {
    try {
        await prisma.conversationMember.update({
            where: {
                userId_conversationId: {
                    userId,
                    conversationId
                }
            },
            data: {
                isParticipating: false,
            }
        });
    } catch (e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const isMemberOfConvo = async (conversationId: string, userId: string): Promise<ConversationMember | null> => {
    return await prisma.conversationMember.findUnique({
        where: {
            userId_conversationId: {
                userId,
                conversationId,
            },
        },
    });
};

export const getMessagesDB = async (conversationId: string, page: number): Promise<Message[]> => {
    return await prisma.message.findMany({
        where: {
            conversationId,
        },
        take: 50,
        skip: page * 50,
        orderBy: {
            createdAt: "desc",
        }
    });
};

export const createOrUpdateConversation = async (userId: string, recipientId: string): Promise<string | null> => {
    const convos = await prisma.conversation.findMany({
        where: {
            members: {
                every: {
                    userId: {
                        in: [userId, recipientId]
                    }
                }
            }
        },
        select: {
            id: true,
            members: true,
        }
    });

    if (convos.length) {
        if (!convos[0].members.find(m => m.userId === userId)?.isParticipating) {
            await prisma.conversationMember.update({
                where: {
                    userId_conversationId: {
                        userId,
                        conversationId: convos[0].id,
                    }
                },
                data: {
                    isParticipating: true,
                },
            });
        }

        return convos[0].id;
    }

    return await prisma.$transaction(async (tx) => {
        const recipientUser = await tx.user.findUnique({
            where: {
                id: recipientId,
            },
            select: {
                restricted: true,
            }
        });

        if (recipientUser?.restricted) {
            return null;
        }

        return (await tx.conversation.create({
            data: {
                members: {
                    createMany: {
                        data: [
                            { userId, isParticipating: true },
                            { userId: recipientId },
                        ]
                    }
                }
            },
            select: {
                id: true,
            }
        })).id;
    });
};

export const isValidUser = async (userId: string): Promise<Partial<User & { settings: Partial<UserSettings> | null }> | null> => {
    return await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            settings: {
                select: {
                    allowAllDMs: true,
                }
            },
        }
    });
};

export const createMessage = async (message: string, attachmentURL: string | null, conversationId: string, userId: string, recipientId: string): Promise<Message | null> => {
    try {
        const newMessage = await prisma.$transaction(async (tx) => {
            const members = await tx.conversationMember.findMany({
                where: {
                    conversationId,
                    OR: [
                        { userId: userId },
                        { userId: recipientId }
                    ]
                },
            });

            if (members.length < 2) {
                throw new Error("Unauthorized action");
            }

            const newMessage = await tx.message.create({
                data: {
                    content: message,
                    attachmentURL,
                    conversationId,
                    memberId: userId,
                },
            });

            await tx.conversation.update({
                where: {
                    id: conversationId,
                },
                data: {
                    updatedAt: new Date(),
                    lastMessage: message,
                }
            });

            if (!members.find(m => m.userId === recipientId)?.isParticipating) {
                await tx.conversationMember.update({
                    where: {
                        userId_conversationId: {
                            userId: recipientId,
                            conversationId
                        },
                    },
                    data: {
                        isParticipating: true,
                    }
                });
            }

            if (!members.find(m => m.userId === userId)?.isParticipating) {
                await tx.conversationMember.update({
                    where: {
                        userId_conversationId: {
                            userId,
                            conversationId
                        },
                    },
                    data: {
                        isParticipating: true,
                    }
                });
            }

            return newMessage;
        });

        return newMessage;
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const checkConversationMembers = async (ids: string[], convoId: string): Promise<Conversation[]> => {
    return await prisma.conversation.findMany({
        where: {
            id: convoId,
            members: {
                every: {
                    userId: {
                        in: ids
                    }
                }
            }
        },
    });
};

export const markMessagesAsRead = async (conversationId: string, recipientId: string, userId: string): Promise<number> => {
    const affected = await prisma.$executeRaw`
    UPDATE "Message" m
    SET "wasRead" = true
    FROM "UserSettings" us
    WHERE m."conversationId" = ${conversationId}
    AND m."memberId" = ${recipientId}
    AND us."userId" = ${userId}
    AND m."wasRead" = false
    AND us."readReceipts" = true
    ;`;

    return affected;
};

export const queryRecommendedPeople = async (userId: string): Promise<User[]> => {
    return await prisma.$queryRaw`
    SELECT u.id, u.username, u."avatarURL", u."displayName",
    s."allowAllDMs"
    FROM "User" u
    LEFT JOIN "UserSettings" s
    ON u.id = s."userId"
    WHERE u.restricted = false AND u.id <> ${userId}
    LIMIT 10
    ;`;
};

export const deleteMessageDB = async (userId: string, messageId: string, conversationId: string): Promise<DatabaseError> => {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.message.update({
                where: {
                    id: messageId,
                    memberId: userId,
                },
                data: {
                    deleted: true,
                    content: "",
                }
            });
            await tx.conversation.update({
                where: {
                    id: conversationId,
                },
                data: {
                    lastMessage: "",
                }
            });
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2025") {
                // Operation depends on required record that was not found
                return DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND;
            }
        }

        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};
