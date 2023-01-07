import { Box, Button, Flex, HStack, Icon, Text } from "@chakra-ui/react";
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
            <Box
                display={isActive ? "initial" : "none"}
                position="absolute"
                top={0}
                left={0}
                height="full"
                width="6px"
                rounded="4px 0 0 4px"
                bgColor="accent.500"
            />
            <HStack>
                <Icon as={icon} h="24px" w="24px" />
                <Text fontWeight="semibold">{title}</Text>
            </HStack>
            <Text fontSize="xs" whiteSpace="normal" color="textMain">
                {desc}
            </Text>
        </Flex>
    );
}
