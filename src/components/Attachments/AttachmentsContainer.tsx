import styles from "src/styles/attachments.module.scss";
import MediaModal from "src/components/Attachments/MediaModal";
import { useEffect, useRef, useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import { IAttachment } from "src/types/interfaces";

interface AttachmentsProps {
    attachments: IAttachment[];
}

export default function Attachments({ attachments }: AttachmentsProps) {
    const imagesRef = useRef<(HTMLDivElement | null)[]>([]);

    const [index, setIndex] = useState(0);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleClick = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
        e.stopPropagation();
        setIndex(index);
        onOpen();
    };

    useEffect(() => {
        imagesRef.current.forEach((imageRef, index) => {
            const bgImg = new Image();
            bgImg.src = attachments[index].thumbUrl;
            bgImg.onload = () => {
                if (imageRef) {
                    imageRef.style.backgroundColor = "#0000";
                    imageRef.style.backgroundImage = `url(${attachments[index].thumbUrl})`;
                }
            };
        });
    }, [attachments]);

    return (
        <>
            <div className={styles.imagesContainer}>
                {attachments.length == 2 ? (
                    <>
                        <div className={styles.halfImageGrid}>
                            <div
                                ref={(r) => (imagesRef.current[0] = r)}
                                className={`${styles.imageAttachment} ${styles.halfImageGrid2Images}`}
                                style={{
                                    backgroundColor: attachments[0].bgColor
                                }}
                                onClick={(e) => handleClick(e, 0)}
                            />
                        </div>
                        <div className={styles.halfImageGrid}>
                            <div
                                ref={(r) => (imagesRef.current[1] = r)}
                                className={`${styles.imageAttachment} ${styles.halfImageGrid2Images}`}
                                style={{
                                    backgroundColor: attachments[1].bgColor
                                }}
                                onClick={(e) => handleClick(e, 1)}
                            />
                        </div>
                    </>
                ) : attachments.length == 3 ? (
                    <>
                        <div className={styles.halfImageGrid}>
                            <div
                                ref={(r) => (imagesRef.current[0] = r)}
                                className={`${styles.imageAttachment}`}
                                style={{
                                    backgroundColor: attachments[3].bgColor
                                }}
                                onClick={(e) => handleClick(e, 0)}
                            />
                        </div>
                        <div className={styles.halfImageGrid}>
                            <div
                                ref={(r) => (imagesRef.current[1] = r)}
                                className={`${styles.imageAttachment}`}
                                style={{
                                    backgroundColor: attachments[1].bgColor
                                }}
                                onClick={(e) => handleClick(e, 1)}
                            />
                            <div
                                ref={(r) => (imagesRef.current[2] = r)}
                                className={`${styles.imageAttachment}`}
                                style={{
                                    backgroundColor: attachments[2].bgColor
                                }}
                                onClick={(e) => handleClick(e, 2)}
                            />
                        </div>
                    </>
                ) : attachments.length == 4 ? (
                    <>
                        <div className={styles.halfImageGrid}>
                            <div
                                ref={(r) => (imagesRef.current[0] = r)}
                                className={`${styles.imageAttachment}`}
                                style={{
                                    backgroundColor: attachments[0].bgColor
                                }}
                                onClick={(e) => handleClick(e, 0)}
                            />
                            <div
                                ref={(r) => (imagesRef.current[2] = r)}
                                className={`${styles.imageAttachment}`}
                                style={{
                                    backgroundColor: attachments[2].bgColor
                                }}
                                onClick={(e) => handleClick(e, 2)}
                            />
                        </div>
                        <div className={styles.halfImageGrid}>
                            <div
                                ref={(r) => (imagesRef.current[1] = r)}
                                className={`${styles.imageAttachment}`}
                                style={{
                                    backgroundColor: attachments[1].bgColor
                                }}
                                onClick={(e) => handleClick(e, 1)}
                            />
                            <div
                                ref={(r) => (imagesRef.current[3] = r)}
                                className={`${styles.imageAttachment}`}
                                style={{
                                    backgroundColor: attachments[3].bgColor
                                }}
                                onClick={(e) => handleClick(e, 3)}
                            />
                        </div>
                    </>
                ) : (
                    <div className={styles.halfImageGrid}>
                        <div
                            ref={(r) => (imagesRef.current[0] = r)}
                            className={`${styles.imageAttachment}`}
                            style={{
                                backgroundColor: attachments[0].bgColor
                            }}
                            onClick={(e) => handleClick(e, 0)}
                        />
                    </div>
                )}
            </div>
            <MediaModal
                isOpen={isOpen}
                onClose={onClose}
                mediaIndex={index}
                media={attachments.map((a => a.url))}
            />
        </>
    );
}
