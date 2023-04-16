import { Button, Flex, useColorModeValue } from "@chakra-ui/react";
import { MouseEventHandler, ReactElement, useState } from "react";
import RelativeTime from "src/components/Post/RelativeTime";
import Avatar from "src/components/User/Avatar";
import parse, { domToReact, Element } from "html-react-parser";
import UnreadIndicator from "src/components/UnreadIndicator";

interface ConversationProps {
    recipientName: string;
    recipientUsername: string;
    recipientAvatarURL: string | undefined | null;
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
                <>{domToReact(domNode.children)}</>
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
            <div className={`${props.isActive ? "block" : "hidden"} absolute top-0 left-0 h-full w-[6px] rounded-[4px_0_0_4px] bg-[color:var(--chakra-colors-accent-500)]`} />
            <div className="flex flex-col gap-3 w-full min-w-0">
                <div className="flex items-center gap-2 min-w-0">
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
                    <p className={`${props.isActive ? "font-bold" : "font-semibold"} truncate max-w-full text-[color:var(--chakra-colors-text)]`}>
                        {props.recipientName}
                    </p>
                </div>
                <p className="truncate max-w-full text-xs break-all text-[color:var(--chakra-colors-textMain)] font-normal">
                    {parse(props.lastMessage, parsingOptions)}
                </p>
            </div>
            <p className="top-[3] right-[3] text-xs font-semibold text-[color:var(--chakra-colors-textSecondary)]">
                <RelativeTime date={props.updatedAt} type="conversation" />
            </p>
        </Flex>
    );
}
