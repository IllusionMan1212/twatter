import { Button, Flex, Icon } from "@chakra-ui/react";
import { ComponentProps, MouseEventHandler, ReactElement } from "react";
import { SettingItem } from "src/types/interfaces";

interface SettingsItemProps extends Omit<SettingItem, "settings" | "id"> {
    icon: (props: ComponentProps<"svg">) => ReactElement;
    desc: string;
    isActive: boolean;
    onClick: MouseEventHandler<HTMLElement>;
}

export default function SettingsItem({
    title,
    icon,
    desc,
    isActive,
    onClick,
}: SettingsItemProps): ReactElement {
    return (
        <Flex
            as={Button}
            borderBottom={{
                base: "2px solid var(--chakra-colors-bgSecondary)",
                md: "initial",
            }}
            _last={{
                borderBottom: "none",
            }}
            direction="column"
            gap="3"
            align="start"
            textAlign="left"
            width="full"
            height="full"
            bgColor={isActive ? "conversationItem" : "conversationItem"}
            colorScheme="conversationItem"
            color="text"
            p={4}
            rounded={{ base: 0, md: "4px" }}
            onClick={onClick}
        >
            <div className={`${isActive ? "block" : "hidden"} absolute top-0 left-0 h-full w-[6px] rounded-[4px_0_0_4px] bg-[color:var(--chakra-colors-accent-500)]`}/>
            <div className="flex gap-2 items-center">
                <Icon as={icon} h="24px" w="24px" />
                <p className="font-semibold">{title}</p>
            </div>
            <p className="text-xs whitespace-normal text-[color:var(--chakra-colors-textMain)]">
                {desc}
            </p>
        </Flex>
    );
}
