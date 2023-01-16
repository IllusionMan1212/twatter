import { ReactElement } from "react";

interface IconButtonProps extends React.ComponentPropsWithoutRef<"button"> {
    className?: string;
    ariaLabel: string;
    hoverColor: string;
    activeColor: string;
    icon: ReactElement;
}

export default function IconButton({
    className,
    ariaLabel,
    hoverColor,
    activeColor,
    icon,
    ...otherProps
}: IconButtonProps): ReactElement {
    return (
        <button
            className={`appearance-none inline-flex justify-center items-center select-none outline-none h-10 w-10 focus-visible:shadow-outline transition-colors ${hoverColor} ${activeColor} ${className ?? ""}`}
            type="button"
            aria-label={ariaLabel}
            {...otherProps}
        >
            {icon}
        </button>
    );
}
