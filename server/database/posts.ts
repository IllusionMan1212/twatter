import { Post, PostAttachment, Prisma, ReportReason } from "@prisma/client";
import { Attachment } from "../controllers/utils/posts";
import { prisma } from "./client";
import { DatabaseError } from "./utils";
import { Metadata } from "metascraper";

export const queryUserPosts = async (sessionUserId: string | undefined, userId: string, page: number): Promise<Post[]> => {
    const liked = userId != undefined ? Prisma.sql`EXISTS (SELECT "userId" FROM "PostLike" l WHERE l."postId" = p.id AND l."userId" = ${sessionUserId}) as liked` : Prisma.sql`false as liked`;

    return await prisma.$queryRaw`
    SELECT p.id, p.content, p."createdAt", p."ogData",
    u.id as "authorId", u.username as "authorUsername", u."avatarURL" as "authorAvatarURL",
    u."displayName" as "authorName",
    JSON_AGG(JSON_BUILD_OBJECT('url', a.url, 'thumbUrl', a."thumbUrl", 'bgColor', a."bgColor")) FILTER (WHERE a.url IS NOT NULL) as attachments,
    (SELECT COUNT("postId")::INTEGER FROM "PostLike" l WHERE l."postId" = p.id) as likes,
    ${liked},
    (SELECT COUNT(comments)::INTEGER FROM "Post" comments WHERE comments.deleted = false AND comments."parentId" = p.id) as comments,
    parent_author.username as "parentAuthorUsername"
    FROM "Post" p
    LEFT JOIN "Post" parent
    ON p."parentId" = parent.id
    LEFT JOIN "User" parent_author
    ON parent."authorId" = parent_author.id
    INNER JOIN "User" u
    ON u.id = p."authorId"
    LEFT JOIN "PostAttachment" a
    ON a."postId" = p.id
    WHERE p.deleted = false AND p."authorId" = ${userId}
    GROUP BY p.id, u.id, parent_author.username
    ORDER BY p."createdAt" DESC
    LIMIT 30 OFFSET ${page * 30}
    ;`;
};

export const queryPosts = async (userId: string, page: number): Promise<Post[]> => {
    return await prisma.$queryRaw`
    SELECT p.id, p.content, p."createdAt", p."ogData",
    u.id as "authorId", u.username as "authorUsername", u."avatarURL" as "authorAvatarURL",
    u."displayName" as "authorName",
    JSON_AGG(JSON_BUILD_OBJECT('url', a.url, 'thumbUrl', a."thumbUrl", 'bgColor', a."bgColor")) FILTER (WHERE a.url IS NOT NULL) as attachments,
    (SELECT COUNT("postId")::INTEGER FROM "PostLike" l WHERE l."postId" = p.id) as likes,
    EXISTS (SELECT "userId" FROM "PostLike" l WHERE l."postId" = p.id AND l."userId" = ${userId}) as liked,
    (SELECT COUNT(comments)::INTEGER FROM "Post" comments WHERE comments.deleted = false AND comments."parentId" = p.id) as comments,
    parent_author.username as "parentAuthorUsername"
    FROM "Post" p
    LEFT JOIN "Post" parent
    ON p."parentId" = parent.id
    LEFT JOIN "User" parent_author
    ON parent."authorId" = parent_author.id
    INNER JOIN "User" u
    ON u.id = p."authorId"
    LEFT JOIN "PostAttachment" a
    ON a."postId" = p.id
    WHERE p.deleted = false
    GROUP BY p.id, u.id, parent_author.username
    ORDER BY p."createdAt" DESC
    LIMIT 30 OFFSET ${page * 30}
    ;`;
};

