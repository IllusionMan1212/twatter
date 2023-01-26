import { UploadedFile } from "express-fileupload";
import fs from "fs/promises";
import { Magic, rgbToHex } from "../../utils";
import sharp, { AvailableFormatInfo, FormatEnum } from "sharp";

export interface Attachment {
    fullUrl: string;
    thumbnailUrl: string;
    fullPath: string;
    thumbnailPath: string;
    color: string;
}

export async function processAttachments(id: string, attachments: UploadedFile[], host: string | undefined): Promise<Attachment[]> {
    const attachs = <Attachment[]>[];
    let counter = 1;

    for (const attachment of attachments) {
        const sh = sharp(attachment.data);

        const { r, g, b } = (await sh.stats()).dominant;
        const dominantColor = rgbToHex(r, g, b);

        const { height, width, orientation } = await sh.metadata();

        let format: keyof FormatEnum | AvailableFormatInfo = "jpeg";

        if (attachment.data.compare(Buffer.from(Magic.PNG), 0, Magic.PNG.length, 0, Magic.PNG.length) === 0) {
            format = "png";
        }

        const fullSized = await sharp(await sh.toBuffer()).toFormat(format).withMetadata({ orientation }).toBuffer();
        let thumbnail = fullSized;

        if (height && width) {
            if (height > width) {
                if (height > 400) {
                    thumbnail = await sharp(fullSized).toFormat(format).withMetadata({ orientation }).resize({ height: 400 }).toBuffer();
                }
            } else {
                if (width > 400) {
                    thumbnail = await sharp(fullSized).toFormat(format).withMetadata({ orientation }).resize({ height: 400 }).toBuffer();
                }
            }
        }

        const fileName = counter;
        const dir = `${__dirname}/../../cdn/posts/${id}`;

        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(`${dir}/${fileName}-full.${format}`, fullSized);
        await fs.writeFile(`${dir}/${fileName}-thumb.${format}`, thumbnail);

        attachs.push({
            fullUrl: `${process.env.NODE_ENV !== "production" ? "http" : "https"}://${host}/cdn/posts/${id}/${fileName}-full.${format}`,
            thumbnailUrl: `${process.env.NODE_ENV !== "production" ? "http" : "https"}://${host}/cdn/posts/${id}/${fileName}-thumb.${format}`,
            fullPath: `${dir}/${fileName}-full.${format}`,
            thumbnailPath: `${dir}/${fileName}-thumb.${format}`,
            color: dominantColor,
        });
        counter++;
    }

    return attachs;
}
