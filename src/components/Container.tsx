import { Flex, FlexProps } from "@chakra-ui/react";

export const Container = (props: FlexProps) => (
    <Flex
        direction="column"
        alignItems="center"
        justifyContent="flex-start"
        bg="bgMain"
        color="text"
        transition="all 0.15s ease-out"
        {...props}
    />
);
