import { Request, Response } from "express";
import { createUser, getUserByEmailOrUsername, getUserByResetToken, setUserResetToken, updateUserPassword, querySessions, deleteSession, deleteSessions } from "../database/auth";
import { ForgotPasswordData, LoginUserData, RegisterUserData, ResetPasswordData, RevokeSessionData, VerifyResetPasswordTokenData } from "../validators/auth";
import * as Tokens from "./utils/tokens";
import bcrypt from "bcrypt";
import { DatabaseError, exclude } from "../database/utils";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { doLogin, excludedUserProps } from "./utils/auth";
import { prepareResetPasswordEmailHTML, prepareResetPasswordEmailText } from "../email";
import Mail from "nodemailer/lib/mailer";
import novu from "../novu";
import UAParser from "ua-parser-js";

export async function register(req: Request, res: Response) {
    const user = RegisterUserData.safeParse(req.body);

    if (!user.success) {
        return res.status(400).json({
            message: user.error.errors[0].message,
        });
    }

    if (user.data.password !== user.data.passwordConfirm) {
        return res.status(400).json({
            message: "Passwords don't match",
        });
    }

    const hash = await bcrypt.hash(user.data.password, 10);

    const userData = {
        ...user.data,
        password: hash,
    };
    const [error, field, userId] = await createUser(userData.username, userData.email, userData.password);

    if (error === DatabaseError.DUPLICATE) {
        return res.status(400).json({ message: `An account with that ${field} already exists` });
    } else if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An internal error has occurred" });
    }

    await novu.subscribers.identify(userId!, {
        email: user.data.email,
        avatar: `${process.env.NODE_ENV !== "production" ? "http" : "https"}://${req.headers.host}/default_profile.svg`
    });

    return res.status(201).json({
        message: "Account created successfully.",
    });
}

export async function login(req: Request, res: Response) {
    const data = LoginUserData.safeParse(req.body);

    if (!data.success) {
        return res.status(400).json({
            message: data.error.errors[0].message,
        });
    }

    const user = await getUserByEmailOrUsername(data.data.username);

    if (!user || !(await bcrypt.compare(data.data.password, user.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.restricted) {
        return res.status(423).json({ message: "Your account is restricted" });
    }

    if (user.twoFactorAuth) {
        const token = Tokens.generate2FAToken(user.id);
        return res.status(200).json({ message: "Please input your 2FA passcode", requiresTwoFactorAuth: true, twoFactorToken: token });
    }

    const hmacHash = crypto.createHmac("sha256", process.env.NOVU_APIKEY ?? "").update(user.id).digest("hex");
    user.notificationSubHash = hmacHash;

    return await doLogin(req, res, user);
}

export async function logout(req: Request, res: Response) {
    Tokens.logout(res);
    await deleteSession(req.session.deviceId, req.session.user.id);
    return res.status(200).json({ message: "Successfully logged out" });
}

export async function forgotPassword(req: Request, res: Response) {
    const data = ForgotPasswordData.safeParse(req.body);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const user = await getUserByEmailOrUsername(data.data.email);

    if (!user) {
        return res.status(200).json({ message: "An email containing instructions on how to reset your password has been sent to you" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 3600 * 1000);

    const tokenHashed = crypto.createHash("sha256").update(token).digest("hex");

    const error = await setUserResetToken(user.id, tokenHashed, tokenExpiry);
    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An internal error has occurred" });
    }

    const transporter = nodemailer.createTransport({
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
        host: "mail.twatter.social",
        port: 587,
        requireTLS: true,
    });

    const resetLink = `https://twatter.social/reset-password?token=${token}`;

    const mailOptions: Mail.Options = {
        from: `Twatter <${process.env.EMAIL}>`,
        text: prepareResetPasswordEmailText(resetLink),
        html: prepareResetPasswordEmailHTML(resetLink),
        subject: "Twatter - Reset Password",
        to: user.email,
    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "An internal error occurred while sending the email" });
        }

        return res.status(200).json({ message: "An email containing instructions on how to reset your password has been sent to you" });
    });
}

export async function validateResetPasswordToken(req: Request, res: Response) {
    const data = VerifyResetPasswordTokenData.safeParse(req.query);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const { token } = data.data;

    if (!token) {
        return res.status(403).json({ message: "Token is either invalid or expired" });
    }

    const tokenHashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await getUserByResetToken(tokenHashed);

    if (!user) {
        return res.status(403).json({ message: "Token is either invalid or expired" });
    }

    const u = exclude(user, ...excludedUserProps);

    return res.status(200).json({ message: "Successfully found user", user: u });
}

export async function resetPassword(req: Request, res: Response) {
    const data = ResetPasswordData.safeParse(req.body);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    if (data.data.password !== data.data.passwordConfirm) {
        return res.status(400).json({ message: "Passwords don't match" });
    }

    const hash = await bcrypt.hash(data.data.password, 10);
    const tokenHashed = crypto.createHash("sha256").update(data.data.token).digest("hex");

    const error = await updateUserPassword(hash, tokenHashed);

    switch (error) {
    case DatabaseError.UNKNOWN:
        return res.status(500).json({ message: "An internal error has occurred" });
    case DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND:
        return res.status(403).json({ message: "Token is either invalid or expired" });
    default:
    case DatabaseError.SUCCESS:
        return res.status(200).json({ message: "Your password has been successfully reset" });
    }
}

export async function me(req: Request, res: Response) {
    const u = exclude(req.session.user, ...excludedUserProps);
    return res.status(200).json({ user: u, deviceId: req.session.deviceId });
}

export async function getSessions(req: Request, res: Response) {
    // TODO: get cached sessions from redis

    const sessions = (await querySessions(req.session.user.id)).map((sess) => {
        const ua = UAParser(sess.userAgent);
        return {
            os: ua.os.name ?? "Unknown" + (ua.os.version ? ` ${ua.os.version}` : ""),
            browser: ua.browser.name ?? "Unknown" + (ua.browser.version ? ` ${ua.browser.version}` : ""),
            isMobile: ua.device.type === "mobile",
            ...sess
        };
    });

    return res.status(200).json({ sessions });
}

export async function revokeSession(req: Request, res: Response) {
    const data = RevokeSessionData.safeParse(req.body);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const error = await deleteSession(data.data.deviceId, req.session.user.id);

    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An internal error has occurred" });
    } else if (error === DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND) {
        return res.status(404).json({ message: "Session not found" });
    }

    return res.sendStatus(200);
}

export async function revokeAllSessions(req: Request, res: Response) {
    const error = await deleteSessions(req.session.deviceId, req.session.user.id);

    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An internal error has occurred" });
    }

    return res.sendStatus(200);
}
