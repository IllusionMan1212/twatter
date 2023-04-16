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
        <div className="flex flex-col gap-6 p-2 items-start w-full">
            <p className="text-xl font-bold">
                Messaging
            </p>
            <div className="flex flex-col gap-4 items-start w-full">
                <div className="flex gap-2 items-center w-full justify-between">
                    <p className="text-lg">Allow Anyone to Message You</p>
                    <Switch
                        isChecked={user?.settings?.allowAllDMs}
                        onChange={toggleAllowAllDMs}
                    />
                </div>
                <div className="flex gap-2 items-center w-full justify-between">
                    <p className="text-lg">Read receipts</p>
                    <Switch
                        isChecked={user?.settings?.readReceipts}
                        onChange={toggleReadReceipts}
                    />
                </div>
            </div>
        </div>
    );
}
