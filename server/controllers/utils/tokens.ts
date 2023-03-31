import Iron from "@hapi/iron";
import { Response, Request } from "express";
import { parse, serialize } from "cookie";
import { User, UserSettings } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getUserById } from "../../database/users";
import { findSessionByToken, updateTokens } from "../../database/auth";
import { DatabaseError } from "../../database/utils";

const ACCESS_COOKIE = "a_token";
const REFRESH_COOKIE = "r_token";
const ACCESS_MAX_AGE = 3600 * 2; // 2 hours
const REFRESH_MAX_AGE = 3600 * 24 * 7; // 7 days

type SessionUser = User & { settings: UserSettings | null, notificationSubHash: string };
export type Tokens = {
    accessToken: string;
    refreshToken: string;
}

export interface Session {
    user: SessionUser;
    deviceId: string;
}

const setCookie = (token: string, isRefresh: boolean) => {
    const cookie = serialize(isRefresh ? REFRESH_COOKIE : ACCESS_COOKIE, token, {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + (isRefresh ? REFRESH_MAX_AGE : ACCESS_MAX_AGE)),
        maxAge: isRefresh ? REFRESH_MAX_AGE : ACCESS_MAX_AGE,
    });

    return cookie;
};

const parseCookies = (req: Request) => {
    // for API routes we don't need to parse the cookies.
    if (req.cookies) {
        return req.cookies;
    }

    // for pages we do need to parse the cookies.
    const cookie = req.headers.cookie;
    return parse(cookie ?? "");
};

const getCookie = (req: Request, isRefresh: boolean) => {
    const cookies = parseCookies(req);
    return cookies[isRefresh ? REFRESH_COOKIE : ACCESS_COOKIE];
};

export const generateTokens = async (res: Response, user: SessionUser): Promise<Tokens> => {
    const accessToken = jwt.sign({
        userId: user.id,
        username: user.username,
        roles: [user.isAdmin ? "ADMIN" : "USER"]
    }, process.env.JWT_SECRET, {
        expiresIn: "2 hours"
    });

    let refreshToken = jwt.sign({
        userId: user.id,
    }, process.env.JWT_SECRET, {
        expiresIn: "7 days"
    });

    refreshToken = await Iron.seal(refreshToken, process.env.JWT_ENCRYPTION_KEY, Iron.defaults);
    res.setHeader("Set-Cookie", [
        setCookie(accessToken, false),
        setCookie(refreshToken, true)
    ]);

    return { accessToken, refreshToken };
};

const verifyToken = (token: string | undefined): JwtPayload | null => {
    if (!token) {
        return null;
    }

    let payload = null;

    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return null;
    }

    if (typeof payload !== "object") {
        return null;
    }

    return payload;
};

export const attemptTokenRefresh = async (req: Request, res: Response, deviceId: string): Promise<[Tokens, SessionUser] | null> => {
    const refreshToken = getCookie(req, true);

    if (!refreshToken) {
        return null;
    }

    let decrypted = null;

    try {
        decrypted = await Iron.unseal(refreshToken, process.env.JWT_ENCRYPTION_KEY, Iron.defaults);
    } catch (err) {
        return null;
    }

    if (typeof decrypted !== "string") {
        return null;
    }

    const payload = verifyToken(decrypted);

    if (!payload) {
        return null;
    }

    const user = await getUserById(payload.userId);

    if (!user) {
        return null;
    }

    const tokens = await generateTokens(res, user);
    const error = await updateTokens(deviceId, user.id, tokens);

    if (error !== DatabaseError.SUCCESS) {
        return null;
    }

    return [tokens, user];
};

export const getLoginSession = async (req: Request, res: Response): Promise<Session | null> => {
    const token = getCookie(req, false);

    const foundToken = await findSessionByToken(token);

    if (!foundToken) {
        return null;
    }

    const payload = verifyToken(token);

    if (!payload) {
        const ok = await attemptTokenRefresh(req, res, foundToken.deviceId);
        if (!ok) return null;

        const [tokens, user] = ok;

        res.setHeader("Set-Cookie", [
            setCookie(tokens.accessToken, false),
            setCookie(tokens.refreshToken, true)
        ]);

        return {
            user,
            deviceId: foundToken.deviceId
        };
    }

    const user = await getUserById(payload.userId);

    if (!user) {
        return null;
    }

    return {
        user,
        deviceId: foundToken.deviceId
    };
};

export const validateSocketToken = async (cookies: Record<string, string>): Promise<{ userId: string } | null> => {
    const token = cookies[ACCESS_COOKIE];

    const foundToken = await findSessionByToken(token);

    if (!foundToken) {
        return null;
    }

    const payload = verifyToken(token);

    if (!payload) {
        const refreshToken = cookies[REFRESH_COOKIE];

        if (!refreshToken) {
            return null;
        }

        let decrypted = null;

        try {
            decrypted = await Iron.unseal(refreshToken, process.env.JWT_ENCRYPTION_KEY, Iron.defaults);
        } catch (err) {
            return null;
        }

        if (typeof decrypted !== "string") {
            return null;
        }

        const payload = verifyToken(decrypted);

        if (!payload) {
            return null;
        }

        return {
            userId: payload.userId
        };
    }

    return {
        userId: payload.userId
    };
};

export const generate2FAToken = (userId: string): string => {
    const token = jwt.sign({
        userId,
    }, process.env.JWT_SECRET, {
        expiresIn: "4 minutes",
        issuer: "2fa.twatter.auth"
    });

    return token;
};

export const get2FAToken = (authorization: string | undefined): JwtPayload | null => {
    const token = authorization?.split(" ")[1];

    const payload = verifyToken(token);

    if (!payload || payload.iss !== "2fa.twatter.auth") {
        return null;
    }

    return payload;
};

export const logout = (res: Response) => {
    const accessCookie = serialize(ACCESS_COOKIE, "", {
        maxAge: -1,
        path: "/"
    });
    const refreshToken = serialize(REFRESH_COOKIE, "", {
        maxAge: -1,
        path: "/"
    });

    res.setHeader("Set-Cookie", [accessCookie, refreshToken]);
};

