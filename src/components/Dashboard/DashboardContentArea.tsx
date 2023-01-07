import { HStack, Icon, IconButton, VStack, Text } from "@chakra-ui/react";
import { ArrowNarrowLeftIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import { DashboardItem } from "src/types/interfaces";

interface DashboardContentAreaProps {
    item: DashboardItem;
}

export default function DashboardContentArea({
    item,
}: DashboardContentAreaProps): ReactElement {
    const router = useRouter();

    return (
        <VStack spacing={5} width="full" px={{ base: 3, md: 0 }}>
            <HStack
                width="full"
                borderBottom="1px solid var(--chakra-colors-bgSecondary)"
                borderColor="inherit"
            >
                <IconButton
                    variant="ghost"
                    aria-label="Back button"
                    icon={<Icon as={ArrowNarrowLeftIcon} w="28px" h="28px" />}
                    onClick={() => router.back()}
                />
                <Text fontWeight="semibold">{item.title}</Text>
            </HStack>
            <item.component />
        </VStack>
    );
}
