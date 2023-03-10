import { ReactElement } from "react";

interface FullDateProps {
    ISODate: string;
}

export default function FullDate({ ISODate }: FullDateProps): ReactElement {
    const date = new Date(ISODate);

    const finalDate = `${date.toLocaleDateString()} · ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    })}`;

    return (
        <p className="text-sm text-[color:var(--chakra-colors-textMain)]">{finalDate}</p>
    );
}
