import { ReactElement, PropsWithChildren } from "react";

export default function ModalHeader({ children }: PropsWithChildren): ReactElement {
    return (
        <header className="text-xl font-semibold px-6 py-4">
            {children}
        </header>
    );
}
