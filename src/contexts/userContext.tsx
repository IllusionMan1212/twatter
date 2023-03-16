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
import { axiosAuth } from "src/utils/axios";
import { GetUnreadMessagesRes } from "src/types/server";
import { MarkedMessagesAsSeenData, ServerMessageEventData } from "server/sockets/types";

interface UserContextType {
    user: IUser | null | undefined;
    login: () => void;
    logout: () => void;
    mutate: KeyedMutator<{ user: any }>;
    socket: Socket | null;
    unreadMessages: Map<string, number>;
    setUnreadMessages: Dispatch<SetStateAction<Map<string, number>>>;
    activeConversationId: string | null;
    setActiveConversationId: Dispatch<SetStateAction<string | null>>;
}

const UserContextDefaultValues: UserContextType = {
    user: undefined,
    login: () => {
        void 0;
    },
    logout: () => {
        void 0;
    },
    mutate: async () => undefined,
    socket: null,
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

const fetcher = (url: string) =>
    fetch(url, { credentials: "include" })
        .then((r) => r.json())
        .then((data) => {
            return { user: data?.user };
        });

export function UserWrapper({ children }: PropsWithChildren): ReactElement {
    const [user, setUser] = useState<IUser | null | undefined>(undefined);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [loading, setLoading] = useState(true);
    const [unreadMessages, setUnreadMessages] = useState(new Map<string, number>());
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    const { data, mutate, isValidating } = useSWR("/api/users/validate-token", fetcher);

    const openSocket = () => {
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
        if (isValidating) {
            return;
        }

        if (data && data.user) {
            setUser(data.user);
            openSocket();
            setLoading(false);
            (async () => {
                const res = await axiosAuth.get<GetUnreadMessagesRes>("message/get-unread-messages");
                setUnreadMessages(new Map<string, number>(res.data.convos.map(c => [c.id, c.messages])));
            })();
        } else {
            setUser(null);
            setLoading(false);
        }
    }, [data]);

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

    const login = () => {
        mutate();
        openSocket();
    };

    const logout = () => {
        socket?.close();
        setSocket(null);
        mutate();
    };

    return (
        <UserContext.Provider value={{ user, socket, login, logout, mutate, unreadMessages, setUnreadMessages, activeConversationId, setActiveConversationId }}>
            <div className={loading ? "invisible" : ""}>
                {children}
            </div>
        </UserContext.Provider>
    );
}

export function useUserContext(): UserContextType {
    return useContext(UserContext);
}
