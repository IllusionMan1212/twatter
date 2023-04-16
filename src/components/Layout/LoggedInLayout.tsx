import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { PropsWithChildren, ReactElement, useEffect } from "react";
import Nav from "src/components/Nav/Nav";
import { useUserContext } from "src/contexts/userContext";
import Sidebar from "src/components/Sidebar";
import { NovuProvider } from "@novu/notification-center";
import { LoggedInHeader, LoggedOutHeader } from "src/components/Header";
const JoinReminder = dynamic(() => import("src/components/JoinReminder"));

const adminRoutes = ["/dashboard/[[...item]]"];

const fullScreenRoutes = [
    "/settings/[[...setting]]",
    "/messages/[[...conversationId]]",
    "/u/[username]/[postId]",
];

const nonSidebarRoutes = [
    "/messages/[[...conversationId]]",
    "/dashboard/[[...item]]",
    "/settings/[[...setting]]",
];

const guestRoutes = [
    "/u/[username]",
    "/u/[username]/[postId]",
];

export default function LoggedInLayout({ children }: PropsWithChildren): ReactElement {
    const { user } = useUserContext();

    const router = useRouter();

    const fullScreenRoute = fullScreenRoutes.includes(router.pathname);
    const isGuest = !user && guestRoutes.includes(router.pathname);

    const hasSidebar = !nonSidebarRoutes.includes(router.pathname) && user;
    const withEvents = router.pathname !== "/events";

    useEffect(() => {
        if (user === null && !guestRoutes.includes(router.pathname)) {
            router.replace("/login");
            return;
        }

        if (adminRoutes.includes(router.pathname) && !user?.isAdmin) {
            router.replace("/home");
            return;
        }
    }, [user]);

    return (
        <NovuProvider
            subscriberId={user?.id}
            subscriberHash={user?.notificationSubHash}
            applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_APP_ID ?? ""}
            initialFetchingStrategy={{ fetchNotifications: true, fetchUserPreferences: true, fetchUnseenCount: true }}
        >
            {isGuest ? <LoggedOutHeader /> : <LoggedInHeader />}
            <div
                className="max-w-full md:max-w-[90rem] px-0 md:px-4 mx-auto"
            >
                <div className="flex relative items-start md:gap-12 lg:gap-16 xl:gap-24">
                    <Nav />
                    <div
                        className={`flex flex-[7] basis-[70%] gap-10 relative mt-initial md:mt-5 max-w-full min-w-0 ${!isGuest ? "mb-[var(--chakra-navBarHeight)] md:mb-0" : ""} ${fullScreenRoute ? "md:mb-0" : "md:mb-5"}`}
                    >
                        <div className="flex-[7] max-w-full min-w-0">
                            {children}
                        </div>
                        {hasSidebar ? <Sidebar withEvents={withEvents} /> : null}
                        {isGuest ? <JoinReminder /> : null}
                    </div>
                </div>
            </div>
        </NovuProvider>
    );
}
