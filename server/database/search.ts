import { Event, User } from "@prisma/client";
import { prisma } from "./client";

export const searchUsers = async (query: string, page: number, userId: string, limit = 20): Promise<User[]> => {
    return await prisma.$queryRaw`
    SELECT u.id, u.username, u."avatarURL", u."displayName",
    s."allowAllDMs",
    EXISTS (SELECT * FROM "Follow" f WHERE f."followerId" = ${userId} AND f."followingId" = u.id) as "isFollowing"
    FROM "User" u
    LEFT JOIN "UserSettings" s
    ON u.id = s."userId"
    WHERE (u.username ILIKE ${`%${query}%`} OR
    u."displayName" ILIKE ${`%${query}%`})
    LIMIT ${limit} OFFSET ${page * limit}
    ;`;
};

export const searchEvents = async (query: string, userId: string, page: number, limit = 20): Promise<Event[]> => {
    return await prisma.$queryRaw`
    SELECT id, title, time, location, "imageURL", description,
    COUNT(i."userId")::INTEGER as interest,
    EXISTS (SELECT "userId" FROM "EventInterest" WHERE "userId" = ${userId} AND "eventId" = id) as "isInterested"
    FROM "Event"
    LEFT JOIN "EventInterest" i
    ON i."eventId" = id
    WHERE title ILIKE ${`%${query}%`} OR location ILIKE ${`%${query}%`}
    GROUP BY id
    ORDER BY time < now(), time ASC
    LIMIT ${limit} OFFSET ${page * limit}
    ;`;
};
