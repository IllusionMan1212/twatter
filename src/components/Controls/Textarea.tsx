import {
    forwardRef,
    Textarea as ChakraTextarea,
    TextareaProps,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { ReactElement } from "react";

const Textarea = forwardRef<TextareaProps, "textarea">((props, ref): ReactElement => {
    const focusColor = useColorModeValue("black", "white");

    return (
        <VStack
            bgColor="bgSecondary"
            rounded="md"
            p={4}
            px={5}
            spacing={6}
            align="start"
            width="full"
            border="1px solid"
            borderColor="stroke"
            _hover={{ borderColor: "button.400" }}
            _focusWithin={{
                borderColor: focusColor,
                boxShadow: `0 0 0 1px ${focusColor}`,
            }}
        >
            <ChakraTextarea
                {...props}
                ref={ref}
                resize="none"
                border="none"
                p={0}
                _focusVisible={{ border: "none" }}
                _placeholder={{ color: "textMain", opacity: 0.8 }}
            />
        </VStack>
    );
});

export default Textarea;
