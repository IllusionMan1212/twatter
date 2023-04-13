import { Button } from "@chakra-ui/react";
import SmileyXEyes from "@phosphor-icons/react/dist/icons/SmileyXEyes";
import React, { ErrorInfo, ReactElement, ReactNode } from "react";

interface ErrorFallbackProps {
    resetState: () => void;
}

function ErrorFallback({ resetState }: ErrorFallbackProps): ReactElement {
    return (
        <div className="flex flex-col gap-5 items-center p-10">
            <div className="flex flex-col gap-2 items-center">
                <SmileyXEyes size={140} color="var(--chakra-colors-red-400)" />
                <h1 className="text-2xl uppercase text-center font-bold">Something Went Wrong</h1>
                <p className="text-center">It seems like Twatter exploded, try clicking on the button below to reset the app</p>
            </div>
            <Button colorScheme="button" onClick={resetState}>
                Reset Application
            </Button>
        </div>
    );
}

interface ErrorBoundaryProps {
    children?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = {
        hasError: false,
    };

    constructor(props: ErrorBoundaryProps) {
        super(props);

        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // TODO: use sentry or something to report client errors
        console.error("Uncaught error:", error, errorInfo);
    }

    resetState() {
        this.setState({
            hasError: false,
        });
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback resetState={() => this.resetState()} />;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
