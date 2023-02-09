import { useUnseenCount } from "@novu/notification-center";
import { ReactElement } from "react";

interface UnreadIndicatorProps {
    position: string;
}

export default function UnreadIndicator({ position }: UnreadIndicatorProps): ReactElement | null {
    const { data, isLoading } = useUnseenCount();

    if (isLoading || data?.count === 0) return null;

    return (
        <div className={`absolute ${position} bg-[#983040] min-h-[20px] min-w-[20px] px-1 flex justify-center items-center rounded-full`}>
            <span className="text-sm text-white">{(data?.count ?? 0) > 99 ? "99+" : data?.count}</span>
        </div>
    );
}
