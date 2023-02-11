import { VStack, Text, HStack, Spinner } from "@chakra-ui/react";
import { useFetchUserPreferences, useUpdateUserPreferences } from "@novu/notification-center";
import { ReactElement, useEffect, useState } from "react";
import Switch from "src/components/Controls/Switch";
import toast from "react-hot-toast";

interface Preference {
    id: string;
    name: string;
    critical: boolean;
    enabled: boolean;
}

export default function NotificationsSettings(): ReactElement {
    const { data, isLoading } = useFetchUserPreferences();
    const { updateUserPreferences } = useUpdateUserPreferences({
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const [inAppEnabled, setInAppEnabled] = useState(false);
    const [inAppPreferences, setInAppPreferences] = useState<Preference[]>([]);
    const [emailEnabled] = useState(false);
    const [pushEnabled] = useState(false);

    const updatePreference = (prefId: string, channelType: string, enabled: boolean) => {
        updateUserPreferences({
            templateId: prefId,
            channelType,
            checked: enabled
        });
    };

    const toggleInAppPreferences = () => {
        for (const pref of inAppPreferences) {
            updateUserPreferences({
                templateId: pref.id,
                channelType: "in_app",
                checked: !inAppEnabled
            });
        }
    };

    useEffect(() => {
        setInAppEnabled(inAppPreferences.some(pref => pref.enabled));
    }, [inAppPreferences]);

    useEffect(() => {
        if (data) {
            setInAppPreferences(data.map((pref) => {
                return {
                    id: pref.template._id,
                    name: pref.template.name,
                    critical: pref.template.critical,
                    enabled: pref.preference.channels.in_app ?? false,
                };
            }));
        }
    }, [data]);

    return (
        <VStack align="start" width="full" p={2} spacing={6}>
            <div className="flex flex-col w-full gap-3">
                <div className="flex w-full justify-between">
                    <Text fontSize="xl" fontWeight="bold">
                        In-App
                    </Text>
                    <Switch
                        isChecked={inAppEnabled}
                        isDisabled={isLoading}
                        onChange={toggleInAppPreferences}
                    />
                </div>
                <div className="flex flex-col mx-4 items-stretch gap-2">
                    {isLoading ? (
                        <div className="flex w-full justify-center">
                            <Spinner />
                        </div>
                    ) : null}
                    {inAppPreferences.map((pref) => (
                        <div className="flex flex-col" key={pref.name}>
                            <div className="flex w-full justify-between">
                                <p>{pref.name}</p>
                                <Switch
                                    isChecked={pref.enabled}
                                    isDisabled={pref.critical}
                                    onChange={() => updatePreference(pref.id, "in_app", !pref.enabled)}
                                />
                            </div>
                            {pref.critical ? (
                                <Text fontSize="xs" color="textMain">Critical preferences cannot be changed</Text>
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
            <HStack width="full" justify="space-between">
                <Text fontSize="xl" fontWeight="bold">
                    Email
                </Text>
                <Switch
                    isChecked={emailEnabled}
                    isDisabled
                />
            </HStack>
            {emailEnabled ? (
                <VStack width="full" align="start" spacing={4}>
                    <HStack width="full" justify="space-between">
                        <Text fontSize="lg">Allow Anyone to Message You</Text>
                        <Switch
                            isChecked={false}
                            isDisabled
                        />
                    </HStack>
                    <HStack width="full" justify="space-between">
                        <Text fontSize="lg">Read receipts</Text>
                        <Switch
                            isChecked={false}
                            isDisabled
                        />
                    </HStack>
                </VStack>
            ) : null}
            <HStack width="full" justify="space-between">
                <Text fontSize="xl" fontWeight="bold">
                    Push
                </Text>
                <Switch
                    isChecked={pushEnabled}
                    isDisabled
                />
            </HStack>
            {pushEnabled ? (
                <VStack width="full" align="start" spacing={4}>
                    <HStack width="full" justify="space-between">
                        <Text fontSize="lg">Allow Anyone to Message You</Text>
                        <Switch
                            isChecked={false}
                            isDisabled
                        />
                    </HStack>
                    <HStack width="full" justify="space-between">
                        <Text fontSize="lg">Read receipts</Text>
                        <Switch
                            isChecked={false}
                            isDisabled
                        />
                    </HStack>
                </VStack>
            ) : null}
        </VStack>
    );
}
