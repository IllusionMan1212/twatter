import Router from "next/router";
import { ReactElement, useEffect } from "react";
import { useUserContext } from "src/contexts/userContext";
import { PageProps } from "src/pages/_app";

interface Props {
    children: ReactElement<PageProps>;
}

export default function LoggedOutLayout({ children }: Props): ReactElement {
    const { user } = useUserContext();

    useEffect(() => {
        if (user && !children.props.notFoundPage) {
            Router.replace("/home");
        }
    }, [user]);

    if (user && !children.props.notFoundPage) return <></>;

    return <>{children}</>;
}
