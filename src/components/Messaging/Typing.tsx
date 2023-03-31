import { HStack, VStack, Box } from "@chakra-ui/react";
import { ReactElement } from "react";
import styles from "src/styles/Typing.module.scss";
import Avatar from "src/components/User/Avatar";

interface TypingProps {
    recipientAvatarURL: string | undefined | null;
}

export default function Typing({ recipientAvatarURL }: TypingProps): ReactElement {
    const dots = Array(3).fill(null);

    return (
        <HStack align="start" maxWidth={{ base: "80%", md: "65%" }} py={4}>
            <Avatar
                src={recipientAvatarURL}
                alt="User avatar"
                width="35px"
                height="35px"
                pauseAnimation
            />
            <VStack spacing={0.5} align="start">
                <HStack
                    spacing={1}
                    alignItems="start"
                    px={4}
                    py={3}
                    bgColor="bgSecondary"
                    rounded="0 8px 8px 8px"
                >
                    {dots.map((_, i) => (
                        <Box data-delay={i} className={styles.dot} key={i} />
                    ))}
                </HStack>
            </VStack>
        </HStack>
    );
}
