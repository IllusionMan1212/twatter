import dynamic from "next/dynamic";
import { HStack, Box, Button } from "@chakra-ui/react";
import Router, { useRouter } from "next/router";
import { ComponentType, ReactElement, useEffect, useState } from "react";
import AllResults from "src/components/Search/AllResults";
import UsersResults from "src/components/Search/UsersResults";
import EventsResults from "src/components/Search/EventsResults";
import { SearchResultsTabProps } from "src/types/interfaces";
import { NextSeo } from "next-seo";
import { searchSEO } from "next-seo.config";
const SearchBar = dynamic(() => import("src/components/Search/SearchBar"));

enum Tabs {
    All = "all",
    Users = "users",
    Events = "events",
}

interface TabData {
    [tab: string]: ComponentType<SearchResultsTabProps>;
}

const tabData: TabData = {
    [Tabs.All]: AllResults,
    [Tabs.Users]: UsersResults,
    [Tabs.Events]: EventsResults,
};

const tabs = [...Object.values(Tabs)];

interface TabProps {
    text: string;
    isActive: boolean;
}

function Tab({ text, isActive }: TabProps): ReactElement {
    return (
        <Box
            as={Button}
            px={5}
            height={9}
            rounded="8px 8px 0 0"
            colorScheme={isActive ? "accent" : "navItem"}
            color={isActive ? "textOpposite" : "text"}
            minWidth="fit-content"
            onClick={() => Router.replace(`/search?q=${Router.query.q}&type=${text}`)}
        >
            <p className={isActive ? "font-semibold" : "font-normal"}>
                {text.charAt(0).toUpperCase() + text.slice(1)}
            </p>
        </Box>
    );
}

interface TabBarProps {
    activeTab: Tabs;
}

function TabBar({ activeTab }: TabBarProps): ReactElement {
    return (
        <HStack
            overflowX="scroll"
            width="full"
            sx={{ "::-webkit-scrollbar": { display: "none" } }}
            borderBottom="1px solid var(--chakra-colors-bgSecondary)"
        >
            {tabs.map((tab, i) => (
                <Tab key={i} text={tab} isActive={activeTab === tab} />
            ))}
        </HStack>
    );
}

function NoSearch(): ReactElement {
    return (
        <div className="flex flex-col gap-5 w-full items-center">
            <img
                className="object-cover"
                width="250px"
                src="/graphics/Coming_Soon.avif"
                alt="List is empty graphic"
            />
            <div className="flex flex-col gap-1 text-center items-center">
                <p className="text-3xl font-bold">
                    Looking for something?
                </p>
                <p className="text-[color:var(--chakra-colors-textMain)] text-md">
                    Start typing into the search bar
                </p>
            </div>
        </div>
    );
}

interface SearchResultsProps {
    tab: ComponentType<SearchResultsTabProps>;
    query: string;
}

function SearchResults(props: SearchResultsProps): ReactElement {
    return (
        <div className="flex flex-col w-full flex-1 items-start gap-2">
            <props.tab query={props.query} />
        </div>
    );
}

export default function Search(): ReactElement {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(Tabs.All);

    const handleSearchSubmit = (input: HTMLInputElement | null) => {
        if (input) {
            router.replace(`/search?q=${input.value}&type=${activeTab}`);
        }
    };

    useEffect(() => {
        if (router.query?.q) {
            const val = (router.query.type as string | undefined)?.toLowerCase() as Tabs;
            setActiveTab(Object.values(Tabs).indexOf(val) >= 0 ? val : Tabs.All);
        }
    }, [router.query.type, router.query.q]);

    if (!router.query) return <></>;

    return (
        <div className="flex flex-col gap-4 m-3 items-start">
            <NextSeo {...searchSEO} />
            <SearchBar
                size="md"
                onSubmit={handleSearchSubmit}
                withButton
                showRecent
                display={{ base: "flex", md: "none" }}
            />
            {router.query.q ? (
                <>
                    <TabBar activeTab={activeTab} />
                    <p className="mt-1 text-xl">
                        Results for:{" "}
                        <span className="font-bold break-all">
                            {router.query.q}
                        </span>
                    </p>
                    <SearchResults
                        query={router.query.q as string}
                        tab={tabData[activeTab]}
                    />
                </>
            ) : (
                <NoSearch />
            )}
        </div>
    );
}
