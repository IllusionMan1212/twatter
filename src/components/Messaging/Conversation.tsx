import { Box, Button, Flex, HStack, Text, useColorModeValue } from "@chakra-ui/react";
import { MouseEventHandler, ReactElement, useState } from "react";
import RelativeTime from "src/components/Post/RelativeTime";
import Avatar from "src/components/User/Avatar";
import parse, { domToReact, Element } from "html-react-parser";
import UnreadIndicator from "src/components/UnreadIndicator";

interface ConversationProps {
    recipientName: string;
    recipientUsername: string;
    recipientAvatarURL: string;
    updatedAt: string;
    lastMessage: string;
    unreadMessages: number;
    isActive: boolean;
    onClick: MouseEventHandler<HTMLElement>;
}

const parsingOptions = {
    replace: (domNode: unknown) => {
        if (domNode instanceof Element && domNode.name === "a") {
            return (
                <p>{domToReact(domNode.children)}</p>
            );
        }
    },
};

export default function Conversation(props: ConversationProps): ReactElement {
    const [hovering, setHovering] = useState(false);
    const bgColor = useColorModeValue("#ced6dd", "#3c3e44");

    return (
        <Flex
            as={Button}
            borderBottom={{
                base: "2px solid var(--chakra-colors-bgSecondary)",
                md: "initial",
            }}
            _last={{
                borderBottom: "none",
            }}
            width="full"
            height="full"
            align="start"
            position="relative"
            bgColor={props.unreadMessages > 0 ? bgColor : "conversationItem"}
            colorScheme="conversationItem"
            textAlign="left"
            rounded={{ base: 0, md: "4px" }}
            py={3}
            px={4}
            onClick={props.onClick}
            onMouseOver={() => setHovering(true)}
            onMouseOut={() => setHovering(false)}
        >
            <Box
                display={props.isActive ? "initial" : "none"}
                position="absolute"
                top={0}
                left={0}
                height="full"
                width="6px"
                bgColor="accent.500"
                rounded="4px 0 0 4px"
            />
            <Flex gap={3} width="full" minWidth={0} direction="column">
                <HStack minWidth={0}>
                    <div className="relative">
                        <Avatar
                            src={props.recipientAvatarURL}
                            alt={`${props.recipientUsername}'s avatar`}
                            width="40px"
                            height="40px"
                            pauseAnimation={!hovering}
                        />
                        <UnreadIndicator position="-bottom-1 -right-1" count={props.unreadMessages} />
                    </div>
                    <Text
                        color="text"
                        fontWeight={props.isActive ? "bold" : "semibold"}
                        className="truncate max-w-full"
                    >
                        {props.recipientName}
                    </Text>
                </HStack>
                <Text
                    color={"textMain"}
                    wordBreak="break-all"
                    whiteSpace="normal"
                    fontWeight="400"
                    fontSize="xs"
                    noOfLines={1}
                >
                    {parse(props.lastMessage, parsingOptions)}
                </Text>
            </Flex>
            <Text
                top={3}
                right={3}
                color={"textSecondary"}
                fontWeight="semibold"
                fontSize="xs"
            >
                <RelativeTime date={props.updatedAt} type="conversation" />
            </Text>
        </Flex>
    );
}
