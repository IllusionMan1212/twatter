import { Icon, IconButton } from "@chakra-ui/react";
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
        <div className="flex flex-col gap-5 w-full items-center px-3 md:px-0">
            <div className="flex w-full items-center gap-2 border-b-[1px] border-[color:inherit]">
                <IconButton
                    variant="ghost"
                    aria-label="Back button"
                    icon={<Icon as={ArrowNarrowLeftIcon} w="28px" h="28px" />}
                    onClick={() => router.back()}
                />
                <p className="font-semibold">{item.title}</p>
            </div>
            <item.component />
        </div>
    );
}
