import { User, Event, PostReport } from "@prisma/client";
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

export const queryPendingReports = async (page: number): Promise<PostReport[]> => {
    return await prisma.$queryRaw`
    WITH report AS (
        SELECT
        "originalReport".id AS "originalReportId",
        "originalReport"."postId" AS "postId",
        group_stats.reason,
        group_stats.count AS reports,
        group_stats.min AS "firstReportedAt",
        group_stats.max AS "lastReportedAt",
        group_stats.resolved,
        "originalReport"."username" AS "originalReportSubmitterUsername"
        FROM (
            SELECT reason, COUNT(*)::INTEGER, MIN("createdAt"), MAX("createdAt"), resolved
            FROM "PostReport"
            GROUP BY reason, resolved
        ) AS group_stats
        JOIN LATERAL (
            SELECT pr.id, pr.reason, pr."submitterId", pr."postId", pr."createdAt", u.username
            FROM "PostReport" pr
            INNER JOIN "User" u
            ON u.id = pr."submitterId"
            WHERE reason = group_stats.reason
            ORDER BY "createdAt"
            LIMIT 1
        ) AS "originalReport"
        ON group_stats.reason = "originalReport".reason
        WHERE resolved = false
        ORDER BY reports DESC
        LIMIT 25
        OFFSET ${page * 25}
    )
    SELECT r.*,
    JSON_BUILD_OBJECT(
        'id', p.id,
        'content', p.content,
        'attachments', JSON_AGG(JSON_BUILD_OBJECT('url', a.url, 'thumbUrl', a."thumbUrl", 'bgColor', a."bgColor")),
        'createdAt', p."createdAt",
        'author', JSON_BUILD_OBJECT('username', u.username, 'avatarURL', u."avatarURL", 'displayName', u."displayName")
    ) as "Post"
    FROM report r
    INNER JOIN "Post" p
    ON p.id = "postId"
    INNER JOIN "User" u
    ON u.id = p."authorId"
    LEFT JOIN "PostAttachment" a
    ON a."postId" = p.id
    GROUP BY r."originalReportId", r."postId", r.reason, r.resolved, r.reports, r."firstReportedAt", r."lastReportedAt", r."originalReportSubmitterUsername",
    p.id, u.username, u."displayName", u."avatarURL"
    `;
};

export const queryResolvedReports = async (page: number): Promise<PostReport[]> => {
    return await prisma.$queryRaw`
    WITH report AS (
        SELECT
        "originalReport".id AS "originalReportId",
        "originalReport"."postId" AS "postId",
        group_stats.reason,
        group_stats.count AS reports,
        group_stats.min AS "firstReportedAt",
        group_stats.max AS "lastReportedAt",
        group_stats.resolved,
        "originalReport"."username" AS "originalReportSubmitterUsername"
        FROM (
            SELECT reason, COUNT(*)::INTEGER, MIN("createdAt"), MAX("createdAt"), resolved
            FROM "PostReport"
            GROUP BY reason, resolved
        ) AS group_stats
        JOIN LATERAL (
            SELECT pr.id, pr.reason, pr."submitterId", pr."postId", pr."createdAt", u.username
            FROM "PostReport" pr
            INNER JOIN "User" u
            ON u.id = pr."submitterId"
            WHERE reason = group_stats.reason
            ORDER BY "createdAt"
            LIMIT 1
        ) AS "originalReport"
        ON group_stats.reason = "originalReport".reason
        WHERE resolved = true
        ORDER BY reports DESC
        LIMIT 25
        OFFSET ${page * 25}
    )
    SELECT r.*,
    JSON_BUILD_OBJECT(
        'id', p.id,
        'content', p.content,
        'attachments', JSON_AGG(JSON_BUILD_OBJECT('url', a.url, 'thumbUrl', a."thumbUrl", 'bgColor', a."bgColor")),
        'createdAt', p."createdAt",
        'author', JSON_BUILD_OBJECT('username', u.username, 'avatarURL', u."avatarURL", 'displayName', u."displayName")
    ) as "Post"
    FROM report r
    INNER JOIN "Post" p
    ON p.id = "postId"
    INNER JOIN "User" u
    ON u.id = p."authorId"
    LEFT JOIN "PostAttachment" a
    ON a."postId" = p.id
    GROUP BY r."originalReportId", r."postId", r.reason, r.resolved, r.reports, r."firstReportedAt", r."lastReportedAt", r."originalReportSubmitterUsername",
    p.id, u.username, u."displayName", u."avatarURL"
    `;
};
