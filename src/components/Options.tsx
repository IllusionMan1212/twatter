import { ReactElement } from "react";
import DotsThree from "@phosphor-icons/react/dist/icons/DotsThree";
import DotsThreeVertical from "@phosphor-icons/react/dist/icons/DotsThreeVertical";
import {
    Menu,
    Icon,
    MenuButton,
    MenuButtonProps,
    ChakraComponent,
    IconButton,
    BoxProps,
    PlacementWithLogical,
} from "@chakra-ui/react";

interface OptionsMenuProps {
    buttonSize?: string;
    direction?: "horizontal" | "vertical";
    placement?: PlacementWithLogical;
}

interface OptionsButtonProps {
    size?: string;
    direction?: "horizontal" | "vertical";
}

type OptionsButton = ChakraComponent<"button", OptionsButtonProps>;
type OptionsMenu = ChakraComponent<"div", OptionsMenuProps>;

function ThreeDots(): ReactElement {
    return <DotsThree size={32} />;
}

function ThreeDotsVertical(): ReactElement {
    return <DotsThreeVertical size={32} />;
}

const OptionsButton = ((props: MenuButtonProps & OptionsButtonProps) => {
    return (
        <MenuButton
            {...props}
            as={IconButton}
            variant="ghost"
            colorScheme="button"
            minWidth="full"
            height="full"
            boxSize={props.size ?? ""}
            aria-label="Options"
            color="textMain"
            rounded="md"
            icon={
                <Icon
                    as={props.direction === "vertical" ? ThreeDotsVertical : ThreeDots}
                />
            }
            onClick={(e) => e.stopPropagation()}
        />
    );
}) as OptionsButton;

const OptionsMenu = ((props: BoxProps & OptionsMenuProps) => {
    return (
        <div>
            <Menu
                modifiers={[
                    {
                        name: "preventOverflow",
                        options: { padding: { bottom: 49 }, altAxis: true, rootBoundary: "document" }
                    }
                ]}
                placement={props.placement ?? "bottom-end"}
            >
                <OptionsButton size={props.buttonSize} direction={props.direction} />
                {props.children}
            </Menu>
        </div>
    );
}) as OptionsMenu;

export default OptionsMenu;
