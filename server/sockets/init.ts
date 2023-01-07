import { Server, Socket } from "socket.io";
import http from "http";
import { parse as parseCookies } from "cookie";
import { validateSession } from "../controllers/utils/cookies";
import { handleMarkMessagesAsRead, handleMessage, handleTyping } from "./message";
import { ClientToServerEvents, ServerToClientEvents } from "./types";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

const connectedSockets = new Map<string, Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>[]>;

export const initWebsocketServer = (server: http.Server) => {
    const io = new Server<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>(server, {
        cors: {
            credentials: true,
            origin: process.env.NEXT_PUBLIC_DOMAIN,
        },
        maxHttpBufferSize: 16 * 1024 * 1024,
        pingTimeout: 30000,
        serveClient: false,
    });

    io.use(async (socket, next) => {
        const cookies = parseCookies(socket.handshake.headers.cookie ?? "");
        const session = await validateSession(cookies["session"]);

        if (!session) {
            socket.emit("_message", "Unauthorized");
            socket.disconnect();
            return;
        }

        socket.userId = session.user.id;

        next();
    });

    io.on("connection", (socket) => {
        if (connectedSockets.has(socket.userId)) {
            const sockets = [...connectedSockets.get(socket.userId)!];
            connectedSockets.set(socket.userId, sockets.concat([socket]));
        } else {
            connectedSockets.set(socket.userId, [socket]);
        }

        socket.on("disconnect", () => {
            const sockets = connectedSockets.get(socket.userId)!;
            if (sockets.length === 1) {
                connectedSockets.delete(socket.userId);
            } else if (sockets.length > 1) {
                connectedSockets.set(socket.userId, sockets.filter((sock) => sock.id !== socket.id));
            }
        });

        handleMessage(socket, connectedSockets);
        handleTyping(socket, connectedSockets);
        handleMarkMessagesAsRead(socket, connectedSockets);
    });
};
