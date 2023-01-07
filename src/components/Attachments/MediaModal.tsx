import {
    Icon,
    IconButton,
    LightMode,
    Modal,
    ModalContent,
    ModalOverlay,
    Image as ChakraImage,
} from "@chakra-ui/react";
import styles from "src/styles/attachments.module.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Navigation, Zoom } from "swiper";
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from "@heroicons/react/solid";
import { memo } from "react";

const NavPrevBtn = () => {
    return (
        <IconButton
            boxSize="10"
            position="absolute"
            colorScheme="button"
            rounded="full"
            className={`${styles.imageNavigation} ${styles.imageNavigationPrev}`}
            onClick={(e) => e.stopPropagation()}
            variant="solid"
            aria-label="Prev Image"
            icon={<Icon as={ArrowLeftIcon} color="white" w="5" h="5" />}
        />
    );
};

const NavNextBtn = () => {
    return (
        <IconButton
            boxSize="10"
            position="absolute"
            colorScheme="button"
            rounded="full"
            className={`${styles.imageNavigation} ${styles.imageNavigationNext}`}
            onClick={(e) => e.stopPropagation()}
            variant="solid"
            aria-label="Next Image"
            icon={<Icon as={ArrowRightIcon} color="white" w="5" h="5" />}
        />
    );
};

interface CloseModalButton {
    onClose: () => void;
}

const CloseModalButton = ({ onClose }: CloseModalButton) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onClose();
    };

    return (
        <LightMode>
            <IconButton
                boxSize={10}
                zIndex={2}
                position="absolute"
                top={2}
                right={3}
                colorScheme="button"
                rounded="md"
                onClick={handleClick}
                variant="solid"
                aria-label="Close Modal"
                icon={<Icon as={XIcon} w="6" h="6" />}
            />
        </LightMode>
    );
};
interface MediaModalProps {
    isOpen: boolean;
    onClose: () => void;
    mediaIndex: number;
    media: string[];
}

const MediaModal = memo(function MediaModal({
    isOpen,
    onClose,
    ...props
}: MediaModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay bgColor="#000000D0" />
            <ModalContent
                maxW="100vw"
                maxH="100vh"
                height="100vh"
                bgColor="transparent"
                overflow="hidden"
                boxShadow="unset"
                margin="0"
                justifyContent="space-around"
                onClick={onClose}
            >
                <Swiper
                    modules={[Navigation, Keyboard, Zoom]}
                    slidesPerView={1}
                    initialSlide={props.mediaIndex}
                    navigation={{
                        prevEl: `.${styles.imageNavigationPrev}`,
                        nextEl: `.${styles.imageNavigationNext}`,
                    }}
                    keyboard={true}
                    zoom={true}
                >
                    <CloseModalButton onClose={onClose} />
                    {props.media.length > 1 ? (
                        <>
                            <NavPrevBtn />
                            <NavNextBtn />
                        </>
                    ) : null}
                    {props.media.map((m, i) => (
                        <SwiperSlide key={i} zoom={true}>
                            <ChakraImage
                                src={m}
                                maxHeight="100vh !important"
                                maxWidth="100vw !important"
                                objectFit="contain"
                                color="white"
                                alt="Post's attached image expanded"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </ModalContent>
        </Modal>
    );
});

export default MediaModal;
