import { User, Event, PostReport, ReportReason, ReportResolveReason } from "@prisma/client";
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
        "originalReport"."username" AS "originalReportSubmitterUsername",
        "originalReport".comments AS "originalReportComments"
        FROM (
            SELECT reason, COUNT(*)::INTEGER, MIN("createdAt"), MAX("createdAt"), resolved
            FROM "PostReport"
            GROUP BY reason, resolved
        ) AS group_stats
        JOIN LATERAL (
            SELECT pr.id, pr.reason, pr."submitterId", pr."postId", pr."createdAt", u.username, pr.comments
            FROM "PostReport" pr
            INNER JOIN "User" u
            ON u.id = pr."submitterId"
            WHERE reason = group_stats.reason AND resolved = false
            ORDER by "createdAt"
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
        'attachments', JSON_AGG(JSON_BUILD_OBJECT('url', a.url, 'thumbUrl', a."thumbUrl", 'bgColor', a."bgColor")) FILTER (WHERE a.url IS NOT NULL),
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
    GROUP BY r."originalReportId", r."postId", r.reason, r.resolved, r.reports, r."firstReportedAt", r."lastReportedAt", r."originalReportSubmitterUsername", r."originalReportComments",
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
        group_stats.max_update as "resolvedAt",
        "originalReport"."username" AS "originalReportSubmitterUsername",
        "originalReport".comments AS "originalReportComments",
        "originalReport"."resolveReason"
        FROM (
            SELECT reason, COUNT(*)::INTEGER, MIN("createdAt"), MAX("createdAt"), resolved, MAX("updatedAt") as max_update
            FROM "PostReport"
            GROUP BY reason, resolved
        ) AS group_stats
        JOIN LATERAL (
            SELECT pr.id, pr.reason, pr."submitterId", pr."postId", pr."createdAt", u.username, pr.comments, pr."resolveReason"
            FROM "PostReport" pr
            INNER JOIN "User" u
            ON u.id = pr."submitterId"
            WHERE reason = group_stats.reason AND resolved = true
            ORDER by "createdAt"
            LIMIT 1
        ) AS "originalReport"
        ON group_stats.reason = "originalReport".reason
        WHERE resolved = true
        LIMIT 25
        OFFSET ${page * 25}
    )
    SELECT r.*,
    JSON_BUILD_OBJECT(
        'id', p.id,
        'content', p.content,
        'attachments', JSON_AGG(JSON_BUILD_OBJECT('url', a.url, 'thumbUrl', a."thumbUrl", 'bgColor', a."bgColor")) FILTER (WHERE a.url IS NOT NULL),
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
    GROUP BY r."originalReportId", r."postId", r.reason, r.resolved, r.reports, r."firstReportedAt", r."lastReportedAt", r."resolvedAt", r."originalReportSubmitterUsername", r."originalReportComments", r."resolveReason",
    p.id, u.username, u."displayName", u."avatarURL"
    ORDER BY r."resolvedAt" DESC
    `;
};

export const queryReporters = async (postId: string, reason: ReportReason, page: number): Promise<Partial<PostReport>[]> => {
    return await prisma.postReport.findMany({
        where: {
            postId,
            reason,
        },
        select: {
            comments: true,
            createdAt: true,
            Submitter: {
                select: {
                    username: true,
                    avatarURL: true
                }
            }
        },
        take: 30,
        skip: page * 30,
        orderBy: {
            createdAt: "desc"
        }
    });
};

export const resolveReportDB = async (reason: ReportReason, postId: string, deleted: boolean): Promise<DatabaseError> => {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.postReport.updateMany({
                where: {
                    reason,
                    postId,
                },
                data: {
                    resolved: true,
                    resolveReason: deleted ? ReportResolveReason.Deleted : ReportResolveReason.Invalid,
                }
            });

            if (deleted) {
                await tx.post.update({
                    where: {
                        id: postId
                    },
                    data: {
                        deleted: true
                    }
                });
            }
        });
    } catch (err) {
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};
