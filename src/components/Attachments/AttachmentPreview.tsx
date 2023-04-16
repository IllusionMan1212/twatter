import { Icon, IconButton, Image } from "@chakra-ui/react";
import { XIcon } from "@heroicons/react/outline";
import { ReactElement } from "react";

interface AttachmentPreviewProps {
    image: string;
    idx: number;
    size?: string | number;
    removeAttachment: (idx: number) => void;
}

export default function AttachmentPreview({
    image,
    idx,
    ...props
}: AttachmentPreviewProps): ReactElement {
    return (
        <div className="relative rounded-lg border-[1px] border-[color:var(--chakra-colors-bgThird)]">
            <div
                className={
                    "absolute top-0 right-0 rounded-md w-[100%] h-[100%] bg-black/30"
                }
            />
            <IconButton
                icon={<Icon as={XIcon} w={6} h={6} />}
                size="sm"
                aria-label="Remove"
                justifyContent="center"
                alignItems="center"
                colorScheme="red"
                rounded="lg"
                position="absolute"
                top={-3}
                right={-3}
                onClick={() => props.removeAttachment(idx)}
            />
            <Image
                fit="cover"
                boxSize={props.size}
                minWidth={props.size}
                rounded="md"
                src={image}
                alt={`Attachment ${idx + 1}`}
            />
        </div>
    );
}

AttachmentPreview.defaultProps = {
    size: "100px",
};
