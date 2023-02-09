import dynamic from "next/dynamic";
import { Divider, Flex, VStack, Text, HStack } from "@chakra-ui/react";
import { ReactElement, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { BellSimple, ShieldCheck, UserGear } from "phosphor-react";
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

const UserGearIcon = () => {
    return <UserGear weight="fill" size="24" />;
};

const ShieldCheckIcon = () => {
    return <ShieldCheck weight="fill" size="24" />;
};

const BellIcon = () => {
    return <BellSimple weight="fill" size="24" />;
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
        <Flex gap="10" position="relative">
            <Flex
                gap={4}
                direction="column"
                height={{
                    base: "calc(100vh - var(--chakra-headerHeight-mobile) - var(--chakra-navBarHeight))",
                    lg: "calc(100vh - var(--chakra-headerHeight-desktop) - 2.5rem)"
                }}
                align="center"
                flex="4"
            >
                <VStack
                    display={{ base: "none", lg: "initial" }}
                    align="start"
                    width="full"
                >
                    <HStack width="full" justify="space-between">
                        <Text fontSize="xl" fontWeight="semibold">
                            Settings
                        </Text>
                    </HStack>
                    <Divider height="1px" bgColor="bgSecondary" />
                </VStack>
                <VStack
                    width="full"
                    overflowY="scroll"
                    spacing={{ base: 0, md: 1 }}
                    align="start"
                >
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
                </VStack>
            </Flex>
            <VStack
                display={{
                    base: activeSetting ? "initial" : "none",
                    lg: "initial",
                }}
                flex="7"
            >
                {activeSetting && <SettingArea settingItem={activeSetting} />}
            </VStack>
        </Flex>
    );
}