export const queryFeed = async (userId: string, page: number): Promise<Post[]> => {
    return await prisma.$queryRaw`
    WITH feed AS (
        SELECT DISTINCT p.*, a.*
        FROM "Post" p
        LEFT JOIN "Follow" f
        ON f."followerId" = ${userId}
        LEFT JOIN "PostAttachment" a
        ON a."postId" = p.id
        WHERE p.deleted = false AND (p."authorId" = ${userId} OR p."authorId" = f."followingId")
        ORDER BY "createdAt" ASC
    )
    SELECT p.id, p.content, p."createdAt", p."ogData",
    u.id as "authorId", u.username as "authorUsername", u."avatarURL" as "authorAvatarURL",
    u."displayName" as "authorName",
    JSON_AGG(JSON_BUILD_OBJECT('url', p.url, 'thumbUrl', p."thumbUrl", 'bgColor', p."bgColor")) FILTER (WHERE p.url IS NOT NULL) as attachments,
    (SELECT COUNT("postId")::INTEGER FROM "PostLike" l WHERE l."postId" = p.id) as likes,
    EXISTS (SELECT "userId" FROM "PostLike" l WHERE l."postId" = p.id AND l."userId" = ${userId}) as liked,
    (SELECT COUNT(comments)::INTEGER FROM "Post" comments WHERE comments.deleted = false AND comments."parentId" = p.id) as comments,
    parent_author.username as "parentAuthorUsername"
    FROM feed p
    LEFT JOIN "Post" parent
    ON p."parentId" = parent.id
    LEFT JOIN "User" parent_author
    ON parent."authorId" = parent_author.id
    INNER JOIN "User" u
    ON u.id = p."authorId"
    GROUP BY p.id, u.id, parent_author.username, p.content, p."createdAt", p."ogData"
    ORDER BY p."createdAt" DESC
    LIMIT 30 OFFSET ${page * 30}
    ;`;
};

export const queryPost = async (userId: string | undefined, postId: string): Promise<(Post & { muted: boolean })[]> => {
    const liked = userId != undefined ? Prisma.sql`EXISTS (SELECT "userId" FROM "PostLike" l WHERE l."postId" = p.id AND l."userId" = ${userId}) as liked` : Prisma.sql`false as liked`;

    return await prisma.$queryRaw`
    SELECT p.id, p.content, p."createdAt", p."ogData",
    u.id as "authorId", u.username as "authorUsername", u."avatarURL" as "authorAvatarURL",
    u."displayName" as "authorName",
    JSON_AGG(JSON_BUILD_OBJECT('url', a.url, 'thumbUrl', a."thumbUrl", 'bgColor', a."bgColor")) FILTER (WHERE a.url IS NOT NULL) as attachments,
    (SELECT COUNT("postId")::INTEGER FROM "PostLike" l WHERE l."postId" = p.id) as likes,
    ${liked},
    (SELECT COUNT(comments)::INTEGER FROM "Post" comments WHERE comments.deleted = false AND comments."parentId" = p.id) as comments,
    parent_author.username as "parentAuthorUsername"
    FROM "Post" p
    LEFT JOIN "Post" parent
    ON p."parentId" = parent.id
    LEFT JOIN "User" parent_author
    ON parent."authorId" = parent_author.id
    INNER JOIN "User" u
    ON u.id = p."authorId"
    LEFT JOIN "PostAttachment" a
    ON a."postId" = p.id
    WHERE p.deleted = false AND p.id = ${postId}
    GROUP BY p.id, u.id, parent_author.username
    ;`;
};

