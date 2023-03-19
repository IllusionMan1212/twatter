import { Request, Response } from "express";
import { DatabaseError } from "../database/utils";
import {
    createPostDB,
    deletePostDB,
    likePostDB,
    queryPosts,
    queryPost,
    queryUserPosts,
    unlikePostDB,
    queryComments,
    queryThread,
    submitPostReport,
    queryFeed,
} from "../database/posts";
import {
    CreatePostData,
    DeletePostData,
    GetPostData,
    GetPostsData,
    LikePostData,
    ReportPostData,
    ReportReasons,
} from "../validators/posts";
import { GetPagedData } from "../validators/general";
import fs from "fs/promises";
import { snowflake } from "../database/snowflake";
import { traversalSafeRm, tsEnumToPrismaEnum } from "../utils";
import { processAttachments } from "./utils/posts";
import novu from "../novu";
import { TriggerRecipientsTypeEnum } from "@novu/shared";
import { isAxiosError } from "axios";
import { ReportReason } from "@prisma/client";

export async function getUserPosts(req: Request, res: Response) {
    const data = GetPostsData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const posts = await queryUserPosts(req.session?.user.id, data.data.id, data.data.page);

    return res.status(200).json({ message: "Successfully fetched user posts", posts });
}

export async function getAllPosts(req: Request, res: Response) {
    const data = GetPagedData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const posts = await queryPosts(req.session.user.id, data.data.page);

    return res.status(200).json({ message: "Successfully fetched posts", posts });
}

export async function getPost(req: Request, res: Response) {
    const data = GetPostData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const posts = await queryPost(req.session?.user.id, data.data.id);
    if (posts.length && posts[0].authorId === req.session.user.id) {
        try {
            const r = await novu.topics.get(posts[0].id);
            posts[0].muted = !r.data.data.subscribers.includes(req.session.user.id);
        } catch (e) {
            if (isAxiosError(e)) {
                console.error(e.response?.data);
            } else {
                console.error(e);
            }
        }
    }

    return res.status(200).json({ message: "Successfully fetched post", post: posts[0] });
}

export async function getFeed(req: Request, res: Response) {
    const data = GetPagedData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const posts = await queryFeed(req.session.user.id, data.data.page);

    return res.status(200).json({ message: "Successfully fetched feed", posts });
}

export async function getThread(req: Request, res: Response) {
    const data = GetPostData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const thread = await queryThread(req.session?.user.id, data.data.id);

    return res.status(200).json({ message: "Successfully fetched thread", thread });
}

export async function getComments(req: Request, res: Response) {
    const data = GetPostsData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const comments = await queryComments(req.session?.user.id, data.data.id, data.data.page);

    return res.status(200).json({ message: "Successfully fetched comments", comments });
}

export async function createPost(req: Request, res: Response) {
    const data = CreatePostData.safeParse(req.body);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const id = snowflake.getUniqueID().toString();

    const attachmentFiles = req.files?.attachments ? Array.isArray(req.files.attachments) ? [...req.files.attachments] : [req.files.attachments] : [];

    if (!data.data.content && !attachmentFiles.length) {
        return res.status(400).json({ message: "Cannot submit an empty post" });
    }

    const attachments = await processAttachments(id, attachmentFiles, req.headers.host);

    const [error, post] = await createPostDB(id, req.session.user.id, data.data.content, attachments, data.data.parentId);

    if (error === DatabaseError.UNKNOWN) {
        attachments.forEach(async (attachment) => {
            await fs.rm(attachment.fullPath, { recursive: true, force: true });
            await fs.rm(attachment.thumbnailPath, { recursive: true, force: true });
        });
        return res.status(500).json({ message: "An internal error occurred while creating the post" });
    } else if (error === DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND) {
        attachments.forEach(async (attachment) => {
            await fs.rm(attachment.fullPath, { recursive: true, force: true });
            await fs.rm(attachment.thumbnailPath, { recursive: true, force: true });
        });
        return res.status(404).json({ message: "Cannot comment on a deleted post" });
    }

    if (post?.parent && req.session.user.id !== post.parent.authorId) {
        try {
            await novu.topics.create({
                key: post?.id,
                name: post?.id,
            });
            await novu.topics.addSubscribers(post?.id ?? "", {
                subscribers: [req.session.user.id]
            });
            await novu.trigger("comment", {
                to: [{ type: TriggerRecipientsTypeEnum.TOPIC, topicKey: post?.parentId ?? "" }],
                actor: {
                    subscriberId: req.session.user.id,
                },
                payload: {
                    name: `<b>${req.session.user.username}</b>`,
                    username: req.session.user.username,
                    body: [(post?.content ?? ""), (post?.attachments?.[0]?.url ?? "")].filter(Boolean).join(" "),
                    postId: id,
                },
            });
        } catch (e) {
            if (isAxiosError(e)) {
                console.error(e.response?.data);
            } else {
                console.error(e);
            }
        }
    } else if (!post?.parent) {
        try {
            await novu.topics.create({
                key: post?.id,
                name: post?.id,
            });
            await novu.topics.addSubscribers(post?.id ?? "", {
                subscribers: [req.session.user.id]
            });
        } catch (e) {
            if (isAxiosError(e)) {
                console.error(e.response?.data);
            } else {
                console.error(e);
            }
        }
    }

    return res.status(201).json({ message: "Successfully created post" });
}

