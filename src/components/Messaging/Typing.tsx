import { ReactElement } from "react";
import styles from "src/styles/Typing.module.scss";
import Avatar from "src/components/User/Avatar";

interface TypingProps {
    recipientAvatarURL: string | undefined | null;
}

export default function Typing({ recipientAvatarURL }: TypingProps): ReactElement {
    const dots = Array(3).fill(null);

    return (
        <div className="flex items-start py-4 max-w-[80%] md:max-w-[65%] gap-2">
            <Avatar
                src={recipientAvatarURL}
                alt="User avatar"
                width="35px"
                height="35px"
                pauseAnimation
            />
            <div className="flex flex-col items-start gap-[0.5]">
                <div className="flex gap-1 items-start px-4 py-3 bg-[color:var(--chakra-colors-bgSecondary)] rounded-[0_8px_8px_8px]">
                    {dots.map((_, i) => (
                        <div data-delay={i} className={styles.dot} key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
