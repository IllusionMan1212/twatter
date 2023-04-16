import { Button, ButtonProps, IconButton, IconButtonProps } from "@chakra-ui/react";
import { ReactElement, useRef } from "react";

interface FileUploadProps {
    acceptedFileTypes?: string;
    multiple: boolean;
    onInputChange: React.ChangeEventHandler<HTMLInputElement>;
}

export function FileUpload(props: FileUploadProps & ButtonProps): ReactElement {
    const { acceptedFileTypes, multiple, onInputChange, ...buttonProps } = props;
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <Button {...buttonProps} onClick={() => inputRef.current?.click()}>
            <input
                ref={inputRef}
                type="file"
                accept={acceptedFileTypes}
                style={{ display: "none" }}
                multiple={multiple}
                onChange={onInputChange}
            ></input>
            {buttonProps.children}
        </Button>
    );
}

export function IconFileUpload(props: FileUploadProps & IconButtonProps): ReactElement {
    const { acceptedFileTypes, multiple, onInputChange, ...buttonProps } = props;
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div>
            <IconButton {...buttonProps} onClick={() => inputRef.current?.click()} />
            <input
                ref={inputRef}
                type="file"
                accept={acceptedFileTypes}
                style={{ display: "none" }}
                multiple={multiple}
                onChange={onInputChange}
            />
        </div>
    );
}

FileUpload.defaultProps = {
    multiple: false,
};

IconFileUpload.defaultProps = {
    multiple: false,
};
