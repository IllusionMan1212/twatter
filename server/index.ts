import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import http from "http";
import next from "next";
import compression from "compression";
import Debug from "debug";
import fileupload from "express-fileupload";
const debug = Debug("twatter");

import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import settingsRouter from "./routes/settings";
import adminRouter from "./routes/admin";
import postsRouter from "./routes/posts";
import cdnRouter from "./routes/cdn";
import messageRouter from "./routes/message";
import searchRouter from "./routes/search";
import eventsRouter from "./routes/events";
import { initWebsocketServer } from "./sockets/init";
import { authGuard } from "./routes/utils/middleware";

const port = parseInt(process.env.NEXT_PUBLIC_PORT ?? "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, hostname: process.env.NEXT_PUBLIC_DOMAIN ?? "localhost", port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    checkEnv();

    const expressApp = express();
    if (process.env.NODE_ENV === "production") {
        expressApp.set("trust proxy", 1);
    }
    const server = http.createServer(expressApp);
    initWebsocketServer(server);
    
    expressApp.use(compression());
    expressApp.use(fileupload({
        abortOnLimit: true,
        safeFileNames: true,
        limits: { files: 4, fileSize: 1024 * 1024 * 8 }
    }));
    expressApp.use(logger("dev"));
    expressApp.use(express.json());
    expressApp.use(express.urlencoded({ extended: false }));
    expressApp.use(cookieParser());

    expressApp.use("*", authGuard, (_, res, next) => {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept",
        );
        res.header("Access-Control-Allow-Credentials", "true");
        next();
    });

    expressApp.use("/api/auth", authRouter);
    expressApp.use("/api/users", usersRouter);
    expressApp.use("/api/settings", settingsRouter);
    expressApp.use("/api/admin", adminRouter);
    expressApp.use("/api/posts", postsRouter);
    expressApp.use("/api/message", messageRouter);
    expressApp.use("/api/search", searchRouter);
    expressApp.use("/api/events", eventsRouter);

    expressApp.use("/cdn", cdnRouter);

    expressApp.all("*", (req, res) => {
        return handle(req, res);
    });

    expressApp.set("port", port);
    server
        .listen(port)
        .on("listening", () => {
            const addr = server.address();
            const bind = typeof addr === "string"
                ? "pipe " + addr
                : "port " + addr?.port;
            debug("Listening on " + bind);
        })
        .on("error", (error: any) => {
            if (error.syscall !== "listen") {
                throw error;
            }

            const bind = typeof port === "string"
                ? "Pipe " + port
                : "Port " + port;

            // handle specific listen errors with friendly messages
            switch (error.code) {
            case "EACCES":
                console.error(bind + " requires elevated privileges");
                process.exit(1);
                break;
            case "EADDRINUSE":
                console.error(bind + " is already in use");
                process.exit(1);
                break;
            default:
                throw error;
            }
        });
});

function checkEnv() {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT secret not set in env");
    }

    if (!process.env.JWT_ENCRYPTION_KEY) {
        throw new Error("JWT encryption key not set in env");
    }

    if (!process.env.DEVICE_IDENTIFIER_SECRET) {
        throw new Error("Device identifier secret not set in env");
    }
}
