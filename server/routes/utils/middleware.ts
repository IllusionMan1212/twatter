import { Request, Response, NextFunction } from "express";
import { isMemberOfConvo } from "../../database/message";
import { ConversationData } from "../../validators/message";
import * as Tokens from "../../controllers/utils/tokens";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import crypto from "crypto";

export const adminGuard = async (req: Request, res: Response, next: NextFunction) => {
    const session = await Tokens.getLoginSession(req, res);

    if (!session) {
        return res.status(401).json({ message: "Authentication token is invalid, please log in" });
    }

    const user = session.user;

    if (!user.isAdmin) {
        return res.status(403).json({ message: req.method === "GET" ? "You're not authorized to access this resource": "You're not authorized to perform this action" });
    }

    const hmacHash = crypto.createHmac("sha256", process.env.NOVU_APIKEY ?? "").update(user.id).digest("hex");
    user.notificationSubHash = hmacHash;

    session.user = user;
    req.session = session;

    next();
};

export const sessionGuard = async (req: Request, res: Response, next: NextFunction) => {
    const session = await Tokens.getLoginSession(req, res);

    if (!session) {
        return res.status(401).json({ message: "Authentication token is invalid, please log in" });
    }

    const user = session.user;

    if (user.restricted) {
        return res.status(403).json({ message: "Restricted account" });
    }

    const hmacHash = crypto.createHmac("sha256", process.env.NOVU_APIKEY ?? "").update(user.id).digest("hex");
    user.notificationSubHash = hmacHash;

    req.session = session;

    next();
};

export const sessionContext = async (req: Request, res: Response, next: NextFunction) => {
    const session = await Tokens.getLoginSession(req, res);

    if (!session) {
        next();
        return;
    }

    const user = session.user;

    if (user.restricted) {
        return res.status(403).json({ message: "Restricted account" });
    }

    const hmacHash = crypto.createHmac("sha256", process.env.NOVU_APIKEY ?? "").update(user.id).digest("hex");
    user.notificationSubHash = hmacHash;

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
        return res.status(403).json({ message: "Unauthorized to perform this action" });
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

const loggedInRoutes = [
    "/home",
    "/notifications",
    "/messages",
    "/settings",
    "/dashboard",
    "/events",
    "/search",
    "/dashboard",
];

const loggedOutRoutes = [
    "/",
    "/login",
    "/register",
    "/reset-password",
    "/forgot-password",
];

export const authGuard = async (req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith("/cdn") || req.originalUrl.startsWith("/default") || req.originalUrl.startsWith("/_next")) {
        return next();
    }

    const session = await Tokens.getLoginSession(req, res);

    const user = session?.user;

    if (user && loggedOutRoutes.find(r => r === "/" ? r === req.originalUrl : req.originalUrl.startsWith(r))) {
        return res.redirect(307, "/home");
    } else if ((!user || user?.restricted) && loggedInRoutes.find(r => req.originalUrl.startsWith(r))) {
        return res.redirect(307, "/login");
    } else if ((user && !user.isAdmin) && req.originalUrl.startsWith("/dashboard")) {
        return res.redirect(307, "/404");
    }

    next();
};
