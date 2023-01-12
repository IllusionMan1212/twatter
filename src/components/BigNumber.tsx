import { ReactElement, memo } from "react";

interface BigNumberProps {
    className: string;
    num: number;
}

const BigNumber = memo(function BigNumber({ className, num }: BigNumberProps): ReactElement {
    if (num >= 1000000000) {
        return <span className={className}>{(num / 1000000000).toFixed(1)}B</span>;
    }

    if (num >= 1000000) {
        return <span className={className}>{(num / 1000000).toFixed(1)}M</span>;
    }

    if (num >= 1000) {
        return <span className={className}>{(num / 1000).toFixed(1)}K</span>;
    }

    return (
        <span className={className}>{num}</span>
    );
});

export default BigNumber;
