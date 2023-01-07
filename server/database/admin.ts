import { User, Event } from "@prisma/client";
import { prisma } from "./client";
import { DatabaseError } from "./utils";

export const queryAllUsers = async (page: number): Promise<Partial<User>[]> => {
    return await prisma.user.findMany({
        take: 25,
        skip: page * 25,
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            displayName: true,
            username: true,
            email: true,
            restricted: true,
            createdAt: true,
        },
    });
};

export const queryAllEvents = async (page: number): Promise<Partial<Event>[]> => {
    return await prisma.event.findMany({
        take: 25,
        skip: page * 25,
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            title: true,
            time: true,
            location: true,
            createdAt: true,
        },
    });
};

export const toggleUserRestriction = async (ids: string[], restrict: boolean): Promise<DatabaseError> => {
    try {
        await prisma.user.updateMany({
            where: {
                id: {
                    in: ids,
                },
            },
            data: {
                restricted: restrict,
            },
        });
    } catch(e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const deleteUsersDB = async (ids: string[]): Promise<DatabaseError> => {
    try {
        await prisma.user.deleteMany({
            where: {
                id: {
                    in: ids
                },
            }
        });
    } catch (e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const deleteEventsDB = async (ids: string[]): Promise<DatabaseError> => {
    try {
        await prisma.event.deleteMany({
            where: {
                id: {
                    in: ids
                },
            }
        });
    } catch (e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};