export const queryThread = async (userId: string | undefined, postId: string): Promise<Post[]> => {
    const liked = userId != undefined ? Prisma.sql`EXISTS (SELECT "userId" FROM "PostLike" l WHERE l."postId" = p.id AND l."userId" = ${userId})` : Prisma.sql`false`;

    return await prisma.$queryRaw`
    WITH RECURSIVE posts AS (
      SELECT op.id, op.content, op."createdAt", op."authorId", op.deleted, op."parentId", op."ogData"
      FROM "Post" op
      WHERE op.id = ${postId}
      UNION
        SELECT parent.id,
        CASE WHEN parent.deleted = FALSE THEN parent.content ELSE NULL END AS content,
        parent."createdAt",
        parent."authorId",
        parent.deleted,
        parent."parentId"
        FROM "Post" parent
        INNER JOIN posts p ON p."parentId" = parent.id
    )
    SELECT p.id, p.content, p."createdAt", p."ogData",
    u.id as "authorId", u.username as "authorUsername", u."avatarURL" as "authorAvatarURL", u."displayName" as "authorName",
    CASE WHEN p.deleted = FALSE THEN JSON_AGG(JSON_BUILD_OBJECT('url', a.url, 'thumbUrl', a."thumbUrl", 'bgColor', a."bgColor")) FILTER (WHERE a.url IS NOT NULL) ELSE NULL END as attachments,
    CASE WHEN p.deleted = FALSE THEN (SELECT COUNT("postId")::INTEGER FROM "PostLike" l WHERE l."postId" = p.id) ELSE 0 END as likes,
    CASE WHEN p.deleted = FALSE THEN ${liked} ELSE false END as liked,
    CASE WHEN p.deleted = FALSE THEN (SELECT COUNT(comments)::INTEGER FROM "Post" comments WHERE comments.deleted = false AND comments."parentId" = p.id) ELSE 0 END as comments,
    parent_author.username as "parentAuthorUsername"
    FROM posts p
    INNER JOIN "User" u
    ON u.id = p."authorId"
    LEFT JOIN "PostAttachment" a
    ON a."postId" = p.id
    LEFT JOIN "Post" parent
    ON parent.id = p."parentId"
    LEFT JOIN "User" parent_author
    ON parent_author.id = parent."authorId"
    WHERE p.id <> ${postId}
    GROUP BY p.id, p.content, p."createdAt", p.deleted, u.id, u.username, u."avatarURL", u."displayName", parent_author.username
    ORDER BY p."createdAt" ASC;
    ;`;
};

export const queryComments = async (userId: string | undefined, postId: string, page: number) => {
    const liked = userId != undefined ? Prisma.sql`EXISTS (SELECT "userId" FROM "PostLike" l WHERE l."postId" = p.id AND l."userId" = ${userId}) as liked` : Prisma.sql`false as liked`;

    return await prisma.$queryRaw`
    SELECT p.id, p.content, p."createdAt", p."ogData",
    u.id as "authorId", u.username as "authorUsername", u."avatarURL" as "authorAvatarURL",
    u."displayName" as "authorName",
    JSON_AGG(JSON_BUILD_OBJECT('url', a.url, 'thumbUrl', a."thumbUrl", 'bgColor', a."bgColor")) FILTER (WHERE a.url IS NOT NULL) as attachments,
    (SELECT COUNT("postId")::INTEGER FROM "PostLike" l WHERE l."postId" = p.id) as likes,
    ${liked},
    (SELECT COUNT(comments)::INTEGER FROM "Post" comments WHERE comments.deleted = false AND comments."parentId" = p.id) as comments,
    parent_author.username as "parentAuthorUsername"
    FROM "Post" p
    LEFT JOIN "Post" parent
    ON p."parentId" = parent.id
    LEFT JOIN "User" parent_author
    ON parent."authorId" = parent_author.id
    INNER JOIN "User" u
    ON u.id = p."authorId"
    LEFT JOIN "PostAttachment" a
    ON a."postId" = p.id
    WHERE p.deleted = false AND p."parentId" = ${postId}
    GROUP BY p.id, u.id, parent_author.username
    ORDER BY p."createdAt" DESC
    LIMIT 20 OFFSET ${page * 20}
    ;`;
};

