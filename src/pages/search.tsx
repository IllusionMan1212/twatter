import dynamic from "next/dynamic";
import { Flex, VStack, Text, HStack, Image, Box, Button } from "@chakra-ui/react";
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
            <Text fontWeight={isActive ? "semibold" : "normal"}>
                {text.charAt(0).toUpperCase() + text.slice(1)}
            </Text>
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
        <VStack spacing={5} width="full">
            <Image
                fit="cover"
                width="250px"
                src="/graphics/Coming_Soon.png"
                alt="List is empty graphic"
            />
            <VStack spacing={1} textAlign="center">
                <Text fontSize="3xl" fontWeight="bold">
                    Looking for something?
                </Text>
                <Text color="textMain" fontSize="md">
                    Start typing into the search bar
                </Text>
            </VStack>
        </VStack>
    );
}

interface SearchResultsProps {
    tab: ComponentType<SearchResultsTabProps>;
    query: string;
}

function SearchResults(props: SearchResultsProps): ReactElement {
    return (
        <VStack width="full" flex="1" alignItems="start">
            <props.tab query={props.query} />
        </VStack>
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
        <Flex direction="column" gap={4} mx={3} align="start">
            <NextSeo {...searchSEO} />
            <SearchBar
                size="md"
                onSubmit={handleSearchSubmit}
                withButton
                display={{ base: "flex", md: "none" }}
            />
            {router.query.q ? (
                <>
                    <TabBar activeTab={activeTab} />
                    <Text fontSize="xl" mt={1}>
                        Results for:{" "}
                        <Text as="span" fontWeight="bold">
                            {router.query.q}
                        </Text>
                    </Text>
                    <SearchResults
                        query={router.query.q as string}
                        tab={tabData[activeTab]}
                    />
                </>
            ) : (
                <NoSearch />
            )}
        </Flex>
    );
}
