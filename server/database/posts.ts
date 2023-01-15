import { Post, Prisma } from "@prisma/client";
import { prisma } from "./client";
import { DatabaseError } from "./utils";

export const queryUserPosts = async (sessionUserId: string | undefined, userId: string, page: number): Promise<Post[]> => {
    const liked = userId != undefined ? Prisma.sql`EXISTS (SELECT "userId" FROM "PostLike" l WHERE l."postId" = p.id AND l."userId" = ${sessionUserId}) as liked` : Prisma.sql`false as liked`;

    return await prisma.$queryRaw`
    SELECT p.id, p.content, p."createdAt",
    u.id as "authorId", u.username as "authorUsername", u."avatarURL" as "authorAvatarURL",
    u."displayName" as "authorName",
    ARRAY_AGG(a.url) FILTER (WHERE a.url IS NOT NULL) as attachments,
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
    SELECT p.id, p.content, p."createdAt",
    u.id as "authorId", u.username as "authorUsername", u."avatarURL" as "authorAvatarURL",
    u."displayName" as "authorName",
    ARRAY_AGG(a.url) FILTER (WHERE a.url IS NOT NULL) as attachments,
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

export const queryPost = async (userId: string | undefined, postId: string): Promise<Post[]> => {
    const liked = userId != undefined ? Prisma.sql`EXISTS (SELECT "userId" FROM "PostLike" l WHERE l."postId" = p.id AND l."userId" = ${userId}) as liked` : Prisma.sql`false as liked`;

    return await prisma.$queryRaw`
    SELECT p.id, p.content, p."createdAt",
    u.id as "authorId", u.username as "authorUsername", u."avatarURL" as "authorAvatarURL",
    u."displayName" as "authorName",
    ARRAY_AGG(a.url) FILTER (WHERE a.url IS NOT NULL) as attachments,
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

export const queryComments = async (userId: string | undefined, postId: string, page: number) => {
    const liked = userId != undefined ? Prisma.sql`EXISTS (SELECT "userId" FROM "PostLike" l WHERE l."postId" = p.id AND l."userId" = ${userId}) as liked` : Prisma.sql`false as liked`;

    return await prisma.$queryRaw`
    SELECT p.id, p.content, p."createdAt",
    u.id as "authorId", u.username as "authorUsername", u."avatarURL" as "authorAvatarURL",
    u."displayName" as "authorName",
    ARRAY_AGG(a.url) FILTER (WHERE a.url IS NOT NULL) as attachments,
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

export const createPostDB = async (id: string, userId: string, content: string | undefined, attachmentsURLs: string[], parentId: string | undefined): Promise<DatabaseError> => {
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
                return DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND;
            }

            const post = await tx.post.create({
                data: {
                    id,
                    content,
                    authorId: userId,
                    parentId,
                }
            });

            await tx.postAttachment.createMany({
                data: [
                    ...attachmentsURLs.map((url) => ({ postId: post.id, url: url }))
                ]
            });
        });
    } catch (e) {
        console.error(e);
        return DatabaseError.UNKNOWN;
    }

    return DatabaseError.SUCCESS;
};

export const deletePostDB = async (postId: string, userId: string): Promise<DatabaseError> => {
    await prisma.post.update({
        where: {
            id: postId,
            authorId: userId,
            deleted: false,
        },
        data: {
            deleted: true,
        }
    }).catch((e) => {
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
    });

    return DatabaseError.SUCCESS;
};

export const likePostDB = async (postId: string, userId: string): Promise<DatabaseError> => {
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

            if (post?.deleted) {
                return DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND;
            }

            await tx.postLike.create({
                data: {
                    postId,
                    userId
                }
            });
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

            if (post?.deleted) {
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
