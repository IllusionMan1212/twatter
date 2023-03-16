import { ReactElement } from "react";

interface UnreadIndicatorProps {
    position: string;
    count: number;
}

export default function UnreadIndicator({
    position,
    count,
}: UnreadIndicatorProps): ReactElement | null {
    if (count === 0) return null;

    return (
        <div
            className={`absolute ${position} bg-[#983040] min-h-[20px] min-w-[20px] px-1 flex justify-center items-center rounded-full`}
        >
            <span className="text-sm text-white">
                {(count ?? 0) > 99 ? "99+" : count}
            </span>
        </div>
    );
}
