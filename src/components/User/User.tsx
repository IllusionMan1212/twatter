import {
    LinkBox,
    LinkOverlay,
    Tooltip,
    ButtonGroup,
} from "@chakra-ui/react";
import { ReactElement, useState } from "react";
import NextLink from "next/link";
import Avatar from "src/components/User/Avatar";
import FollowButton from "src/components/User/FollowButton";
import MessageButton from "./MessageButton";

interface UserProps {
    id: string;
    displayName: string;
    username: string;
    avatarURL: string | undefined | null;
    allowAllDMs: boolean;
    startConvoCB?: () => Promise<void>;
    isFollowing: boolean;
}

export default function User(props: UserProps): ReactElement {
    const [hovering, setHovering] = useState(false);

    return (
        <LinkBox
            width="full"
            onMouseOver={() => setHovering(true)}
            onMouseOut={() => setHovering(false)}
        >
            <div className="flex gap-2 items-center px-4 py-2 justify-between rounded-lg w-full min-w-0 bg-[color:var(--chakra-colors-bgPrimary)]">
                <NextLink href={`/@${props.username}`} passHref>
                    <LinkOverlay minWidth={0}>
                        <div className="flex min-w-0 gap-2 items-center">
                            <Avatar
                                src={props.avatarURL}
                                alt={`${props.username}'s avatar`}
                                width="50px"
                                height="50px"
                                pauseAnimation={!hovering}
                            />
                            <div className="flex flex-col truncate">
                                <Tooltip label={props.displayName}>
                                    <p className="truncate max-w-full">{props.displayName}</p>
                                </Tooltip>
                                <p className="truncate max-w-full text-sm text-[color:var(--chakra-colors-textMain)]">@{props.username}</p>
                            </div>
                        </div>
                    </LinkOverlay>
                </NextLink>
                <ButtonGroup size="sm" colorScheme="accent">
                    <FollowButton isFollowing={props.isFollowing} userId={props.id} iconOnly iconSize="20" />
                    <MessageButton userId={props.id} iconOnly messageCB={props.startConvoCB} allowAllDMs={props.allowAllDMs} />
                </ButtonGroup>
            </div>
        </LinkBox>
    );
}
