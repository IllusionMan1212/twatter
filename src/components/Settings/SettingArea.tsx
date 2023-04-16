import { IconButton, Icon } from "@chakra-ui/react";
import { ArrowNarrowLeftIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import { SettingItem } from "src/types/interfaces";

interface SettingAreaProps {
    settingItem: SettingItem;
}

export default function SettingArea({ settingItem }: SettingAreaProps): ReactElement {
    const router = useRouter();

    return (
        <div className="flex flex-col rounded w-full fixed lg:relative top-0 right-0 z-[3] lg:z-[unset] bg-[color:var(--chakra-colors-bgPrimary)] h-[100vh] lg:h-[calc(100vh_-_var(--chakra-headerHeight-desktop)_-_var(--chakra-space-5))]">
            <div className="flex w-full px-3 py-2 shadow-[0_2px_2px_rgba(0,0,0,0.07)]">
                <div className="flex gap-2 w-full items-center">
                    <IconButton
                        variant="ghost"
                        display={{ base: "flex", lg: "none" }}
                        aria-label="Back button"
                        icon={<Icon as={ArrowNarrowLeftIcon} w="28px" h="28px" />}
                        onClick={() => router.back()}
                    />
                    <p className="font-bold text-xl lg:text-2xl">
                        {settingItem.title}
                    </p>
                </div>
            </div>
            <div className="flex flex-col grow-1 overflow-y-scroll gap-5 w-full px-3 py-2">
                <settingItem.settings />
            </div>
        </div>
    );
}
