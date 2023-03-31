import { HStack, VStack, Text } from "@chakra-ui/react";
import { ReactElement } from "react";
import toast from "react-hot-toast";
import Switch from "src/components/Controls/Switch";
import { useUserContext } from "src/contexts/userContext";
import { axiosInstance } from "src/utils/axios";

export default function PrivacySettings(): ReactElement {
    const { user, mutate, deviceId } = useUserContext();

    const toggleAllowAllDMs = async () => {
        try {
            await mutate(
                axiosInstance.post("settings/toggle-allow-all-dms", {
                    allowAllDMs: !user?.settings?.allowAllDMs ?? true,
                }),
                {
                    optimisticData: {
                        deviceId,
                        user: {
                            ...user!,
                            settings: {
                                ...user!.settings!,
                                allowAllDMs: !user?.settings?.allowAllDMs,
                            },
                        },
                    },
                    populateCache: false,
                    revalidate: false,
                    rollbackOnError: true,
                },
            );
        } catch (e) {
            toast.error("An error occurred while saving your settings");
        }
    };

    const toggleReadReceipts = async () => {
        try {
            await mutate(
                axiosInstance.post("settings/toggle-read-receipts", {
                    readReceipts: !user?.settings?.readReceipts ?? true,
                }),
                {
                    optimisticData: {
                        deviceId,
                        user: {
                            ...user!,
                            settings: {
                                ...user!.settings!,
                                readReceipts: !user?.settings?.readReceipts,
                            },
                        },
                    },
                    populateCache: false,
                    revalidate: false,
                    rollbackOnError: true,
                },
            );
        } catch (e) {
            toast.error("An error occurred while saving your settings");
        }
    };

    return (
        <VStack align="start" width="full" p={2} spacing={6}>
            <Text fontSize="xl" fontWeight="bold">
                Messaging
            </Text>
            <VStack width="full" align="start" spacing={4}>
                <HStack width="full" justify="space-between">
                    <Text fontSize="lg">Allow Anyone to Message You</Text>
                    <Switch
                        isChecked={user?.settings?.allowAllDMs}
                        onChange={toggleAllowAllDMs}
                    />
                </HStack>
                <HStack width="full" justify="space-between">
                    <Text fontSize="lg">Read receipts</Text>
                    <Switch
                        isChecked={user?.settings?.readReceipts}
                        onChange={toggleReadReceipts}
                    />
                </HStack>
            </VStack>
        </VStack>
    );
}
