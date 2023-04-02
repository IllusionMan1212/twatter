import dynamic from "next/dynamic";
import { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/provider";

import theme from "src/theme";
import { UserWrapper } from "src/contexts/userContext";
import LoggedOutLayout from "src/components/Layout/LoggedOutLayout";
import LoggedInLayout from "src/components/Layout/LoggedInLayout";
import SEO from "../../next-seo.config";
const Fonts = dynamic(() => import("src/components/Fonts"));
const Toaster = dynamic(() => import("react-hot-toast").then((t) => t.Toaster), { ssr: false });

import "src/styles/global.scss";
import "swiper/scss";
import "swiper/scss/navigation";
import "swiper/scss/pagination";
import "swiper/scss/zoom";
import { DefaultSeo } from "next-seo";
import ErrorBoundary from "src/components/ErrorFallback";

export interface PageProps {
    noAuthPage: boolean;
    notFoundPage: boolean;
}

function Twatter({ Component, pageProps }: AppProps<PageProps>) {
    return (
        <>
            <DefaultSeo {...SEO} />
            <ChakraProvider theme={theme}>
                <UserWrapper>
                    <Toaster
                        toastOptions={{
                            style: {
                                backgroundColor: "var(--chakra-colors-bgThird)",
                                color: "white",
                            },
                        }}
                    />
                    <Fonts />
                    {Component.defaultProps?.noAuthPage ? (
                        <LoggedOutLayout>
                            <ErrorBoundary>
                                <Component {...pageProps} />
                            </ErrorBoundary>
                        </LoggedOutLayout>
                    ) : (
                        <LoggedInLayout>
                            <ErrorBoundary>
                                <Component {...pageProps} />
                            </ErrorBoundary>
                        </LoggedInLayout>
                    )}
                </UserWrapper>
            </ChakraProvider>
        </>
    );
}

export default Twatter;
