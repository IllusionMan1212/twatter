import ClockCounterClockwise from "@phosphor-icons/react/dist/icons/ClockCounterClockwise";
import MagnifyingGlass from "@phosphor-icons/react/dist/icons/MagnifyingGlass";
import {
    Box,
    HStack,
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    ResponsiveValue,
    VStack,
    Link as ChakraLink,
} from "@chakra-ui/react";
import { ChangeEventHandler, forwardRef, ReactElement, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import * as CSS from "csstype";
import useRecentSearches from "src/hooks/useRecentSearches";
import NextLink from "next/link";
import { XIcon } from "@heroicons/react/solid";

interface RecentSearchItemProps {
    value: string;
    idx: number;
    removeItem: (idx: number) => void;
    setShowRecent: Dispatch<SetStateAction<boolean>>;
}

function RecentSearchItem({ value, idx, removeItem, setShowRecent }: RecentSearchItemProps): ReactElement {
    const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        removeItem(idx);
    };

    return (
        <NextLink className="w-full" tabIndex={-1} href={`/search?q=${value}`} passHref>
            <ChakraLink width="full" onClick={() => setShowRecent(false)}>
                <HStack
                    width="full"
                    _active={{ bgColor: "bgSecondary" }}
                    _hover={{ bgColor: "bgSecondary" }}
                    px={5}
                    justify="space-between"
                >
                    <HStack spacing={4} minWidth={0}>
                        <ClockCounterClockwise size={24} className="min-w-[24px]" color="var(--chakra-colors-textMain)" />
                        <p className="text-sm truncate max-w-full">{value}</p>
                    </HStack>
                    <IconButton
                        size="sm"
                        variant="ghost"
                        aria-label="Remove Search Item"
                        onClick={handleRemove}
                        icon={
                            <XIcon
                                width="20"
                                height="20"
                                color="var(--chakra-colors-textMain)"
                            />
                        }
                    />
                </HStack>
            </ChakraLink>
        </NextLink>
    );
}

interface RecentSearchesProps {
    recent: string[];
    removeItem: (idx: number) => void;
    setShowRecent: Dispatch<SetStateAction<boolean>>;
}

const RecentSearches = forwardRef<HTMLDivElement, RecentSearchesProps>(
    function RecentSearches({ recent, removeItem, setShowRecent }, ref): ReactElement | null {
        return (
            <Box
                ref={ref}
                py={3}
                zIndex={1}
                tabIndex={-1}
                top="38px"
                bgColor="bgPrimary"
                width="calc(100% - 40px)"
                border="2px solid"
                borderColor="button.400"
                position="absolute"
                boxSizing="border-box"
                rounded="0 0 var(--chakra-radii-lg) var(--chakra-radii-lg)"
            >
                <VStack width="full" align="start">
                    {recent.map((val, i) => (
                        <RecentSearchItem
                            key={`${val + i.toString()}`}
                            value={val}
                            removeItem={removeItem}
                            setShowRecent={setShowRecent}
                            idx={i}
                        />
                    ))}
                </VStack>
            </Box>
        );
    },
);

interface SearchBarProps {
    placeholder?: string;
    rounded?: string;
    size?: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    display?: ResponsiveValue<CSS.Property.Display>;
    isDisabled?: boolean;
    withButton: boolean;
    showRecent?: boolean;
    onSubmit?: (input: HTMLInputElement | null) => void;
}

export default function SearchBar(props: SearchBarProps): ReactElement {
    const inputRef = useRef<HTMLInputElement>(null);
    const recentRef = useRef<HTMLDivElement>(null);

    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [showRecent, setShowRecent] = useState(false);

    const { addItem, recent, removeItem } = useRecentSearches();

    const doSearch = () => {
        if (inputRef.current?.value) {
            props.onSubmit?.(inputRef.current);
            addItem(inputRef.current.value);
            inputRef.current.value = "";
            inputRef.current.blur();
            setButtonDisabled(true);
            props.showRecent && setShowRecent(false);
        }
    };

    const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.code == "Enter") {
            e.preventDefault();
            doSearch();
        }
    };

    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
        const ev = e.nativeEvent as InputEvent;
        if (ev.composed && ev.inputType === "insertCompositionText" && ev.data?.[ev.data?.length - 1] == "\n") {
            doSearch();
        }
    };

    const handleFocus = () => {
        props.showRecent && setShowRecent(!!recent.length);
    };

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (e.relatedTarget === recentRef.current || e.relatedTarget?.matches("a, button")) return;
        props.showRecent && setShowRecent(false);
    };

    useEffect(() => {
        if (!recent.length) {
            setShowRecent(false);
        }
    }, [recent]);

    return (
        <>
            {props.withButton ? (
                <HStack width="full" onBlur={handleBlur} position="relative" spacing={0} display={props.display}>
                    <Input
                        ref={inputRef}
                        color="text"
                        rounded={`var(--chakra-radii-lg) ${showRecent ? "var(--chakra-radii-lg)" : "0"} 0 ${showRecent ? "0" : "var(--chakra-radii-lg)"}`}
                        bgColor="bgPrimary"
                        borderColor="bgPrimary"
                        borderRight="1px solid var(--chakra-colors-bgMain)"
                        placeholder={props.placeholder}
                        _placeholder={{ color: "textMain", opacity: 0.8 }}
                        focusBorderColor="unset"
                        _focus={{
                            border: "2px solid var(--chakra-colors-button-400)"
                        }}
                        _hover={{ borderColor: "gray.400" }}
                        pl={6}
                        isDisabled={props.isDisabled}
                        size={props.size}
                        onChange={(e) => {
                            setButtonDisabled(Boolean(!e.target.value));
                            props.onChange?.(e);
                        }}
                        transition="border-radius 0.1s linear"
                        onKeyDown={handleEnterPress}
                        onInput={handleInput}
                        onFocus={handleFocus}
                    />
                    <IconButton
                        aria-label="Search button"
                        rounded="0 var(--chakra-radii-lg) var(--chakra-radii-lg) 0"
                        size={props.size}
                        colorScheme="conversationItem"
                        icon={<Box size="28" as={MagnifyingGlass} color="textMain" />}
                        transition="border-radius 0.1s linear"
                        onClick={doSearch}
                        isDisabled={buttonDisabled}
                    />
                    {showRecent ? (
                        <RecentSearches
                            ref={recentRef}
                            recent={recent}
                            removeItem={removeItem}
                            setShowRecent={setShowRecent}
                        />
                    ) : null}
                </HStack>
            ) : (
                <InputGroup display={props.display} alignItems="center" size={props.size}>
                    <Input
                        ref={inputRef}
                        color="text"
                        rounded={props.rounded}
                        bgColor="bgPrimary"
                        borderColor="bgPrimary"
                        placeholder={props.placeholder}
                        _placeholder={{ color: "textMain", opacity: 0.8 }}
                        focusBorderColor="button.400"
                        _hover={{ borderColor: "gray.400" }}
                        pl={6}
                        isDisabled={props.isDisabled}
                        onChange={props.onChange}
                        onSubmit={() => props.onSubmit?.(inputRef.current)}
                    />
                    <InputRightElement pointerEvents="none" right="10px">
                        <Box
                            size="28"
                            opacity={props.isDisabled ? 0.3 : 1}
                            as={MagnifyingGlass}
                            color="textMain"
                        />
                    </InputRightElement>
                </InputGroup>
            )}
        </>
    );
}

SearchBar.defaultProps = {
    placeholder: "Search",
    rounded: "full",
    size: "lg",
    withButton: false,
    isDisabled: false,
    display: "flex",
    showRecent: false,
};
