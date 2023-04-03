import {
    createContext,
    ReactElement,
    useContext,
    useEffect,
    useState,
    PropsWithChildren,
    Dispatch,
    SetStateAction,
    useCallback,
} from "react";
import { IUser } from "src/types/interfaces";
import useSWR, { KeyedMutator } from "swr";
import { io, Socket } from "socket.io-client";
import { GetUnreadMessagesRes, GetMeRes } from "src/types/server";
import { MarkedMessagesAsSeenData, ServerMessageEventData } from "server/sockets/types";
import { axiosInstance, fetcher } from "src/utils/axios";
import { toast } from "react-hot-toast";

interface UserContextType {
    user: IUser | null | undefined;
    login: (user: IUser, deviceId: string) => Promise<void>;
    logout: () => Promise<void>;
    mutate: KeyedMutator<GetMeRes>;
    socket: Socket | null;
    deviceId: string;
    unreadMessages: Map<string, number>;
    setUnreadMessages: Dispatch<SetStateAction<Map<string, number>>>;
    activeConversationId: string | null;
    setActiveConversationId: Dispatch<SetStateAction<string | null>>;
}

const UserContextDefaultValues: UserContextType = {
    user: undefined,
    login: async () => {
        void 0;
    },
    logout: async () => {
        void 0;
    },
    mutate: async () => undefined,
    socket: null,
    deviceId: "",
    unreadMessages: new Map<string, number>(),
    setUnreadMessages: () => {
        void 0;
    },
    activeConversationId: null,
    setActiveConversationId: () => {
        void 0;
    }
};

const UserContext = createContext<UserContextType>(UserContextDefaultValues);

export function UserWrapper({ children }: PropsWithChildren): ReactElement {
    const [user, setUser] = useState<IUser | null | undefined>(undefined);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [deviceId, setDeviceId] = useState("");
    const [loading, setLoading] = useState(true);
    const [unreadMessages, setUnreadMessages] = useState(new Map<string, number>());
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    const { data, mutate, isValidating, error } = useSWR("auth/me", fetcher<GetMeRes>, {
        revalidateOnFocus: false
    });

    useEffect(() => {
        const resInter = axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                let failure = false;
                if (user && error.response.status === 401 && !failure) {
                    failure = true;
                    toast.error("Your session has expired. Please log in again.");
                    await logout(false);
                    return Promise.reject(error);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosInstance.interceptors.response.eject(resInter);
        };
    }, [user]);

    const openSocket = () => {
        if (socket?.connected) return;
        const _socket = io();

        setSocket(_socket);
        console.log("Websocket opened");
    };

    const handleMessage = useCallback((message: ServerMessageEventData) => {
        if (message.conversationId === activeConversationId) {
            return;
        }

        setUnreadMessages((prev) => {
            const newMap = new Map(prev);
            const count = newMap.get(message.conversationId);

            if (count) {
                newMap.set(message.conversationId, count + 1);
            } else {
                newMap.set(message.conversationId, 1);
            }

            return newMap;
        });
    }, [activeConversationId]);

    const handleMarkedMessagesAsSeen = useCallback((payload: MarkedMessagesAsSeenData) => {
        setUnreadMessages((prev) => {
            const newMap = new Map(prev);
            const convo = newMap.has(payload.conversationId);

            if (convo) {
                newMap.delete(payload.conversationId);
            }

            return newMap;
        });
    }, []);

    useEffect(() => {
        if (!user) return;

        if (data && data.user) {
            setUser(data.user);
        }
    }, [data]);

    useEffect(() => {
        if (isValidating || user) {
            return;
        }

        if (data && data.user) {
            setUser(data.user);
            setDeviceId(data.deviceId);
            openSocket();
            setLoading(false);
            (async () => {
                const res = await axiosInstance.get<GetUnreadMessagesRes>("message/get-unread-messages");
                setUnreadMessages(new Map<string, number>(res.data.convos.map(c => [c.id, c.messages])));
            })();
        } else {
            setUser(null);
            setLoading(false);
        }
    }, [data]);

    useEffect(() => {
        if (error) {
            setLoading(false);
        }
    }, [error]);

    useEffect(() => {
        if (socket) {
            socket.on("message", handleMessage);
            socket.on("markedMessagesAsSeen", handleMarkedMessagesAsSeen);
        }

        return () => {
            if (socket) {
                socket.off("message", handleMessage);
                socket.off("markedMessagesAsSeen", handleMarkedMessagesAsSeen);
            }
        };
    }, [socket, handleMessage, handleMarkedMessagesAsSeen]);

    const login = async (user: IUser, deviceId: string) => {
        setUser(user);
        setDeviceId(deviceId);
        openSocket();
    };

    const logout = async (sendRequest = true) => {
        try {
            sendRequest && await axiosInstance.delete("auth/logout");
        } catch (e) { void 0; }
        setUser(null);
        socket?.close();
        setSocket(null);
    };

    return (
        <UserContext.Provider
            value={{
                user,
                socket,
                login,
                logout,
                deviceId,
                mutate,
                unreadMessages,
                setUnreadMessages,
                activeConversationId,
                setActiveConversationId
            }}
        >
            <div className={loading ? "invisible" : ""}>
                {children}
            </div>
        </UserContext.Provider>
    );
}

export function useUserContext(): UserContextType {
    return useContext(UserContext);
}
