import { DatabaseError } from "./utils";
import { Event } from "@prisma/client";
import { prisma } from "./client";

export const queryEvents = async (page: number, userId: string, limit = 25): Promise<Event[]> => {
    return await prisma.$queryRaw`
    SELECT id, title, time, location, "imageURL", description,
    COUNT(i."userId")::INTEGER as interest,
    EXISTS (SELECT "userId" FROM "EventInterest" WHERE "userId" = ${userId} AND "eventId" = id) as "isInterested"
    FROM "Event"
    LEFT JOIN "EventInterest" i
    ON i."eventId" = id
    GROUP BY id
    ORDER BY time < now(), time ASC
    LIMIT ${limit} OFFSET ${25 * page}
    ;`;
};

export const querySidebarEvents = async (userId: string): Promise<Event[]> => {
    return await prisma.$queryRaw`
    SELECT id, title, time, location, "imageURL", description,
    COUNT(i."userId")::INTEGER as interest,
    EXISTS (SELECT "userId" FROM "EventInterest" WHERE "userId" = ${userId} AND "eventId" = id) as "isInterested"
    FROM "Event"
    LEFT JOIN "EventInterest" i
    ON i."eventId" = id
    WHERE time > now()
    GROUP BY id
    ORDER BY time < now(), time ASC
    LIMIT 3
    ;`;
};

export const addEventDB = async (id: string, title: string, description: string, location: string, time: Date, imageURL: string | undefined): Promise<DatabaseError> => {
    try {
        await prisma.event.create({
            data: {
                id,
                title,
                description,
                location,
                time,
                imageURL,
            }
        });
    } catch (e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const toggleInterestDB = async (id: string, userId: string, interest: boolean): Promise<DatabaseError> => {
    try {
        const event = await prisma.event.findUnique({
            where: {
                id,
            },
        });

        if (new Date(event?.time ?? new Date()).getTime() <= new Date().getTime()) {
            return DatabaseError.EXPIRED;
        }

        if (interest) {
            await prisma.eventInterest.create({
                data: {
                    eventId: id,
                    userId,
                }
            });
        } else {
            await prisma.eventInterest.delete({
                where: {
                    eventId_userId: {
                        eventId: id,
                        userId,
                    }
                }
            });
        }
    } catch (e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};
