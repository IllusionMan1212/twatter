import { Button, Flex, Spinner, VStack, Text, Image as ChakraImage } from "@chakra-ui/react";
import { ChannelCTATypeEnum, IMessage, useNotifications } from "@novu/notification-center";
import { ReactElement, useEffect } from "react";
import RelativeTime from "src/components/Post/RelativeTime";
import Avatar from "src/components/User/Avatar";
import HTMLToJSX, { Element, domToReact } from "html-react-parser";
import Router from "next/router";
import { Virtuoso } from "react-virtuoso";
import Link from "next/link";

const contentParsingOptions = {
    replace: (domNode: unknown) => {
        if (domNode instanceof Element && domNode.tagName === "b") {
            return (
                <Link href={`/@${(domNode.children[0] as any).data as string}`} passHref>
                    <a className="hover:underline" onClick={(e) => e.stopPropagation()}><b>{domToReact(domNode.children)}</b></a>
                </Link>
            );
        }
    }
};

const bodyParsingOptions = {
    replace: (domNode: unknown) => {
        if (domNode instanceof Element) {
            return <>{domToReact(domNode.children)}</>;
        }
    }
};

interface NotificationProps {
    notif: IMessage;
}

function Notification({ notif }: NotificationProps): ReactElement {
    const content = HTMLToJSX(notif.content as string, contentParsingOptions);
    const body = HTMLToJSX(notif.payload["body"] as string, bodyParsingOptions);

    const handleClick = () => {
        (notif.cta.type === ChannelCTATypeEnum.REDIRECT) && Router.push(notif.cta.data.url ?? "");
    };

    return (
        <Flex
            as={Button}
            borderBottom={"1px solid var(--chakra-colors-strokeSecondary)"}
            width="full"
            height="full"
            justify="space-between"
            align="start"
            colorScheme={notif.seen ? "notificationItem" : "conversationItem"}
            rounded="0"
            textAlign="left"
            p={3}
            gap={4}
            onClick={handleClick}
        >
            <div className="flex gap-2 w-full text-[color:var(--chakra-colors-text)]">
                <Link href={`/@${notif.payload["username"]}`} passHref>
                    <a onClick={(e) => e.stopPropagation()}>
                        <Avatar
                            src={notif.actor?.data}
                            alt="Avatar"
                            width="30"
                            height="30"
                        />
                    </a>
                </Link>
                <div className="flex flex-col gap-2 whitespace-normal">
                    <p>{content}</p>
                    <p className="text-sm text-[color:var(--chakra-colors-textMain)]">{body}</p>
                </div>
            </div>
            <div className="flex flex-col justify-between items-end">
                <p className="text-xs text-[color:var(--chakra-colors-textMain)]">
                    <RelativeTime type="conversation" date={notif.createdAt} />
                </p>
            </div>
        </Flex>
    );
}

export default function Notifications(): ReactElement {
    const {
        notifications,
        isLoading,
        markAllNotificationsAsSeen,
        markAllNotificationsAsRead,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage
    } = useNotifications();

    useEffect(() => {
        const markNotificationsAsRead = () => {
            if (document.visibilityState === "hidden") {
                markAllNotificationsAsRead();
                markAllNotificationsAsSeen();
            }
        };

        document.addEventListener("visibilitychange", markNotificationsAsRead);

        return () => {
            document.removeEventListener("visibilitychange", markNotificationsAsRead);
            markAllNotificationsAsRead();
            markAllNotificationsAsSeen();
        };
    }, []);

    const Footer = (): ReactElement | null => {
        if (hasNextPage && isFetchingNextPage) return (
            <VStack width="full">
                <Spinner />
            </VStack>
        );

        return null;
    };

    if (isLoading) return (
        <VStack width="full">
            <Spinner />
        </VStack>
    );

    if (!notifications.length) return (
        <VStack my={4} px={2} spacing={10} align="center" justify="center" width="full">
            <ChakraImage
                fit="cover"
                alt="Empty list graphic"
                src="/graphics/List_Is_Empty.png"
                width="250px"
            />
            <VStack>
                <Text fontSize="3xl" fontWeight="bold">
                    No Notifications Yet
                </Text>
                <Text align="center" color="textMain">
                    You will be notified when certain events happen, such as when someone follows you or interacts with your posts
                </Text>
            </VStack>
        </VStack>
    );

    return (
        <Flex width="full">
            <div className="flex flex-col w-full">
                <Virtuoso
                    data={notifications}
                    totalCount={notifications.length}
                    endReached={fetchNextPage}
                    useWindowScroll
                    overscan={{ main: 200, reverse: 200 }}
                    components={{
                        Footer,
                    }}
                    itemContent={(_, notif) => (
                        <Notification
                            key={notif._id}
                            notif={notif}
                        />
                    )}
                />
            </div>
        </Flex>
    );
}
