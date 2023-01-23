import { POST_MAX_CHARS } from "../../src/utils/constants";
import z from "zod";
import { GetPagedData } from "./general";
import { autoLinkHashtags, htmlEscape, extractUrls, extractMentions } from "twitter-text";

export const GetPostsData = GetPagedData.extend({
    id: z.string().min(1, "ID cannot be empty"),
});

export const GetPostData = z.object({
    id: z.string().min(1, "ID cannot be empty"),
});


function linkUsernames(val: string): string {
    const usernames = extractMentions(val);

    let searchIdx = 0;
    for (let i = 0; i < usernames.length; i++) {
        const idxOfMention = val.indexOf(usernames[i], searchIdx);
        searchIdx = idxOfMention - 1;
        const anchorTag = `<a href="/@${usernames[i]}" class="usernameLink">@${usernames[i]}</a>`;
        val = replaceAfter(val, `@${usernames[i]}`, anchorTag, searchIdx);
        searchIdx += anchorTag.length;
    }

    return val;
}

function replaceAfter(str: string, searchVal: string, replacement: string, from: number) {
    return str.slice(0, from) + str.slice(from).replace(searchVal, replacement);
}

export function linkUrls(val: string): string {
    const urls = extractUrls(val);

    let searchIdx = 0;
    for (let i = 0; i < urls.length; i++) {
        const idxOfUrl = val.indexOf(urls[i], searchIdx);
        searchIdx = idxOfUrl;
        const anchorTag = `<a href="${urls[i].startsWith("http") ? urls[i] : `https://${urls[i]}`}" class="link" target="_blank">${urls[i]}</a>`;
        val = replaceAfter(val, urls[i], anchorTag, searchIdx);
        searchIdx += anchorTag.length;
    }

    return val;
}

export const CreatePostData = z.object({
    parentId: z.string().optional(),
    content: z.preprocess(
        (content) => {
            return (content as string).replaceAll("\r", "").replaceAll(/\n{2,}/g, "\n\n");
        },
        z.optional(
            z
                .string()
                .trim()
                .max(
                    POST_MAX_CHARS,
                    `Post exceeds maximum ${POST_MAX_CHARS} character length`,
                )
                .transform((val) => {
                    let linkedContent = autoLinkHashtags(htmlEscape(val), {
                        hashtagClass: "link",
                        hashtagUrlBase: "/search?q=#",
                    });

                    linkedContent = linkUsernames(linkedContent);
                    linkedContent = linkUrls(linkedContent);

                    return linkedContent;
                }),
        ),
    ),
});

export const DeletePostData = z.object({
    postId: z.string().min(1, "Post ID cannot be empty"),
});

export const LikePostData = z.object({
    postId: z.string().min(1, "Post ID cannot be empty"),
});
