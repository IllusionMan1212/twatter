import axios from "axios";
import io from "socket.io-client";

export let socket: SocketIOClient.Socket = null;
const connectSocket = (token: string): void => {
    socket = io.connect(process.env.NEXT_PUBLIC_DOMAIN_URL, {
        query: {token},
    });
};

export function useSocket(): void {
    if (!socket || socket.disconnected) {
        axios.get(`${process.env.NEXT_PUBLIC_DOMAIN_URL}/api/users/validateToken`)
            .then((res) => {
                connectSocket(res.data.token);
            })
            .catch((err) => {
                if (err.response.data.status != 401) {
                    console.error(err);
                    console.error("An error has occurred while connecting socket");
                }
            });
    }
}
