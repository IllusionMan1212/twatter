import { Request, Response, NextFunction } from "express";
import { isMemberOfConvo } from "../../database/message";
import { ConversationData } from "../../validators/message";
import { getUserById } from "../../database/users";
import * as Cookies from "../../controllers/utils/cookies";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import { exclude } from "../../database/utils";
import { excludedUserProps } from "../../controllers/utils/users";

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

    const u = exclude(user, ...(excludedUserProps.filter(p => p !== "email")));

    if (u.restricted) {
        Cookies.removeTokenCookie(res);
        return res.status(403).json({ message: "Restricted account" });
    }

    session.user = u;
    req.session = session;

    next();
};

export const sessionContext = async (req: Request, res: Response, next: NextFunction) => {
    const session = await Cookies.getLoginSession(req);

    if (!session) {
        next();
        return;
    }

    const user = await getUserById(session.user.id);

    if (!user) {
        return res.status(401).json({ message: "Authentication token is invalid, please log in" });
    }

    const u = exclude(user, ...(excludedUserProps.filter(p => p !== "email")));

    if (u.restricted) {
        Cookies.removeTokenCookie(res);
        return res.status(403).json({ message: "Restricted account" });
    }

    session.user = u;
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

export const limiter = (rateLimit: RateLimiterMemory) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // key is path + ip to have different limits on different routes for different ips
            const r = await rateLimit.consume(`${req.path}|${req.ip}`);

            res.setHeader("Retry-After", r.msBeforeNext / 1000);
            res.setHeader("RateLimit-Limit", rateLimit.points);
            res.setHeader("RateLimit-Remaining", r.remainingPoints);
            res.setHeader("RateLimit-Reset", new Date(Date.now() + r.msBeforeNext).toString());
            res.setHeader("X-RateLimit-Limit", rateLimit.points);
            res.setHeader("X-RateLimit-Remaining", r.remainingPoints);
            res.setHeader("X-RateLimit-Reset", new Date(Date.now() + r.msBeforeNext).toString());

            next();
        } catch (e) {
            const r = e as RateLimiterRes;
            res.setHeader("Retry-After", r.msBeforeNext / 1000);
            res.setHeader("RateLimit-Limit", rateLimit.points);
            res.setHeader("RateLimit-Remaining", r.remainingPoints);
            res.setHeader("RateLimit-Reset", new Date(Date.now() + r.msBeforeNext).toString());
            res.setHeader("X-RateLimit-Limit", rateLimit.points);
            res.setHeader("X-RateLimit-Remaining", r.remainingPoints);
            res.setHeader("X-RateLimit-Reset", new Date(Date.now() + r.msBeforeNext).toString());

            return res.status(429).json({ message: "Too many requests" });
        }
    };
};
