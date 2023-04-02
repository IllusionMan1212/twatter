import { Box, Button, Divider, Icon, IconButton, VStack, HStack, Spinner } from "@chakra-ui/react";
import { Desktop, DeviceMobile } from "@phosphor-icons/react";
import { XIcon } from "@heroicons/react/outline";
import { ReactElement, useEffect, useState } from "react";
import { axiosInstance, fetcher } from "src/utils/axios";
import useSWR, { KeyedMutator } from "swr";
import { GetSessionsRes } from "src/types/server";
import { ISession } from "src/types/interfaces";
import RelativeTime from "src/components/Post/RelativeTime";
import { toast } from "react-hot-toast";
import { useUserContext } from "src/contexts/userContext";

interface DeviceProps {
    isMobile: boolean;
    ip: string;
    geolocation: string;
    lastLogin?: string;
    name: string;
    isCurrent: boolean;
    deviceId: string;
    sessions?: ISession[];
    mutate?: KeyedMutator<GetSessionsRes>;
}

function Device({ isMobile, name, ip, geolocation, lastLogin, isCurrent, deviceId, sessions, mutate }: DeviceProps): ReactElement {
    const LastLogin = () => {
        return <RelativeTime date={lastLogin ?? ""} />;
    };

    const revokeSession = async () => {
        try {
            await axiosInstance.post("auth/sessions/revoke", { deviceId });
            mutate?.({ sessions: sessions?.filter((sess) => sess.deviceId !== deviceId) ?? [] }, {
                populateCache: true,
                revalidate: false,
                rollbackOnError: true
            });
        } catch (e) {
            toast.error("An error occurred while revoking the session");
        }
    };

    return (
        <Box width="full">
            <HStack px={4} py={2} bgColor="bgSecondary" spacing={4} rounded="lg" justify="space-between">
                <HStack spacing={5}>
                    <Box bgColor="bgMain" p={3} rounded="full">
                        {
                            isMobile ? (
                                <DeviceMobile color={isCurrent ? "var(--chakra-colors-accent-400)" : "var(--chakra-colors-textSecondary)"} weight="fill" size="36" />
                            ) : (
                                <Desktop color={isCurrent ? "var(--chakra-colors-accent-400)" : "var(--chakra-colors-textSecondary)"} weight="fill" size="36" />
                            )
                        }
                    </Box>
                    <VStack spacing={2} align="start">
                        <p className="text-sm font-semibold">{name}</p>
                        <VStack spacing={1} align="start">
                            <p className="text-xs">{ip} {<><span>-{" "}</span>{geolocation}</>}</p>
                            <p className="text-xs">{isCurrent ? "" : <LastLogin />}</p>
                        </VStack>
                    </VStack>
                </HStack>
                {!isCurrent && (
                    <IconButton
                        colorScheme="red"
                        variant="ghost"
                        aria-label="Log out of device"
                        icon={<Icon as={XIcon} w={6} h={6} />}
                        onClick={revokeSession}
                    />
                )}
            </HStack>
        </Box>
    );
}

Device.defaultProps = {
    isCurrent: false
};

export default function DevicesSettings(): ReactElement {
    const { deviceId } = useUserContext();
    const [sessions, setSessions] = useState<ISession[]>([]);
    const [activeSession, setActiveSession] = useState<ISession | null>(null);

    const { data, isValidating, error, mutate } = useSWR<GetSessionsRes>("auth/sessions", fetcher, {
        revalidateOnFocus: false
    });

    const revokeAllOtherSessions = async () => {
        try {
            await axiosInstance.post("auth/sessions/revoke/all");
            mutate({ sessions: sessions.filter((sess) => sess.deviceId === deviceId) }, {
                populateCache: true,
                revalidate: false,
                rollbackOnError: true
            });
        } catch (e) {
            toast.error("An error occurred while revoking sessions");
        }
    };

    useEffect(() => {
        if (data) {
            setActiveSession(data.sessions.find((sess) => sess.deviceId === deviceId) ?? null);
            setSessions(data.sessions);
        }
    }, [data]);

    return (
        <VStack align="start" width="full" p={3} spacing={6}>
            <p className="text-sm text-[color:var(--chakra-colors-textMain)]">
                In here you can check your logged in devices.
                You can log out of any session individually or all sessions at once excluding the current one.
            </p>
            <p className="text-sm text-[color:var(--chakra-colors-textMain)]">
                If you see a device you don&apos;t recognize we recommend to log it out and immediately change your password.
            </p>
            <Divider height="1px" bgColor="bgSecondary" />
            {error && (<p className="font-bold py-2">{error.message}</p>)}
            {isValidating ? (
                <VStack width="full">
                    <Spinner />
                </VStack>
            ) : (
                <>
                    <VStack width="full" align="start">
                        {activeSession && (
                            <>
                                <p className="text-xl font-bold">Current Device</p>
                                <Device
                                    name={`${activeSession.os} - ${activeSession.browser}`}
                                    ip={activeSession.ip}
                                    isMobile={activeSession.isMobile}
                                    deviceId={activeSession.deviceId}
                                    geolocation={activeSession.geolocation}
                                    isCurrent
                                />
                            </>
                        )}
                    </VStack>
                    {sessions.length > 1 && (
                        <>
                            <VStack width="full" align="start">
                                <p className="text-xl font-bold">Other Devices</p>
                                <VStack width="full">
                                    {sessions.filter((sess) => sess.deviceId !== deviceId).map((session) => (
                                        <Device
                                            key={session.deviceId}
                                            name={`${session.os} - ${session.browser}`}
                                            ip={session.ip}
                                            isMobile={session.isMobile}
                                            geolocation={session.geolocation}
                                            deviceId={session.deviceId}
                                            lastLogin={session.lastLoginTime}
                                            mutate={mutate}
                                            sessions={sessions}
                                        />
                                    ))}
                                </VStack>
                            </VStack>
                            <Button colorScheme="red" variant="outline" onClick={revokeAllOtherSessions}>
                                Log out all other devices
                            </Button>
                        </>
                    )}
                </>
            )}
        </VStack>
    );
}
