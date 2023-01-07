import { Conversation, Message, User, UserSettings } from "@prisma/client";
import { prisma } from "./client";
import { DatabaseError } from "./utils";

export const getConversationsDB = async (userId: string, page: number): Promise<Conversation[]> => {
    return await prisma.$queryRaw`
    SELECT convo.id, convo."updatedAt", convo."lastMessage",
    recipient.username as "recipientUsername", recipient."avatarURL" as "recipientAvatarURL", recipient.id as "recipientId",
    recipient."displayName" as "recipientName"
    FROM "Conversation" convo
    INNER JOIN "User" recipient
    ON recipient.id <> ${userId} AND recipient.id = ANY(convo.members)
    LEFT JOIN "UserSettings" s
    ON s."userId" = recipient.id
    WHERE ${userId} = ANY(convo.participants)
    ORDER BY convo."updatedAt" DESC
    LIMIT 20 OFFSET ${page * 20};
    `;
};

export const leaveConversationDB = async (conversationId: string, userId: string): Promise<DatabaseError> => {
    try {
        await prisma.$queryRaw`
        UPDATE "Conversation"
        SET participants = array_remove(participants, ${userId})
        WHERE id = ${conversationId};
        `;
    } catch (e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const getConversation = async (conversationId: string, userId: string): Promise<Conversation[]> => {
    return await prisma.conversation.findMany({
        where: {
            id: conversationId,
            participants: {
                has: userId,
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

export const createOrUpdateConversation = async (currentUserId: string, userId: string): Promise<string | null> => {
    const convo = await prisma.$queryRaw`
    SELECT id, participants
    FROM "Conversation"
    WHERE members @> array[${currentUserId}, ${userId}];
    ` as Conversation[];

    if (convo?.[0]) {
        if (!convo[0].participants.includes(currentUserId)) {
            await prisma.conversation.update({
                where: {
                    id: convo[0].id,
                },
                data: {
                    participants: {
                        push: currentUserId,
                    },
                },
            });
        }

        return convo[0].id;
    }

    return await prisma.$transaction(async (tx) => {
        const recipientUser = await tx.user.findUnique({
            where: {
                id: userId,
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
                members: [currentUserId, userId],
                participants: [currentUserId],
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
            const convo = await tx.conversation.findUnique({
                where: {
                    id: conversationId,
                },
                select: {
                    participants: true,
                    members: true,
                }
            });

            if (!convo || !convo.members.includes(userId) || !convo.members.includes(recipientId)) {
                throw new Error("Unauthorized action");
            }

            const newMessage = await tx.message.create({
                data: {
                    content: message,
                    attachmentURL,
                    conversationId,
                    userId,
                },
            });

            await tx.conversation.update({
                where: {
                    id: conversationId,
                },
                data: {
                    lastMessage: message,
                    updatedAt: new Date(),
                }
            });

            if (!convo.participants.includes(recipientId)) {
                await tx.conversation.update({
                    where: {
                        id: conversationId,
                    },
                    data: {
                        participants: {
                            push: recipientId,
                        }
                    }
                });
            }

            if (!convo.participants.includes(userId)) {
                await tx.conversation.update({
                    where: {
                        id: conversationId,
                    },
                    data: {
                        participants: {
                            push: userId,
                        }
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
    return await prisma.$queryRaw`
    SELECT id
    FROM "Conversation"
    WHERE id = ${convoId} AND members @> array[${ids[0]}, ${ids[1]}];
    ;` as Conversation[];
};

export const markMessagesAsRead = async (conversationId: string, recipientId: string, userId: string): Promise<number> => {
    const affected = await prisma.$executeRaw`
    UPDATE "Message" m
    SET "wasRead" = true
    FROM "UserSettings" us
    WHERE m."conversationId" = ${conversationId}
    AND m."userId" = ${recipientId}
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
