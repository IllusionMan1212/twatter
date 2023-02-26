import { Image } from "@chakra-ui/react";
import { memo, ReactElement } from "react";

interface AvatarProps {
    width: string;
    height: string;
    src: string | undefined | null;
    alt: string;
    pauseAnimation?: boolean;
    onClick?: () => void;
}

const Avatar = memo(function Avatar(props: AvatarProps): ReactElement {
    const period = props.src?.lastIndexOf(".");
    const ext = props.src?.substring((period ?? 0) + 1);
    const src = typeof props.src === "string" ? props.pauseAnimation && ext === "gif" ? props.src.substring(0, period) + ".png" : props.src : "/default_profile.svg";

    return (
        <Image
            src={src}
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
