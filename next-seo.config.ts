import { DefaultSeoProps } from "next-seo";


const defaultConfig: DefaultSeoProps = {
    title: "Twatter",
    description: "A social platform.",
    canonical: "https://twatter.social",
    openGraph: {
        title: "Twatter",
        description: "A social platform.",
        type: "website",
        locale: "en_US",
        url: "https://twatter.social",
        siteName: "Twatter",
        images: [
            {
                url: "https://twatter.social/android-chrome-192x192.png",
            },
        ]
    },
    twitter: {
        cardType: "summary_large_image"
    },
    themeColor: "#6067FE",
    additionalMetaTags: [
        {
            property: "charset",
            content: "utf-8"
        },
        {
            name: "viewport",
            content: "width=device-width, initial-scale=1",
        },
        {
            name: "keywords",
            content: "social media, social platform, community",
        },
        {
            name: "copyright",
            content: "Twatter"
        },
        {
            name: "mobile-web-app-capable",
            content: "yes"
        },
        {
            name: "apple-mobile-web-app-title",
            content: "Twatter",
        },
        {
            name: "apple-mobile-web-app-status-bar-style",
            content: "black",
        },
        {
            name: "msapplication-TileColor",
            content: "#151515",
        }
    ],
    additionalLinkTags: [
        {
            rel: "icon",
            type: "image/png",
            sizes: "512x512",
            href: "/android-chrome-512x512.png",
        },
        {
            rel: "icon",
            type: "image/png",
            sizes: "192x192",
            href: "/android-chrome-192x192.png",
        },
        {
            rel: "apple-touch-icon",
            sizes: "180x180",
            href: "/apple-touch-icon.png",
        },
        {
            rel: "icon",
            type: "image/png",
            sizes: "32x32",
            href: "/favicon-32x32.png",
        },
        {
            rel: "icon",
            type: "image/png",
            sizes: "16x16",
            href: "/favicon-16x16.png",
        },
        {
            rel: "manifest",
            href: "/site.manifest",
        },
        {
            rel: "mask-icon",
            href: "/safari-pinned-tab.svg",
            color: "#6067fe",
        }
    ],
};

export const homeSEO: DefaultSeoProps = {
    title: "Home - Twatter",
    canonical: "https://twatter.social/home",
    openGraph: {
        url: "https://twatter.social/home",
        title: "Home - Twatter",
    },
};

export const resetPasswordSEO: DefaultSeoProps = {
    title: "Reset Password - Twatter",
    canonical: "https://twatter.social/reset-password",
    openGraph: {
        url: "https://twatter.social/reset-password",
        title: "Reset Password - Twatter",
    },
};

export const forgotPasswordSEO: DefaultSeoProps = {
    title: "Forgot Password - Twatter",
    canonical: "https://twatter.social/forgot-password",
    openGraph: {
        url: "https://twatter.social/forgot-password",
        title: "Forgot Password - Twatter",
    },
};

export const registerSEO: DefaultSeoProps = {
    title: "Register - Twatter",
    canonical: "https://twatter.social/register",
    openGraph: {
        url: "https://twatter.social/register",
        title: "Register - Twatter",
    },
};

export const loginSEO: DefaultSeoProps = {
    title: "Login - Twatter",
    canonical: "https://twatter.social/login",
    openGraph: {
        url: "https://twatter.social/login",
        title: "Login - Twatter",
    },
};

export const eventsSEO: DefaultSeoProps = {
    title: "Events - Twatter",
    description: "Find events that interest you on Twatter",
    canonical: "https://twatter.social/events",
    openGraph: {
        url: "https://twatter.social/events",
        title: "Events - Twatter",
        description: "Find events that interest you on Twatter",
    },
};

export const searchSEO: DefaultSeoProps = {
    title: "Search - Twatter",
    description: "Search for people and posts on Twatter",
    canonical: "https://twatter.social/search",
    openGraph: {
        url: "https://twatter.social/search",
        title: "Search - Twatter",
        description: "Search for people and posts on Twatter",
    },
};

export const messagesSEO: DefaultSeoProps = {
    title: "Messages - Twatter",
    description: "Check your direct messages and communicate with new people",
    canonical: "https://twatter.social/messages",
    openGraph: {
        title: "Messages - Twatter",
        description: "Check your direct messages and communicate with new people",
        url: "https://twatter.social/messages",
    }
};

export default defaultConfig;
