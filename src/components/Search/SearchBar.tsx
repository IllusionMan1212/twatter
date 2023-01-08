import { MagnifyingGlass } from "phosphor-react";
import {
    Box,
    HStack,
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    ResponsiveValue,
} from "@chakra-ui/react";
import { ChangeEventHandler, ReactElement, useRef, useState } from "react";
import * as CSS from "csstype";

interface SearchBarProps {
    placeholder?: string;
    rounded?: string;
    size?: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    display?: ResponsiveValue<CSS.Property.Display>;
    isDisabled?: boolean;
    withButton: boolean;
    onSubmit?: (input: HTMLInputElement | null) => void;
}

export default function SearchBar(props: SearchBarProps): ReactElement {
    const inputRef = useRef<HTMLInputElement>(null);
    const [buttonDisabled, setButtonDisabled] = useState(true);

    const handleEnterPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && inputRef.current?.value) {
            e.preventDefault();
            props.onSubmit?.(inputRef.current);
            inputRef.current.value = "";
            setButtonDisabled(true);
        }
    };

    return (
        <>
            {props.withButton ? (
                <HStack width="full" spacing={0} display={props.display}>
                    <Input
                        ref={inputRef}
                        color="text"
                        rounded="var(--chakra-radii-lg) 0 0 var(--chakra-radii-lg)"
                        bgColor="bgSecondary"
                        borderColor="bgSecondary"
                        borderRight="1px solid var(--chakra-colors-bgMain)"
                        placeholder={props.placeholder}
                        _placeholder={{ color: "textMain", opacity: 0.8 }}
                        focusBorderColor="button.400"
                        _hover={{ borderColor: "gray.400" }}
                        pl={6}
                        isDisabled={props.isDisabled}
                        size={props.size}
                        onChange={(e) => {
                            setButtonDisabled(Boolean(!e.target.value));
                            props.onChange?.(e);
                        }}
                        onKeyPress={handleEnterPress}
                    />
                    <IconButton
                        aria-label="Search button"
                        rounded="0 var(--chakra-radii-lg) var(--chakra-radii-lg) 0"
                        size={props.size}
                        colorScheme="navItem"
                        icon={<Box size="28" as={MagnifyingGlass} color="textMain" />}
                        onClick={() => props.onSubmit?.(inputRef.current)}
                        disabled={buttonDisabled}
                    />
                </HStack>
            ) : (
                <InputGroup display={props.display} alignItems="center" size={props.size}>
                    <Input
                        ref={inputRef}
                        color="text"
                        rounded={props.rounded}
                        bgColor="bgSecondary"
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
};
