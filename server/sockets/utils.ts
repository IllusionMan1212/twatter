import sharp, { AvailableFormatInfo, FormatEnum } from "sharp";
import { Attachment } from "../controllers/utils/posts";
import fs from "fs/promises";
import crypto from "crypto";
import { Magic, rgbToHex } from "../utils";

export interface MessageAttachment extends Attachment {
    height: number;
    width: number;
}

export async function processAttachment(attachment: Buffer, conversationId: string, host: string | undefined): Promise<MessageAttachment> {
    const sh = sharp(attachment, { animated: true });

    const { r, g, b } = (await sh.stats()).dominant;
    const dominantColor = rgbToHex(r, g, b);

    const metadata = await sh.metadata();
    const { orientation } = metadata;
    let { height, width } = metadata;

    let format: keyof FormatEnum | AvailableFormatInfo = "jpeg";
    let ratio = 1;

    if (attachment.compare(Buffer.from(Magic.PNG), 0, Magic.PNG.length, 0, Magic.PNG.length) === 0) {
        format = "png";
    }

    if (attachment.compare(Buffer.from(Magic.GIF87a), 0, Magic.GIF87a.length, 0, Magic.GIF87a.length) === 0 ||
        attachment.compare(Buffer.from(Magic.GIF89a), 0, Magic.GIF89a.length, 0, Magic.GIF89a.length) === 0) {
        format = "gif";
    }

    const fullSized = await sharp(await sh.toBuffer(), { animated: true }).toFormat(format).withMetadata({ orientation }).toBuffer();
    let thumbnail = fullSized;

    if (height && width) {
        ratio = width / height;
        if (height > 400) {
            height = 400;
            thumbnail = await sharp(fullSized, { animated: true }).toFormat(format).withMetadata({ orientation }).resize({ height: 400 }).toBuffer();
        }
        width = height * ratio;
    }

    const bytes = crypto.randomBytes(12).toString("hex");
    const fileName = `${bytes}-${Date.now()}`;
    const dir = `${__dirname}/../cdn/messages/${conversationId}`;

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(`${dir}/${fileName}-full.${format}`, fullSized);
    await fs.writeFile(`${dir}/${fileName}-thumb.${format}`, thumbnail);

    console.log(height);
    console.log(width);

    return {
        fullUrl: `${process.env.NODE_ENV !== "production" ? "http" : "https"}://${host}/cdn/messages/${conversationId}/${fileName}-full.${format}`,
        thumbnailUrl: `${process.env.NODE_ENV !== "production" ? "http" : "https"}://${host}/cdn/messages/${conversationId}/${fileName}-thumb.${format}`,
        fullPath: `${dir}/${fileName}-full.${format}`,
        thumbnailPath: `${dir}/${fileName}-thumb.${format}`,
        color: dominantColor,
        height: height ?? 400,
        width: Math.round(width ?? (ratio * 400)),
    };
}
