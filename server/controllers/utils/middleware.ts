import { Request, Response, NextFunction } from "express";
import { isMemberOfConvo } from "../../database/message";
import { ConversationData } from "../../validators/message";
import { getUserById } from "../../database/users";
import * as Cookies from "./cookies";

export const adminGuard = async (req: Request, res: Response, next: NextFunction) => {
    const session = await Cookies.getLoginSession(req);

    if (!session) {
        return res.status(401).json({ message: "Authentication token is invalid, please log in" });
    }

    const user = await getUserById(session.user.id);

    if (!user) {
        return res.status(401).json({ message: "Authentication token is invalid, please log in" });
    }

    if (!user.isAdmin) {
        return res.status(401).json({ message: req.method === "GET" ? "You're not authorized to access this resource": "You're not authorized to perform this action" });
    }

    session.user = user;
    req.session = session;

    next();
};

export const sessionGuard = async (req: Request, res: Response, next: NextFunction) => {
    const session = await Cookies.getLoginSession(req);

    if (!session) {
        return res.status(401).json({ message: "Authentication token is invalid, please log in" });
    }

    const user = await getUserById(session.user.id);

    if (!user) {
        return res.status(401).json({ message: "Authentication token is invalid, please log in" });
    }

    if (user.restricted) {
        Cookies.removeTokenCookie(res);
        return res.status(403).json({ message: "Restricted account" });
    }

    session.user = user;
    req.session = session;

    next();
};

export const messagingGuard = async (req: Request, res: Response, next: NextFunction) => {
    const data = ConversationData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const isMember = await isMemberOfConvo(data.data.conversationId, req.session.user.id);

    if (!isMember) {
        return res.status(401).json({ message: "Unauthorized to perform this action" });
    }

    next();
};
