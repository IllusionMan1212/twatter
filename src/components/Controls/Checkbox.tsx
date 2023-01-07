import { ReactElement } from "react";
import { Checkbox as ChakraCheckbox, CheckboxProps, Icon } from "@chakra-ui/react";
import { CheckIcon, MinusSmIcon } from "@heroicons/react/solid";

export default function CheckBox(props: CheckboxProps): ReactElement {
    const { isIndeterminate } = props;

    return (
        <ChakraCheckbox
            {...props}
            icon={
                <Icon
                    as={isIndeterminate ? MinusSmIcon : CheckIcon}
                    stroke="white"
                    strokeWidth="2px"
                    w="3"
                    h="3"
                />
            }
        />
    );
}