export async function deletePost(req: Request, res: Response) {
    const data = DeletePostData.safeParse(req.query);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const error = await deletePostDB(data.data.postId, req.session.user.id);

    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An error occurred while deleting your post" });
    } else if (error === DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND) {
        return res.status(404).json({ message: "Post not found" });
    }

    await traversalSafeRm("posts", data.data.postId);
    
    return res.status(200).json({ message: "Successfully deleted post" });
}

export async function likePost(req: Request, res: Response) {
    const data = LikePostData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const [error, post] = await likePostDB(data.data.postId, req.session.user.id);

    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An internal error occurred" });
    } else if (error === DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND || error === DatabaseError.FOREIGN_KEY_CONSTRAINT_FAILED) {
        return res.status(404).json({ message: "Post not found" });
    }

    if (req.session.user.id !== post?.authorId) {
        await novu.trigger("post-like", {
            to: [{ type: TriggerRecipientsTypeEnum.TOPIC, topicKey: post?.id ?? "" }],
            actor: {
                subscriberId: req.session.user.id,
            },
            payload: {
                name: `<b>${req.session.user.username}</b>`,
                username: req.session.user.username,
                body: [(post?.content ?? ""), (post?.attachments?.[0]?.url ?? "")].filter(Boolean).join(" "),
                postId: data.data.postId,
            }
        });
    }

    return res.sendStatus(200);
}

export async function unlikePost(req: Request, res: Response) {
    const data = LikePostData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const error = await unlikePostDB(data.data.postId, req.session.user.id);

    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An internal error occurred" });
    } else if (error === DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND || error === DatabaseError.FOREIGN_KEY_CONSTRAINT_FAILED) {
        return res.status(404).json({ message: "Post not found" });
    }

    return res.sendStatus(200);
}

export async function mutePost(req: Request, res: Response) {
    const data = LikePostData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    try {
        await novu.topics.removeSubscribers(data.data.postId, {
            subscribers: [req.session.user.id],
        });
    } catch (e) {
        if (isAxiosError(e)) {
            console.error(e.response?.data);
        } else {
            console.error(e);
        }
        return res.status(500).json({ message: "An internal error has occurred" });
    }

    return res.sendStatus(200);
}

export async function unmutePost(req: Request, res: Response) {
    const data = LikePostData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    try {
        await novu.topics.addSubscribers(data.data.postId, {
            subscribers: [req.session.user.id],
        });
    } catch (e) {
        if (isAxiosError(e)) {
            console.error(e.response?.data);
        } else {
            console.error(e);
        }
        return res.status(500).json({ message: "An internal error has occurred" });
    }

    return res.sendStatus(200);
}

export async function reportPost(req: Request, res: Response) {
    const data = ReportPostData.safeParse(req.body);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    if (data.data.reason === ReportReasons.Other && !data.data.comments) {
        return res.status(400).json({ message: "You must provide your reasoning when selecting \"Other\"" });
    }

    const error = await submitPostReport(data.data.postId, req.session.user.id, tsEnumToPrismaEnum(ReportReasons, data.data.reason) as ReportReason, data.data.comments);

    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An internal error occurred while submitting the report" });
    } else if (error === DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND || error === DatabaseError.FOREIGN_KEY_CONSTRAINT_FAILED) {
        return res.status(404).json({ message: "Post not found" });
    } else if (error === DatabaseError.DUPLICATE) {
        return res.status(409).json({ message: "You already submitted a report for this, please wait until your report is reviewed" });
    }

    return res.status(200).json({ message: "Report submitted. It will be reviewed ASAP" });
}
