import { ReactElement } from "react";
import { Switch as ChakraSwitch, SwitchProps } from "@chakra-ui/react";

export default function Switch(props: SwitchProps): ReactElement {
    return (
        <ChakraSwitch
            {...props}
            sx={{
                ".chakra-switch__track": { background: "bgSecondary", width: "36px" },
                ".chakra-switch__track[data-checked]": {
                    background: "var(--chakra-colors-accent-500)",
                },
                ".chakra-switch__thumb": {
                    background: "var(--chakra-colors-textMain)",
                },
                ".chakra-switch__thumb[data-checked]": {
                    transform: "translateX(20px)",
                    background: "white",
                },
            }}
        />
    );
}
