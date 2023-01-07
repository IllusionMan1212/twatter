import { Flex, IconButton, VStack, Text, Icon } from "@chakra-ui/react";
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
        <VStack
            spacing={0}
            height={{
                base: "100vh",
                lg: "calc(100vh - var(--chakra-headerHeight-desktop) - var(--chakra-space-5))",
            }}
            bgColor="bgPrimary"
            rounded="4px"
            width="full"
            position={{ base: "fixed", lg: "relative" }}
            top={0}
            right={0}
            zIndex={3}
        >
            <Flex width="full" px={3} py={2} boxShadow="conversationHeader">
                <Flex gap={2} width="full" align="center">
                    <IconButton
                        variant="ghost"
                        display={{ base: "flex", lg: "none" }}
                        aria-label="Back button"
                        icon={<Icon as={ArrowNarrowLeftIcon} w="28px" h="28px" />}
                        onClick={() => router.back()}
                    />
                    <Text fontWeight="bold" fontSize={{ base: "xl", lg: "2xl" }}>
                        {settingItem.title}
                    </Text>
                </Flex>
            </Flex>
            <Flex
                flexGrow={1}
                overflowY="scroll"
                gap={5}
                direction="column"
                width="full"
                px={3}
                py={2}
            >
                <settingItem.settings />
            </Flex>
        </VStack>
    );
}
