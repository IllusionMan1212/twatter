import { POST_MAX_CHARS } from "../../src/utils/constants";
import z from "zod";
import { GetPagedData } from "./general";
import { htmlEscape, extractMentions, extractUrlsWithIndices, extractHashtags } from "twitter-text";
import metascraper, { Metadata } from "metascraper";
import metascraperUrl from "metascraper-url";
import metascraperTitle from "metascraper-title";
import metascraperImage from "metascraper-image";
import metascraperDescription from "metascraper-description";
import metascraperYoutube from "metascraper-youtube";
import metascraperSpotify from "metascraper-spotify";

export enum ReportReasons {
    NudityOrSex = "nudity-sex",
    TerrorismOrViolence = "terrorism-violence",
    Spam = "spam",
    Other = "other",
}

export const ReportReason = z.nativeEnum(ReportReasons, {
    required_error: "Reason is required",
});

export const GetPostsData = GetPagedData.extend({
    id: z.string({ required_error: "id is required" }).min(1, "ID cannot be empty"),
});

export const GetPostData = z.object({
    id: z.string({ required_error: "id is required" }).min(1, "ID cannot be empty"),
});

export const linkAllTransformer = (schema: z.ZodSchema) => {
    return schema.transform(async (content) => {
        const escaped = htmlEscape(content);
        let linkedContent = linkUsernames(escaped);
        linkedContent = linkHashtags(linkedContent);
        const { val, og } = await linkUrls(linkedContent);
        linkedContent = val;

        return { val: linkedContent, og };
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

async function scrapeOG(url: string): Promise<Metadata> {
    const response = await fetch(url);
    const html = await response.text();
    return await metascraper([
        metascraperUrl(),
        metascraperTitle(),
        metascraperImage(),
        metascraperDescription(),
        metascraperYoutube(),
        metascraperSpotify(),
    ])({ html, url });
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

export async function linkUrls(val: string): Promise<{ val: string, og: Metadata[] }> {
    const urls = extractUrlsWithIndices(val, { extractUrlsWithoutProtocol: true });
    const og = [];

    let searchIdx = 0;
    for (let i = 0; i < urls.length; i++) {
        og.push(await scrapeOG(urls[i].url));
        const idxOfUrl = val.indexOf(urls[i].url, searchIdx);
        searchIdx = idxOfUrl;
        const anchorTag = `<a href="${urls[i].url.startsWith("http") ? urls[i].url : `https://${urls[i].url}`}" class="link" target="_blank">${urls[i].url}</a>`;
        val = replaceAfter(val, urls[i].url, anchorTag, searchIdx);
        searchIdx += anchorTag.length;
    }

    console.log(og);

    return {
        val,
        og
    };
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
    postId: z.string({ required_error: "postId is required" }).min(1, "Post ID cannot be empty"),
});

export const LikePostData = z.object({
    postId: z.string({ required_error: "postId is required" }).min(1, "Post ID cannot be empty"),
});

export const ReportPostData = z.object({
    postId: z.string({ required_error: "Post ID cannot be empty" }).min(1, "Post ID cannot be empty"),
    reason: ReportReason,
    comments: z.string().optional()
});
