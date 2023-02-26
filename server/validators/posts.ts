import { POST_MAX_CHARS } from "../../src/utils/constants";
import z from "zod";
import { GetPagedData } from "./general";
import { htmlEscape, extractMentions, extractUrlsWithIndices, extractHashtags } from "twitter-text";

export const GetPostsData = GetPagedData.extend({
    id: z.string().min(1, "ID cannot be empty"),
});

export const GetPostData = z.object({
    id: z.string().min(1, "ID cannot be empty"),
});

export const linkAllTransformer = (schema: z.ZodSchema) => {
    return schema.transform((content) => {
        const escaped = htmlEscape(content);
        let linkedContent = linkUsernames(escaped);
        linkedContent = linkHashtags(linkedContent);
        linkedContent = linkUrls(linkedContent);

        return linkedContent;
    });
};

function linkHashtags(val: string): string {
    const hashtags = extractHashtags(val);

    let searchIdx = 0;
    outer:for (let i = 0; i < hashtags.length; i++) {
        const urls = extractUrlsWithIndices(val, { extractUrlsWithoutProtocol: true });
        const idxOfHashtag = val.indexOf(hashtags[i], searchIdx);
        for (let j = 0; j < urls.length; j++) {
            if ((idxOfHashtag - hashtags[i].length) >= urls[j].indices[0] && idxOfHashtag <= urls[j].indices[1]) { // if the hashtag is within a url
                continue outer;
            }
        }
        searchIdx = idxOfHashtag - 1;
        const anchorTag = `<a href="/search?q=#${hashtags[i]}" class="link">#${hashtags[i]}</a>`;
        val = replaceAfter(val, `#${hashtags[i]}`, anchorTag, searchIdx);
        searchIdx += anchorTag.length;
    }

    return val;
}

function linkUsernames(val: string): string {
    const usernames = extractMentions(val);

    let searchIdx = 0;
    outer:for (let i = 0; i < usernames.length; i++) {
        const urls = extractUrlsWithIndices(val, { extractUrlsWithoutProtocol: true });
        const idxOfMention = val.indexOf(usernames[i], searchIdx);
        for (let j = 0; j < urls.length; j++) {
            if ((idxOfMention - usernames[i].length) >= urls[j].indices[0] && idxOfMention <= urls[j].indices[1]) { // if the mention is within a url
                continue outer;
            }
        }
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
    const urls = extractUrlsWithIndices(val, { extractUrlsWithoutProtocol: true });

    let searchIdx = 0;
    for (let i = 0; i < urls.length; i++) {
        const idxOfUrl = val.indexOf(urls[i].url, searchIdx);
        searchIdx = idxOfUrl;
        const anchorTag = `<a href="${urls[i].url.startsWith("http") ? urls[i].url : `https://${urls[i].url}`}" class="link" target="_blank">${urls[i].url}</a>`;
        val = replaceAfter(val, urls[i].url, anchorTag, searchIdx);
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
        linkAllTransformer(z.optional(
            z
                .string()
                .trim()
                .max(
                    POST_MAX_CHARS,
                    `Post exceeds maximum ${POST_MAX_CHARS} character length`,
                )
        )),
    ),
});

export const DeletePostData = z.object({
    postId: z.string().min(1, "Post ID cannot be empty"),
});

export const LikePostData = z.object({
    postId: z.string().min(1, "Post ID cannot be empty"),
});
