import { ReactElement } from "react";
import {
    Flex,
    forwardRef,
    Input as ChakraInput,
    InputProps as ChakraInputProps,
    InputGroup,
    InputRightElement,
    Text,
    useColorModeValue,
    ChakraComponent,
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

type MyInput = ChakraComponent<"input", InputProps>;

const Input = forwardRef<InputProps & ChakraInputProps, "input">(({ 
    placeholder,
    name,
    type,
    withLabel,
    icon,
    defaultValue,
    leftAddon,
    rightAddon,
    disabled,
    onChange,
    onClick,
    onFocus,
    onBlur,
    value,
    ...otherProps
}, ref): ReactElement => {
    const focusColor = useColorModeValue("black", "white");

    return (
        <Flex width="full" direction="column">
            {withLabel && <Text fontSize="md">{withLabel}</Text>}
            <InputGroup>
                {leftAddon}
                <ChakraInput
                    ref={ref}
                    color="text"
                    rounded="10px"
                    border="1px solid"
                    borderColor="stroke"
                    bgColor="bgSecondary"
                    placeholder={placeholder}
                    _placeholder={{ color: "textMain", opacity: 0.8 }}
                    focusBorderColor={focusColor}
                    _hover={{ borderColor: "button.400" }}
                    pl={5}
                    type={type}
                    defaultValue={defaultValue}
                    disabled={disabled}
                    onChange={onChange}
                    onClick={onClick}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    value={value}
                    name={name}
                    {...otherProps}
                />
                {icon && (
                    <InputRightElement right="10px">{icon}</InputRightElement>
                )}
                {rightAddon}
            </InputGroup>
        </Flex>
    );
}) as MyInput;

Input.defaultProps = {
    type: "text",
};

export default Input;
