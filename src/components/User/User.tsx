import {
    HStack,
    LinkBox,
    Text,
    LinkOverlay,
    Tooltip,
    Button,
    Icon,
} from "@chakra-ui/react";
import { ReactElement } from "react";
import NextLink from "next/link";
import { ChatAltIcon } from "@heroicons/react/solid";
import Avatar from "src/components/User/Avatar";
import { useUserContext } from "src/contexts/userContext";
import { axiosAuth } from "src/utils/axios";
import { GenericBackendRes, StartConversationRes } from "src/types/server";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import Router from "next/router";

interface UserProps {
    id: string;
    displayName: string;
    username: string;
    avatarURL: string | null;
    allowAllDMs: boolean;
    startConvoCB?: () => Promise<void>;
}

export default function User(props: UserProps): ReactElement {
    const { user } = useUserContext();

    const handleStartConversation = () => {
        axiosAuth
            .post<StartConversationRes>("message/start-conversation", {
                userId: props.id,
            })
            .then(async (res) => {
                await props.startConvoCB?.();
                await Router.push(`/messages/${res.data.conversationId}`);
            })
            .catch((e: AxiosError<GenericBackendRes>) => {
                toast.error(
                    e.response?.data.message ??
                        "An error occurred while starting the conversation",
                );
            });
    };

    return (
        <LinkBox width="full">
            <HStack
                px={4}
                py={2}
                justify="space-between"
                rounded="lg"
                bgColor="bgPrimary"
                width="full"
            >
                <NextLink href={`/@${props.username}`} passHref>
                    <LinkOverlay>
                        <HStack>
                            <Avatar
                                src={props.avatarURL ?? ""}
                                alt={`${props.username}'s avatar`}
                                width="50px"
                                height="50px"
                            />
                            <Tooltip label={props.displayName}>
                                <Text noOfLines={1}>{props.displayName}</Text>
                            </Tooltip>
                        </HStack>
                    </LinkOverlay>
                </NextLink>
                {props.allowAllDMs && props.id !== user?.id ? (
                    <Button
                        size="sm"
                        colorScheme="accent"
                        rightIcon={<Icon as={ChatAltIcon} />}
                        onClick={handleStartConversation}
                    >
                        Message
                    </Button>
                ) : null}
            </HStack>
        </LinkBox>
    );
}
