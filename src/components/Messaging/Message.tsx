import { HStack, VStack, Text, Flex, Image, Icon } from "@chakra-ui/react";
import { memo, ReactElement } from "react";
import Avatar from "src/components/User/Avatar";
import { useUserContext } from "src/contexts/userContext";
import { Check, Checks } from "phosphor-react";

interface MessageProps {
    userOwned: boolean;
    content: string;
    attachmentURL: string | null;
    recipientAvatarURL: string | undefined;
    ownerUsername: string;
    wasRead: boolean;
    createdAt: string;
}

interface MessageTimeProps {
    date: string;
}

const CheckIcon = () => {
    return <Check weight="bold" color="var(--chakra-colors-textMain)" />;
};

const ChecksIcon = () => {
    return <Checks weight="bold" color="var(--chakra-colors-blue-500)" />;
};

const MessageTime = memo(function MessageTime({ date }: MessageTimeProps): ReactElement {
    const now = new Date();
    const messageDate = new Date(date);
    const difference = now.getTime() - messageDate.getTime();

    if (now.getFullYear() > messageDate.getFullYear()) {
        // different years
        return (
            <Text fontSize="10px" color="textSecondary">
                {messageDate
                    .toLocaleString("default", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    })
                    .toUpperCase()}{" "}
                | {messageDate.getDate()}{" "}
                {messageDate.toLocaleString("default", { month: "short" })}{" "}
                {messageDate.getFullYear()}
            </Text>
        );
    } else if (difference >= 1000 * 60 * 60 * 24 * 7) {
        // older than 7 days. display hour, day and month
        return (
            <Text fontSize="10px" color="textSecondary">
                {messageDate
                    .toLocaleString("default", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    })
                    .toUpperCase()}{" "}
                | {messageDate.getDate()}{" "}
                {messageDate.toLocaleString("default", { month: "short" })}
            </Text>
        );
    } else if (now.getDate() !== messageDate.getDate()) {
        // different days. display hour, weekday
        return (
            <Text fontSize="10px" color="textSecondary">
                {messageDate
                    .toLocaleString("default", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    })
                    .toUpperCase()}{" "}
                {messageDate.toLocaleString("default", { weekday: "short" })}
            </Text>
        );
    } else {
        return (
            <Text fontSize="10px" color="textSecondary">
                {messageDate
                    .toLocaleString("default", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    })
                    .toUpperCase()}{" "}
                Today
            </Text>
        );
    }
});

export default function Message(props: MessageProps): ReactElement {
    const { user } = useUserContext();

    return (
        <>
            {props.userOwned ? (
                <Flex width="full" justifyContent="flex-end" py={4}>
                    <HStack align="start" maxWidth={{ base: "80%", md: "65%" }}>
                        <VStack spacing={0.5} align="end">
                            <MessageTime date={props.createdAt} />
                            <VStack
                                spacing={4}
                                alignItems="flex-start"
                                px={4}
                                py={2}
                                bgColor="bgSecondary"
                                rounded="8px 0 8px 8px"
                            >
                                {props.attachmentURL ? (
                                    <Image
                                        src={props.attachmentURL}
                                        alt="Message attachment"
                                        maxHeight="250px"
                                    />
                                ) : null}
                                <Text
                                    fontSize="sm"
                                    wordBreak="break-word"
                                    whiteSpace="break-spaces"
                                >
                                    {props.content}
                                </Text>
                            </VStack>
                        </VStack>
                        <VStack spacing={0.5} align="start">
                            <Avatar
                                src={user?.avatarURL}
                                alt={`${props.ownerUsername}'s avatar`}
                                width="35px"
                                height="35px"
                            />
                            <Icon as={props.wasRead ? ChecksIcon : CheckIcon} />
                        </VStack>
                    </HStack>
                </Flex>
            ) : (
                <HStack align="start" maxWidth={{ base: "80%", md: "65%" }} py={4}>
                    <Avatar
                        src={props.recipientAvatarURL}
                        alt={`${props.ownerUsername}'s avatar`}
                        width="35px"
                        height="35px"
                    />
                    <VStack spacing={0.5} align="start">
                        <MessageTime date={props.createdAt} />
                        <VStack
                            spacing={4}
                            alignItems="start"
                            px={4}
                            py={2}
                            bgColor="bgSecondary"
                            rounded="0 8px 8px 8px"
                        >
                            {props.attachmentURL ? (
                                <Image
                                    src={props.attachmentURL}
                                    alt="Message attachment"
                                    maxHeight="250px"
                                />
                            ) : null}
                            <Text
                                fontSize="sm"
                                wordBreak="break-word"
                                whiteSpace="break-spaces"
                            >
                                {props.content}
                            </Text>
                        </VStack>
                    </VStack>
                </HStack>
            )}
        </>
    );
}