export const createPostDB = async (
    id: string,
    userId: string,
    content: { val: string | undefined, og: Metadata[] },
    attachments: Attachment[],
    parentId: string | undefined
): Promise<[DatabaseError, Partial<Post & { attachments: Partial<PostAttachment>[], parent: Partial<Post> | null } | null>]> => {
    let post: Partial<Post> & { attachments: Partial<PostAttachment>[], parent: Partial<Post> | null } | null = null;

    try {
        await prisma.$transaction(async (tx) => {
            const parent = await tx.post.findUnique({
                where: {
                    id: parentId ?? "",
                },
                select: {
                    deleted: true,
                }
            });

            if (parent?.deleted) {
                return [DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND, null];
            }

            post = await tx.post.create({
                data: {
                    id,
                    content: content.val,
                    ogData: content.og as unknown as Prisma.JsonArray,
                    authorId: userId,
                    parentId,
                    attachments: {
                        createMany: {
                            data: [
                                ...attachments.map((attachment) => ({
                                    url: attachment.fullUrl,
                                    thumbUrl: attachment.thumbnailUrl,
                                    bgColor: attachment.color
                                }))
                            ]
                        }
                    }
                },
                select: {
                    id: true,
                    authorId: true,
                    content: true,
                    parentId: true,
                    parent: {
                        select: {
                            authorId: true,
                        }
                    },
                    attachments: {
                        select: {
                            url: true
                        }
                    }
                }
            });
        });
    } catch (e) {
        console.error(e);
        return [DatabaseError.UNKNOWN, null];
    }

    return [DatabaseError.SUCCESS, post];
};

export const deletePostDB = async (postId: string, userId: string): Promise<DatabaseError> => {
    try {
        const t = await prisma.post.updateMany({
            where: {
                AND: [
                    { id: postId },
                    { authorId: userId },
                    { deleted: false }
                ],
            },
            data: {
                deleted: true,
            }
        });

        if (t.count === 0) {
            return DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND;
        }
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2025") {
                // Operation depends on required record that was not found
                return DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND;
            }
        }

        console.error(
            "Unknown error:",
            typeof e === "string" ? e : JSON.stringify(e),
        );
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const likePostDB = async (postId: string, userId: string): Promise<[DatabaseError, Partial<Post & { attachments: Partial<PostAttachment>[] }> | null]> => {
    try {
        return await prisma.$transaction(async (tx) => {
            const post = await tx.post.findUnique({
                where: {
                    id: postId,
                },
                select: {
                    id: true,
                    deleted: true,
                    authorId: true,
                    content: true,
                    attachments: {
                        select: {
                            url: true
                        }
                    }
                }
            });

            if (!post || post.deleted) {
                return [DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND, null];
            }

            await tx.postLike.create({
                data: {
                    postId,
                    userId
                }
            });
            return [DatabaseError.SUCCESS, post];
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2003") {
                return [DatabaseError.FOREIGN_KEY_CONSTRAINT_FAILED, null];
            }
        }
        console.error(e);
        return [DatabaseError.UNKNOWN, null];
    }
};

export const unlikePostDB = async (postId: string, userId: string): Promise<DatabaseError> => {
    try {
        return await prisma.$transaction(async (tx) => {
            const post = await tx.post.findUnique({
                where: {
                    id: postId,
                },
                select: {
                    deleted: true,
                }
            });

            if (!post || post.deleted) {
                return DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND;
            }

            const affected = (await tx.postLike.delete({
                where: {
                    postId_userId: {
                        postId,
                        userId
                    }
                }
            }));

            if (!affected) return DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND;

            return DatabaseError.SUCCESS;
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2003") {
                return DatabaseError.FOREIGN_KEY_CONSTRAINT_FAILED;
            }
        }
        console.error(e);
        return DatabaseError.UNKNOWN;
    }
};

export const submitPostReport = async (
    postId: string,
    submitterId: string,
    reason: ReportReason,
    comments: string | undefined,
): Promise<DatabaseError> => {
    try {
        return await prisma.$transaction(async (tx) => {
            const post = await tx.post.findUnique({
                where: {
                    id: postId,
                },
                select: {
                    deleted: true,
                }
            });

            if (!post || post.deleted) {
                return DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND;
            }

            await tx.postReport.create({
                data: {
                    postId,
                    submitterId,
                    reason,
                    comments
                }
            });

            return DatabaseError.SUCCESS;
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2003") {
                return DatabaseError.FOREIGN_KEY_CONSTRAINT_FAILED;
            } else if (e.code === "P2002") {
                return DatabaseError.DUPLICATE;
            }
        }
        console.error(e);
        return DatabaseError.UNKNOWN;
    }
};
