import { Image } from "@chakra-ui/react";
import { memo, ReactElement } from "react";

interface AvatarProps {
    width: string;
    height: string;
    src: string | undefined | null;
    alt: string;
    onClick?: () => void;
}

const Avatar = memo(function Avatar(props: AvatarProps): ReactElement {
    return (
        <Image
            src={props.src ?? "/default_profile.svg"}
            alt={props.alt}
            className="rounded overflow-hidden object-cover"
            width={props.width}
            height={props.height}
            minWidth={props.width}
            minHeight={props.height}
            maxWidth={props.width}
            maxHeight={props.height}
            onClick={props.onClick}
        />
    );
});

export default Avatar;
