import { ReactElement } from "react";

export default function JoinReminder(): ReactElement {
    return (
        <div className="hidden lg:flex flex-col flex-[3.5] rounded-md gap-5 p-5 sticky top-20 max-h-[170px] bg-[color:var(--chakra-colors-bgPrimary)]">
            <p className="text-xl font-semibold">Join Twatter</p>
            <p className="text-sm">Consider signing up to Twatter to interact with and talk to your friends, family and favorite people</p>
        </div>
    );
}
