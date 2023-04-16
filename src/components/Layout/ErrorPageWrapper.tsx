import { ReactElement } from "react";
import { useUserContext } from "src/contexts/userContext";
import { PageProps } from "src/pages/_app";
import { LoggedInHeader, LoggedOutHeader } from "src/components/Header";
import { NovuProvider } from "@novu/notification-center";
import Nav from "src/components/Nav/Nav";

interface Props {
    children: ReactElement<PageProps>;
}

export default function LoggedOutLayout({ children }: Props): ReactElement {
    const { user } = useUserContext();

    return (
        <NovuProvider
            subscriberId={user?.id}
            subscriberHash={user?.notificationSubHash}
            applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_APP_ID ?? ""}
            initialFetchingStrategy={{ fetchNotifications: true, fetchUserPreferences: true, fetchUnseenCount: true }}
        >
            {user ? <LoggedInHeader /> : <LoggedOutHeader />}
            <div
                className="max-w-full md:max-w-[90rem] px-0 md:px-4 mx-auto"
            >
                <div className="flex relative items-start md:gap-12 lg:gap-16 xl:gap-24">
                    <Nav />
                    <div
                        className="flex-1 basis-[70%] gap-10 relative mt-initial md:mt-5 max-w-full min-w-0"
                    >
                        <div className="flex-1 max-w-full min-w-0">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </NovuProvider>
    );
}
