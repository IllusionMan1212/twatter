import { Request, Response } from "express";

export function getProfileImage(req: Request, res: Response) {
    return res.sendFile(
        `cdn/profile-images/${req.params.userId}/${req.params.fileName}`,
        { root: `${__dirname}/../` },
    );
}

export function getEventImage(req: Request, res: Response) {
    return res.sendFile(
        `cdn/events/${req.params.eventId}/${req.params.fileName}`,
        { root: `${__dirname}/../` },
    );
}

export function getPostImages(req: Request, res: Response) {
    return res.sendFile(
        `cdn/posts/${req.params.postId}/${req.params.fileName}`,
        { root: `${__dirname}/../` },
    );
}

export function getMessageImage(req: Request, res: Response) {
    return res.sendFile(
        `cdn/messages/${req.params.conversationId}/${req.params.fileName}`,
        { root: `${__dirname}/../` },
    );
}
