import { Spinner } from "@chakra-ui/react";
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
        <div className="flex flex-col gap-6 items-start w-full p-2">
            <div className="flex flex-col w-full gap-3">
                <div className="flex w-full justify-between">
                    <p className="text-xl font-bold">
                        In-App
                    </p>
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
                                <p className="text-xs text-[color:var(--chakra-colors-textMain)]">Critical preferences cannot be changed</p>
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex w-full gap-2 items-center justify-between">
                <p className="text-xl font-bold">
                    Email
                </p>
                <Switch
                    isChecked={emailEnabled}
                    isDisabled
                />
            </div>
            {emailEnabled ? (
                <div className="flex gap-4 items-start w-full">
                    <div className="flex gap-2 items-center w-full justify-between">
                        <p className="text-lg">Allow Anyone to Message You</p>
                        <Switch
                            isChecked={false}
                            isDisabled
                        />
                    </div>
                    <div className="flex gap-2 items-center w-full justify-between">
                        <p className="text-lg">Read receipts</p>
                        <Switch
                            isChecked={false}
                            isDisabled
                        />
                    </div>
                </div>
            ) : null}
            <div className="flex gap-2 items-center w-full justify-between">
                <p className="text-xl font-bold">
                    Push
                </p>
                <Switch
                    isChecked={pushEnabled}
                    isDisabled
                />
            </div>
            {pushEnabled ? (
                <div className="flex flex-col gap-4 items-start w-full">
                    <div className="flex gap-2 items-center w-full justify-between">
                        <p className="text-xl">Allow Anyone to Message You</p>
                        <Switch
                            isChecked={false}
                            isDisabled
                        />
                    </div>
                    <div className="flex gap-2 items-center w-full justify-between">
                        <p className="text-lg">Read receipts</p>
                        <Switch
                            isChecked={false}
                            isDisabled
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}
