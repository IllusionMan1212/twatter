import dynamic from "next/dynamic";
import { Divider } from "@chakra-ui/react";
import { ReactElement, useEffect, useState } from "react";
import { useRouter } from "next/router";
import BellSimple from "@phosphor-icons/react/dist/icons/BellSimple";
import ShieldCheck from "@phosphor-icons/react/dist/icons/ShieldCheck";
import UserGear from "@phosphor-icons/react/dist/icons/UserGear";
import Devices from "@phosphor-icons/react/dist/icons/Devices";
import { LockClosedIcon } from "@heroicons/react/solid";
import { SettingItem } from "src/types/interfaces";
import SettingsItem from "src/components/Settings/SettingsItem";
import SettingArea from "src/components/Settings/SettingArea";
import NotificationsSettings from "src/components/Settings/NotificationsSettings";
const ProfileSettings = dynamic(() => import("src/components/Settings/ProfileSettings"));
const PrivacySettings = dynamic(() => import("src/components/Settings/PrivacySettings"));
const SecuritySettings = dynamic(
    () => import("src/components/Settings/SecuritySettings"),
);
const DevicesSettings = dynamic(() => import("src/components/Settings/DevicesSettings"));

const UserGearIcon = () => {
    return <UserGear weight="fill" size="24" />;
};

const ShieldCheckIcon = () => {
    return <ShieldCheck weight="fill" size="24" />;
};

const BellIcon = () => {
    return <BellSimple weight="fill" size="24" />;
};

const DevicesIcon = () => {
    return <Devices weight="fill" size="24" />;
};

const settings = [
    {
        id: "profile",
        title: "Profile",
        icon: UserGearIcon,
        desc: "Edit and manage your profile settings",
        settings: ProfileSettings,
    },
    {
        id: "privacy",
        title: "Privacy",
        icon: LockClosedIcon,
        desc: "Control what information about your account is public",
        settings: PrivacySettings,
    },
    {
        id: "notifications",
        title: "Notifications",
        icon: BellIcon,
        desc: "Customize how and where you receive notifications and fine-tune them to your liking",
        settings: NotificationsSettings,
    },
    {
        id: "security",
        title: "Security",
        icon: ShieldCheckIcon,
        desc: "Strengthen your account's security with additional measures",
        settings: SecuritySettings,
    },
    {
        id: "devices",
        title: "Devices",
        icon: DevicesIcon,
        desc: "Manage and monitor the active sessions of your logged in devices",
        settings: DevicesSettings,
    }
];

export default function Settings(): ReactElement {
    const [activeSetting, setActiveSetting] = useState<SettingItem | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (router.query.setting?.[0] === activeSetting?.id) {
            return;
        }

        if (!router.query.setting?.[0]) {
            setActiveSetting(null);
            return;
        }

        if (router.query.setting?.[0]) {
            setActiveSetting(
                settings.find((setting) => setting.id === router.query.setting![0]) ??
                    null,
            );
        }
    }, [router.query.setting]);

    return (
        <div className="flex gap-10 relative">
            <div
                className="flex gap-4 flex-col items-center flex-[4] h-[calc(100vh_-_var(--chakra-headerHeight-mobile)_-_var(--chakra-navBarHeight))] lg:calc(100vh_-_var(--chakra-headerHeight-desktop)_-_2.5rem)"
            >
                <div className="lg:flex flex-col items-start w-full gap-2 hidden">
                    <div className="flex w-full justify-between">
                        <p className="text-xl font-semibold">
                            Settings
                        </p>
                    </div>
                    <Divider height="1px" bgColor="bgSecondary" />
                </div>
                <div className="flex flex-col w-full items-start md:gap-1 overflow-y-scroll">
                    {settings.map((setting) => (
                        <SettingsItem
                            key={setting.id}
                            title={setting.title}
                            icon={setting.icon}
                            isActive={setting.id === activeSetting?.id}
                            desc={setting.desc}
                            onClick={() => {
                                if (router.query.setting?.[0] !== setting.id) {
                                    router.push(`/settings/${setting.id}`);
                                }
                            }}
                        />
                    ))}
                </div>
            </div>
            <div className={`flex-col flex-[7] ${activeSetting ? "flex" : "hidden"} lg:flex gap-2 items-center`}>
                {activeSetting && <SettingArea settingItem={activeSetting} />}
            </div>
        </div>
    );
}
