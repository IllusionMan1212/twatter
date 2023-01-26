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
    const sh = sharp(attachment);

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

    const fullSized = await sharp(await sh.toBuffer()).toFormat(format).withMetadata({ orientation }).toBuffer();
    let thumbnail = fullSized;

    if (height && width) {
        if (height > width) {
            ratio = height / width;
            if (height > 400) {
                thumbnail = await sharp(fullSized).toFormat(format).withMetadata({ orientation }).resize({ height: 400 }).toBuffer();
            }
        } else {
            ratio = width / height;
            if (width > 400) {
                thumbnail = await sharp(fullSized).toFormat(format).withMetadata({ orientation }).resize({ height: 400 }).toBuffer();
            }
        }

        if (height > 400) {
            height = 400;
            width = ratio * 400;
        }
    }

    const bytes = crypto.randomBytes(12).toString("hex");
    const fileName = `${bytes}-${Date.now()}`;
    const dir = `${__dirname}/../cdn/messages/${conversationId}`;

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(`${dir}/${fileName}-full.${format}`, fullSized);
    await fs.writeFile(`${dir}/${fileName}-thumb.${format}`, thumbnail);

    return {
        fullUrl: `${process.env.NODE_ENV !== "production" ? "http" : "https"}://${host}/cdn/messages/${conversationId}/${fileName}-full.${format}`,
        thumbnailUrl: `${process.env.NODE_ENV !== "production" ? "http" : "https"}://${host}/cdn/messages/${conversationId}/${fileName}-thumb.${format}`,
        fullPath: `${dir}/${fileName}-full.${format}`,
        thumbnailPath: `${dir}/${fileName}-thumb.${format}`,
        color: dominantColor,
        height: height ?? 400,
        width: Math.round(width ?? ratio * 400),
    };
}
