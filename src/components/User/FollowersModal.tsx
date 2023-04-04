import { ButtonGroup, LinkBox, LinkOverlay, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, VStack } from "@chakra-ui/react";
import { ReactElement, useEffect, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { IFollowUser } from "src/types/interfaces";
import Avatar from "./Avatar";
import useSWRInfinite from "swr/infinite";
import { AxiosError } from "axios";
import { GenericBackendRes, GetFollowersRes, GetFollowingRes } from "src/types/server";
import { useUserContext } from "src/contexts/userContext";
import FollowButton from "./FollowButton";
import NextLink from "next/link";
import MessageButton from "./MessageButton";
import { fetcher } from "src/utils/axios";
import styles from "src/styles/userProfile.module.scss";

interface UserProps {
    user: IFollowUser;
}

function User({ user }: UserProps): ReactElement {
    const { user: currentUser } = useUserContext();
    const isFollowing = !!user.followers.find((f) => f.followerId === currentUser?.id);

    return (
        <LinkBox>
            <div className="flex gap-1 justify-between items-center mb-1 hover:bg-[color:var(--chakra-colors-bgPrimary)] p-2 rounded-md truncate">
                <NextLink href={`/@${user.username}`} passHref>
                    <LinkOverlay minWidth={0}>
                        <div className="flex items-center gap-2 min-w-0">
                            <Avatar
                                src={user.avatarURL}
                                alt={`${user.username}'s avatar`}
                                width="40px"
                                height="40px"
                                pauseAnimation
                            />
                            <div className="flex flex-col truncate">
                                <p className="truncate">{user.displayName}</p>
                                <p className="text-sm text-[color:var(--chakra-colors-textMain)]">@{user.username}</p>
                            </div>
                        </div>
                    </LinkOverlay>
                </NextLink>
                <ButtonGroup size="sm" colorScheme="accent">
                    <FollowButton isFollowing={isFollowing} userId={user.id} iconOnly iconSize="20" />
                    <MessageButton userId={user.id} allowAllDMs={user.settings.allowAllDMs} iconOnly iconSize="20" />
                </ButtonGroup>
            </div>
        </LinkBox>
    );
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export function FollowersModal({ isOpen, onClose, userId }: ModalProps): ReactElement {
    const [reachedEnd, setReachedEnd] = useState(false);
    const [followers, setFollowers] = useState<{ Follower: IFollowUser }[]>([]);

    const getKey = (pageIndex: number) => {
        return `users/get-followers/${userId}/${pageIndex}`;
    };

    const {
        data,
        error,
        isValidating,
        size: page,
        setSize: setPage
    } = useSWRInfinite<GetFollowersRes, AxiosError<GenericBackendRes>>(getKey, fetcher, {
        revalidateOnFocus: false,
    });

    const Footer = (): ReactElement | null => {
        if (!reachedEnd)
            return (
                <VStack py={4} width="full">
                    <Spinner size="lg" />
                </VStack>
            );

        return null;
    };

    const loadMoreFollowers = async () => {
        if (reachedEnd) {
            return;
        }

        await setPage(page + 1);
    };

    useEffect(() => {
        if (data) {
            setFollowers(
                data.reduce(
                    (prev, curr) => curr.followers.concat(prev),
                    [] as { Follower: IFollowUser }[],
                ),
            );

            if (data[data.length - 1].followers.length < 30) {
                setReachedEnd(true);
            }
        }
    }, [data]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent bgColor="bgMain" height="60vh">
                <ModalHeader />
                <ModalBody p={0}>
                    {!isValidating && !followers.length && (
                        <div className="py-4">
                            <p className="font-bold text-lg text-center">
                                This user doesn&apos;t have any followers
                            </p>
                        </div>
                    )}
                    {error ? (
                        <div>
                            <p className="font-bold">
                                {error.response?.data.message ??
                                    "An error occurred while fetching followers"}
                            </p>
                        </div>
                    ) : followers.length ? (
                        <Virtuoso
                            className={styles.followers}
                            data={followers}
                            totalCount={followers.length}
                            endReached={loadMoreFollowers}
                            components={{
                                Footer,
                            }}
                            itemContent={(_, follower) => (
                                <User user={follower.Follower} />
                            )}
                        />
                    ) : null}
                </ModalBody>
                <ModalFooter />
            </ModalContent>
        </Modal>
    );
}

export function FollowingModal({ isOpen, onClose, userId }: ModalProps): ReactElement {
    const [reachedEnd, setReachedEnd] = useState(false);
    const [following, setFollowing] = useState<{ Following: IFollowUser }[]>([]);

    const getKey = (pageIndex: number) => {
        return `users/get-following/${userId}/${pageIndex}`;
    };

    const {
        data,
        error,
        isValidating,
        size: page,
        setSize: setPage
    } = useSWRInfinite<GetFollowingRes, AxiosError<GenericBackendRes>>(getKey, fetcher, {
        revalidateOnFocus: false,
    });

    const Footer = (): ReactElement | null => {
        if (!reachedEnd)
            return (
                <VStack py={4} width="full">
                    <Spinner size="lg" />
                </VStack>
            );

        return null;
    };

    const loadMoreFollowing = async () => {
        if (reachedEnd) {
            return;
        }

        await setPage(page + 1);
    };

    useEffect(() => {
        if (data) {
            setFollowing(
                data.reduce(
                    (prev, curr) => curr.following.concat(prev),
                    [] as { Following: IFollowUser }[],
                ),
            );

            if (data[data.length - 1].following.length < 30) {
                setReachedEnd(true);
            }
        }
    }, [data]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent bgColor="bgMain" height="60vh">
                <ModalHeader />
                <ModalBody p={0}>
                    {!isValidating && !following.length && (
                        <div className="py-4">
                            <p className="font-bold text-lg text-center">
                                This user is not following anyone
                            </p>
                        </div>
                    )}
                    {error ? (
                        <div>
                            <p className="font-bold">
                                {error.response?.data.message ??
                                    "An error occurred while fetching following"}
                            </p>
                        </div>
                    ) : following.length ? (
                        <Virtuoso
                            className={styles.followers}
                            data={following}
                            totalCount={following.length}
                            endReached={loadMoreFollowing}
                            components={{
                                Footer
                            }}
                            itemContent={(_, following) => (
                                <User user={following.Following} />
                            )}
                        />
                    ) : null}
                </ModalBody>
                <ModalFooter />
            </ModalContent>
        </Modal>
    );
}
