import { Request, Response } from "express";
import { createUser, followUser, getUserByEmailOrUsername, getUserByResetToken, getUserByUsername, setUserResetToken, unfollowUser, updateUserPassword } from "../database/users";
import { FollowData, ForgotPasswordData, GetUserData, LoginUserData, RegisterUserData, ResetPasswordData, ValidateResetPasswordTokenData } from "../validators/users";
import * as Cookies from "./utils/cookies";
import bcrypt from "bcrypt";
import { DatabaseError, exclude } from "../database/utils";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { excludedUserProps } from "./utils/users";
import { prepareResetPasswordEmailHTML, prepareResetPasswordEmailText } from "../email";
import Mail from "nodemailer/lib/mailer";
import novu from "../novu";

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
        return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.restricted) {
        return res.status(423).json({ message: "Your account is restricted" });
    }


    if (user.twoFactorAuth) {
        await Cookies.setLoginSession(res, user, true);
        return res.status(200).json({ message: "Please input your 2FA passcode", requiresTwoFactorAuth: true });
    }

    const hmacHash = crypto.createHmac("sha256", process.env.NOVU_APIKEY ?? "").update(user.id).digest("hex");
    user.notificationSubHash = hmacHash;

    await Cookies.setLoginSession(res, user);

    return res.status(200).json({ message: "Logged in successfully", user, requiresTwoFactorAuth: false });
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

    const error = await setUserResetToken(user.id, token, tokenExpiry);
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
    const data = ValidateResetPasswordTokenData.safeParse(req.query);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const { token } = data.data;

    if (!token) {
        return res.status(403).json({ message: "Token is either invalid or expired" });
    }

    const user = await getUserByResetToken(token);

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

    const error = await updateUserPassword(hash, data.data.token);

    switch (error) {
    case DatabaseError.UNKNOWN:
        return res.status(500).json({ message: "An internal error has occurred" });
    case DatabaseError.NOT_FOUND:
        return res.status(403).json({ message: "Token is either invalid or expired" });
    default:
    case DatabaseError.SUCCESS:
        return res.status(200).json({ message: "Your password has been successfully reset" });
    }
}

export function logout(_: Request, res: Response) {
    Cookies.removeTokenCookie(res);
    return res.status(200).json({ message: "Logged out" });
}

export async function validateToken(req: Request, res: Response) {
    return res.status(200).json({ user: req.session.user });
}

export async function getUser(req: Request, res: Response) {
    const data = GetUserData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const user = await getUserByUsername(data.data.username);

    if (!user) {
        return res.status(404).json({ message: "User doesn't exist" });
    }

    return res.status(200).json({ message: "Successfully fetched user", user });
}

export async function follow(req: Request, res: Response) {
    const data = FollowData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    if (data.data.userId === req.session.user.id) {
        return res.status(403).json({ message: "You can't follow yourself" });
    }

    const error = await followUser(req.session.user.id, data.data.userId);

    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An internal error has occurred" });
    } else if (error === DatabaseError.DUPLICATE) {
        return res.status(200).json({ message: "Successfully followed user" });
    }

    await novu.trigger("follow", {
        to: [{ subscriberId: data.data.userId }],
        actor: {
            subscriberId: req.session.user.id,
        },
        payload: {
            name: `<b>${req.session.user.username}</b>`,
            username: req.session.user.username,
        },
    });

    return res.status(200).json({ message: "Successfully followed user" });
}

export async function unfollow(req: Request, res: Response) {
    const data = FollowData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    if (data.data.userId === req.session.user.id) {
        return res.status(403).json({ message: "You can't unfollow yourself" });
    }

    const error = await unfollowUser(req.session.user.id, data.data.userId);

    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An internal error has occurred" });
    } else if (error === DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND) {
        return res.status(400).json({ message: "Can't unfollow user" });
    }

    return res.status(200).json({ message: "Successfully unfollowed user" });
}
