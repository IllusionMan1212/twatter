import { Request, Response } from "express";
import { AddEventData, ToggleInterestData } from "../validators/events";
import { addEventDB, queryEvents, querySidebarEvents, toggleInterestDB } from "../database/events";
import { DatabaseError } from "../database/utils";
import { GetDataById, GetPagedData } from "../validators/general";
import { UploadedFile } from "express-fileupload";
import fs from "fs/promises";
import { snowflake } from "../database/snowflake";
import sharp from "sharp";

export async function getEvents(req: Request, res: Response) {
    const data = GetPagedData.safeParse(req.query);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const events = await queryEvents(data.data.page, req.session.user.id);

    return res.status(200).json({ message: "Successfully fetched events", events });
}

export async function getSidebarEvents(req: Request, res: Response) {
    const events = await querySidebarEvents(req.session.user.id);

    return res.status(200).json({ message: "Successfully, fetched events", events });
}

export async function addEvent(req: Request, res: Response) {
    const data = AddEventData.safeParse(req.body);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    let imageURL: string | undefined = undefined;
    let imagePath: string | undefined = undefined;

    const id = snowflake.getUniqueID();

    if (req.files?.image) {
        const file = <UploadedFile>req.files.image;

        const sh = sharp(file.data);
        const { orientation } = await sh.metadata();
        const fileData = await sharp(await sh.toBuffer()).toFormat("jpeg").withMetadata({ orientation }).toBuffer();

        const fileName = "event";
        const dir = `${__dirname}/../cdn/events/${id}`;

        const ext = "jpeg";
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(`${dir}/${fileName}.${ext}`, fileData);

        imageURL = `http://${req.headers.host}/cdn/events/${id}/${fileName}.${ext}`;
        imagePath = `${dir}/${fileName}.${ext}`;
    }

    const error = await addEventDB(id.toString(), data.data.title, data.data.description, data.data.location, data.data.time, imageURL);

    if (error === DatabaseError.UNKNOWN) {
        if (imagePath) {
            await fs.rm(imagePath);
        }
        return res.status(500).json({ message: "An internal error has occurred" });
    }

    return res.status(201).json({ message: "Event added" });
}

export async function toggleInterest(req: Request, res: Response) {
    const data = GetDataById.safeParse(req.params);
    const body = ToggleInterestData.safeParse(req.body);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    if (!body.success) {
        return res.status(400).json({ message: body.error.errors[0].message });
    }

    const error = await toggleInterestDB(data.data.id, req.session.user.id, body.data.interest);

    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An internal error has occurred" });
    } else if (error === DatabaseError.EXPIRED) {
        return res.status(401).json({ message: "Cannot change interest on an expired event" });
    }

    return res.status(200).json({ message: "Successfully toggled interest in event" });
}
