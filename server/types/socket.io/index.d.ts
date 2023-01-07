import "socket.io";

declare module "socket.io" {
    export interface Socket {
        userId: string;
    }
}
