import { Tooltip } from "@chakra-ui/react";
import { ReactElement } from "react";

interface CharsRemainingProps {
    charsLeft: number;
    className?: string;
    type: "Post" | "Message";
}

export default function CharsRemaining({ charsLeft, type, className }: CharsRemainingProps): ReactElement | null {
    if (charsLeft < 30)
        return (
            <div className={className}>
                <Tooltip label={charsLeft >= 0 ? `${charsLeft} characters remaining` : `${type} is too long`}>
                    <p
                        className={`text-sm ${
                            charsLeft < 0 ? "text-[color:var(--chakra-colors-red-400)]" : ""
                        }`}
                    >
                        {charsLeft}
                    </p>
                </Tooltip>
            </div>
        );

    return null;
}
