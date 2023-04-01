import UAParser from "ua-parser-js";
import { Request, Response } from "express";
import crypto from "crypto";
import { checkIfNewIp, createOrUpdateSession } from "../../database/auth";
import { User, UserSettings } from "@prisma/client";
import * as Tokens from "./tokens";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { exclude } from "../../database/utils";
import { prepareUnrecognizedIPEmailHTML, prepareUnrecognizedIPEmailText } from "../../email";

export const excludedUserProps = [
    "password",
    "resetPasswordToken",
    "resetPasswordTokenExpiry",
    "totpSecret",
] as const;

export function generateDeviceId(userId: string, ua: UAParser.IResult, ip: string): string {
    const data = `${ua.os.name ?? ""}-${ua.os.version ?? ""}-${ua.browser.name ?? ""}-${ua.browser.version ?? ""}-${ua.device.model ?? ""}-${ip}-${ua.ua}-${userId}-${process.env.DEVICE_IDENTIFIER_SECRET ?? ""}`;

    const hash = crypto.createHash("sha256").update(data).digest("hex");
    return hash;
}

export async function doLogin(req: Request, res: Response, user: User & { settings: UserSettings | null, notificationSubHash: string }) {
    const ua = UAParser(req.headers["user-agent"] ?? "");
    const deviceId = generateDeviceId(user.id, ua, req.ip);
    const tokens = await Tokens.generateTokens(res, user);
    const isNewIp = await checkIfNewIp(user.id, req.ip);
    // TODO: get the session from redis
    const session = await createOrUpdateSession(deviceId, user.id, req.headers["user-agent"] ?? "", req.ip, tokens);
    if (typeof session !== "object") {
        return res.status(500).json({ message: "An internal error occurred" });
    }
    // TODO: store the session in redis

    if (isNewIp && process.env.NODE_ENV === "production") {
        console.log(`Unrecognized IP '${req.ip}' for user '${user.id}', sending an email`);

        const transporter = nodemailer.createTransport({
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
            host: "mail.twatter.social",
            port: 587,
            requireTLS: true,
        });

        const mailOptions: Mail.Options = {
            from: `Twatter <${process.env.EMAIL}>`,
            text: prepareUnrecognizedIPEmailText(req.ip, ua.os.name, ua.browser.name),
            html: prepareUnrecognizedIPEmailHTML(req.ip, ua.os.name, ua.browser.name),
            subject: "Twatter - New Login",
            to: user.email,
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.error(err);
            }
        });
    }

    const hmacHash = crypto.createHmac("sha256", process.env.NOVU_APIKEY ?? "").update(user.id).digest("hex");
    user.notificationSubHash = hmacHash;

    const u = exclude(user, ...excludedUserProps);

    return res.status(200).json({ message: "Logged in successfully", tokens, user: u, deviceId, requiresTwoFactorAuth: false });
}
