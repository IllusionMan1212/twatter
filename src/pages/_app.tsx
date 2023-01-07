import dynamic from "next/dynamic";
import { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/provider";

import theme from "src/theme";
import { UserWrapper } from "src/contexts/userContext";
import LoggedOutLayout from "src/components/Layout/LoggedOutLayout";
import LoggedInLayout from "src/components/Layout/LoggedInLayout";
import Header from "src/components/Header";
import SEO from "../../next-seo.config";
const Fonts = dynamic(() => import("src/components/Fonts"));
const Toaster = dynamic(() => import("react-hot-toast").then((t) => t.Toaster));

import "src/styles/global.scss";
import "swiper/scss";
import "swiper/scss/navigation";
import "swiper/scss/pagination";
import "swiper/scss/zoom";
import { DefaultSeo } from "next-seo";
import Head from "next/head";

export interface PageProps {
    noAuthPage: boolean;
    notFoundPage: boolean;
}

function MyApp({ Component, pageProps }: AppProps<PageProps>) {
    return (
        <>
            <DefaultSeo {...SEO} />
            <Head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta
                    name="keywords"
                    content="social media, social platform, community"
                />
                <meta name="copyright" content="Twatter" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-title" content="Twatter" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black" />
                <meta name="theme-color" content="#6067FE" />

                <meta
                    name="google-site-verification"
                    content="3KdsfNqPVXfzkXL-s_aZF58J1fqLuoojTN47XEkyf2Q"
                />

                <link
                    rel="icon"
                    type="image/png"
                    sizes="512x512"
                    href="/android-chrome-512x512.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="192x192"
                    href="/android-chrome-192x192.png"
                />
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/apple-touch-icon.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/favicon-32x32.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="/favicon-16x16.png"
                />
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#6067fe" />
                <meta name="msapplication-TileColor" content="#151515" />
                <meta name="theme-color" content="#6067fe" />
            </Head>
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
                    <Header />
                    {Component.defaultProps?.noAuthPage ? (
                        <LoggedOutLayout>
                            <Component {...pageProps} />
                        </LoggedOutLayout>
                    ) : (
                        <LoggedInLayout>
                            <Component {...pageProps} />
                        </LoggedInLayout>
                    )}
                </UserWrapper>
            </ChakraProvider>
        </>
    );
}

export default MyApp;
