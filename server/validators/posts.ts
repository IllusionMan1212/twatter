import { POST_MAX_CHARS } from "../../src/utils/constants";
import z from "zod";
import { GetPagedData } from "./general";

export const GetPostsData = GetPagedData.extend({
    id: z.string().min(1, "ID cannot be empty"),
});

export const GetPostData = z.object({
    id: z.string().min(1, "ID cannot be empty"),
});


export const CreatePostData = z.object({
    parentId: z.string().optional(),
    content: z.preprocess((a) => {
        return (a as string).replaceAll("\r", "").replaceAll(/\n{2,}/g, "\n\n");
    }, z.string().trim().max(POST_MAX_CHARS, `Post exceeds maximum ${POST_MAX_CHARS} character length`).optional()),
});

export const DeletePostData = z.object({
    postId: z.string().min(1, "Post ID cannot be empty"),
});

export const LikePostData = z.object({
    postId: z.string().min(1, "Post ID cannot be empty"),
});
