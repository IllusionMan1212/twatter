import { ReactElement } from "react";
import {
    Flex,
    forwardRef,
    Input as ChakraInput,
    InputGroup,
    InputRightElement,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";

export interface InputProps {
    placeholder: string;
    name?: string;
    type?: string;
    withLabel?: string;
    icon?: ReactElement;
    defaultValue?: string;
    leftAddon?: ReactElement;
    rightAddon?: ReactElement;
    disabled?: boolean;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onClick?: React.MouseEventHandler<HTMLInputElement>;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    value?: string;
}

const Input = forwardRef<InputProps, "input">((props, ref): ReactElement => {
    const focusColor = useColorModeValue("black", "white");

    return (
        <Flex width="full" direction="column">
            {props.withLabel && <Text fontSize="md">{props.withLabel}</Text>}
            <InputGroup>
                {props.leftAddon}
                <ChakraInput
                    ref={ref}
                    color="text"
                    rounded="10px"
                    border="1px solid"
                    borderColor="stroke"
                    bgColor="bgSecondary"
                    placeholder={props.placeholder}
                    _placeholder={{ color: "textMain", opacity: 0.8 }}
                    focusBorderColor={focusColor}
                    _hover={{ borderColor: "button.400" }}
                    pl={5}
                    type={props.type}
                    defaultValue={props.defaultValue}
                    disabled={props.disabled}
                    onChange={props.onChange}
                    onClick={props.onClick}
                    onFocus={props.onFocus}
                    onBlur={props.onBlur}
                    value={props.value}
                    name={props.name}
                />
                {props.icon && (
                    <InputRightElement right="10px">{props.icon}</InputRightElement>
                )}
                {props.rightAddon}
            </InputGroup>
        </Flex>
    );
});

Input.defaultProps = {
    type: "text",
};

export default Input;
