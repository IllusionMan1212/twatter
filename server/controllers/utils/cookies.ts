import Iron from "@hapi/iron";
import { Response, Request } from "express";
import { parse, serialize } from "cookie";
import { User, UserSettings } from "@prisma/client";
import { ExcludedUserProps } from "./users";

const TOKEN_NAME = "session";
const TWOFA_TOKEN_NAME = "2fa_session";
const MAX_AGE = 60 * 60 * 24 * 90; // 3 months
const TWOFA_MAX_AGE = 60 * 5; // 5 minutes

type SessionUser = Omit<User & { settings: UserSettings | null, notificationSubHash: string }, ExcludedUserProps>;

export interface Session {
    createdAt: number;
    maxAge: number;
    user: SessionUser;
}

export interface TwoFASession {
    createdAt: number;
    maxAge: number;
    userId: string;
}

const setTokenCookie = (res: Response, token: string, twoFA: boolean) => {
    const cookie = serialize(twoFA ? TWOFA_TOKEN_NAME : TOKEN_NAME, token, {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + (twoFA ? TWOFA_MAX_AGE : MAX_AGE * 1000)),
        maxAge: twoFA ? TWOFA_MAX_AGE : MAX_AGE,
    });

    res.setHeader("Set-Cookie", cookie);
};

export const removeTokenCookie = (res: Response) => {
    const cookie = serialize(TOKEN_NAME, "", {
        maxAge: -1,
        path: "/",
    });

    res.setHeader("Set-Cookie", cookie);
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

const getTokenCookie = (req: Request, twoFASession: boolean) => {
    const cookies = parseCookies(req);
    return cookies[twoFASession ? TWOFA_TOKEN_NAME : TOKEN_NAME];
};

export const setLoginSession = async (res: Response, user: SessionUser, twoFA = false): Promise<string> => {
    const createdAt = Date.now();

    let obj: Session | TwoFASession;
    // create a session object with a max age that we can validate later
    if (twoFA) {
        obj = {
            userId: user.id,
            createdAt,
            maxAge: MAX_AGE,
        };
    } else {
        obj = {
            user,
            createdAt,
            maxAge: MAX_AGE,
        };
    }

    if (!process.env.TOKEN_SECRET) {
        throw new Error("Encryption key not set in env");
    }

    const token = await Iron.seal(obj, process.env.TOKEN_SECRET, Iron.defaults);

    setTokenCookie(res, token, twoFA);
    return token;
};

export const getLoginSession = async (req: Request): Promise<Session | null> => {
    const token = getTokenCookie(req, false);

    if (!token) return null;

    if (!process.env.TOKEN_SECRET) {
        throw new Error("Encryption key not set in env");
    }

    let session: Session | null = null;

    try {
        session = await Iron.unseal(
            token,
            process.env.TOKEN_SECRET,
            Iron.defaults
        );
    } catch (e) {
        return null;
    }

    const expiresAt = (session?.createdAt ?? 0) + ((session?.maxAge ?? 0) * 1000);

    // validate the expiration date of the session
    if (Date.now() > expiresAt) {
        return null;
    }

    return session;
};

export const get2FASession = async (req: Request): Promise <TwoFASession | null> => {
    const token = getTokenCookie(req, true);

    if (!token) return null;

    if (!process.env.TOKEN_SECRET) {
        throw new Error("Encryption key not set in env");
    }

    let session: TwoFASession | null = null;

    try {
        session = await Iron.unseal(
            token,
            process.env.TOKEN_SECRET,
            Iron.defaults
        );
    } catch (e) {
        return null;
    }

    const expiresAt = (session?.createdAt ?? 0) + ((session?.maxAge ?? 0) * 1000);

    // validate the expiration date of the session
    if (Date.now() > expiresAt) {
        return null;
    }

    return session;
};

// Used to authenticate users' sockets, because socket.io has no concept of requests
export const validateSession = async (token: string): Promise<Session | null> => {
    if (!token) {
        return null;
    }

    const session: Session = await Iron.unseal(
        token,
        process.env.TOKEN_SECRET ?? "",
        Iron.defaults
    );
    const expiresAt = (session?.createdAt ?? 0) + ((session?.maxAge ?? 0) * 1000);

    // Validate the expiration date of the session
    if (Date.now() > expiresAt) {
        return null;
    }

    return session;
};
