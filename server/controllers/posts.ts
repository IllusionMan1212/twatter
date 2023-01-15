import { Request, Response } from "express";
import { DatabaseError } from "../database/utils";
import { createPostDB, deletePostDB, likePostDB, queryPosts, queryPost, queryUserPosts, unlikePostDB, queryComments } from "../database/posts";
import { CreatePostData, DeletePostData, GetPostData, GetPostsData, LikePostData } from "../validators/posts";
import { GetPagedData } from "../validators/general";
import fs from "fs/promises";
import { snowflake } from "../database/snowflake";
import { traversalSafeRm } from "../utils";
import sharp from "sharp";

export async function getUserPosts(req: Request, res: Response) {
    const data = GetPostsData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const posts = await queryUserPosts(req.session?.user.id, data.data.id, data.data.page);

    return res.status(200).json({ message: "Successfully fetched user posts", posts });
}

export async function getPosts(req: Request, res: Response) {
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

    return res.status(200).json({ message: "Successfully fetched post", post: posts[0] });
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

    const attachmentsURLs = <string[]>[];
    const attachmentsPaths = <string[]>[];

    const id = snowflake.getUniqueID();
    let counter = 1;

    const attachments = req.files?.attachments ? Array.isArray(req.files.attachments) ? [...req.files.attachments] : [req.files.attachments] : [];

    if (!data.data.content && !attachments.length) {
        return res.status(400).json({ message: "Cannot submit an empty post" });
    }

    for (const attachment of attachments) {
        const sh = sharp(attachment.data);
        const { orientation } = await sh.metadata();
        const fileData = await sharp(await sh.toBuffer()).toFormat("jpeg").withMetadata({ orientation }).toBuffer();

        const fileName = counter;
        const dir = `${__dirname}/../cdn/posts/${id}`;

        const ext = "jpeg";
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(`${dir}/${fileName}.${ext}`, fileData);

        attachmentsURLs.push(`http://${req.headers.host}/cdn/posts/${id}/${fileName}.${ext}`);
        attachmentsPaths.push(`${dir}/${fileName}.${ext}`);
        counter++;
    }

    const error = await createPostDB(id.toString(), req.session.user.id, data.data.content, attachmentsURLs, data.data.parentId);

    if (error === DatabaseError.UNKNOWN) {
        attachmentsPaths.forEach(async (path) => {
            await fs.rm(path, { recursive: true, force: true });
        });
        return res.status(500).json({ message: "An internal error occurred while creating the post" });
    } else if (error === DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND) {
        attachmentsPaths.forEach(async (path) => {
            await fs.rm(path, { recursive: true, force: true });
        });
        return res.status(404).json({ message: "Cannot comment on a deleted post" });
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

    const error = await likePostDB(data.data.postId, req.session.user.id);

    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An internal error occurred" });
    } else if (error === DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND || error === DatabaseError.FOREIGN_KEY_CONSTRAINT_FAILED) {
        return res.status(404).json({ message: "Post not found" });
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
