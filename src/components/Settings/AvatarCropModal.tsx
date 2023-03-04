import { ReactElement, SyntheticEvent, useState, useRef, useEffect } from "react";
import { Modal, ModalBody, Text, ModalContent, ModalHeader, ModalOverlay, ModalFooter, Button, ButtonGroup, VStack, Slider, SliderFilledTrack, SliderTrack, SliderThumb } from "@chakra-ui/react";
import { ZoomInIcon, ZoomOutIcon } from "@heroicons/react/outline";
import useWasm from "src/hooks/useWasm";

interface AvatarCropModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: { url: string, mimetype: string };
    imageBytes: ArrayBuffer | null;
    onConfirmCrop: (blob: Blob) => void;
}

export default function AvatarCropModal({ isOpen, onClose, ...props }: AvatarCropModalProps): ReactElement {
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const gifWorker = useWasm("/gif.worker.js");

    const [imageW, setImageW] = useState(0);
    const [imageH, setImageH] = useState(0);
    const [overlayW, setOverlayW] = useState(0);
    const [overlayH, setOverlayH] = useState(0);
    const [isDragging, setDragging] = useState(false);
    const [touchX, setTouchX] = useState(0);
    const [touchY, setTouchY] = useState(0);
    const [transX, setX] = useState(0);
    const [transY, setY] = useState(0);
    const [zoom, setZoom] = useState(1);

    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        setX(0);
        setY(0);
        setZoom(1);
        setLoading(false);
    }, [props.image.url]);

    const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
        const w = e.currentTarget.width;
        const h = e.currentTarget.height;
        setImageW(w);
        setImageH(h);
        if (h < w) {
            setOverlayW(h);
            setOverlayH(h);
        } else {
            setOverlayW(w);
            setOverlayH(w);
        }
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLImageElement>) => {
        e.preventDefault();
        setDragging(true);
        setTouchX(e.changedTouches[0].clientX);
        setTouchY(e.changedTouches[0].clientY);
    };

    const handleMove = (e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>) => {
        if (!isDragging || isLoading) return;
        e.preventDefault();
        const x = "movementX" in e ? e.movementX : (e.changedTouches[0].clientX - touchX);
        const y = "movementY" in e ? e.movementY : (e.changedTouches[0].clientY - touchY);
        if (Math.abs(x + transX) < ((imageW * zoom) - (overlayW)) / 2) {
            setX(_x => _x + x);
        }

        if (Math.abs(y + transY) < ((imageH * zoom) - (overlayH)) / 2) {
            setY(_y => _y + y);
        }

        if ("touches" in e) {
            setTouchX(e.changedTouches[0].clientX);
            setTouchY(e.changedTouches[0].clientY);
        }
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLImageElement>) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleZoom = (val: number) => {
        const newZoom = val / 100;

        if (newZoom < zoom) {
            // collisions (wrote this thru an all nighter and its basically black magic to me)
            // left
            if ((((imageW * newZoom) - (overlayW)) / 2) - transX <= 0) {
                setX(((imageW * newZoom) - (overlayW)) / 2);
            }
            // right
            if ((-((imageW * newZoom) - (overlayW)) / 2) - transX >= 0) {
                setX(-((imageW * newZoom) - (overlayW)) / 2);
            }
            // bottom
            if ((-((imageH * newZoom) - (overlayH)) / 2) - transY >= 0) {
                setY(-((imageH * newZoom) - (overlayH)) / 2);
            }
            // top
            if ((((imageH * newZoom) - (overlayH)) / 2) - transY <= 0) {
                setY(((imageH * newZoom) - (overlayH)) / 2);
            }
        }

        setZoom(newZoom);
    };

    const handleConfirm = async () => {
        if (!props.imageBytes) {
            return;
        }

        setLoading(true);

        const GIF87a = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61];
        const GIF89a = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61];

        const img = new Image();
        img.src = (document.getElementById("image") as HTMLImageElement).src;
        const startingX = ((((imageW * zoom) - overlayW) / 2) - transX);
        const startingY = ((((imageH * zoom) - overlayH) / 2) - transY);
        const smallestSide = imageW < imageH ? imageW : imageH;
        const ratio = img.naturalHeight / imageH;
        const x = (startingX * ratio) / zoom;
        const y = (startingY * ratio) / zoom;
        const w = (ratio * smallestSide) / zoom;
        const h = (ratio * smallestSide) / zoom;

        const buf = Buffer.from(props.imageBytes!);
        if (buf.compare(Buffer.from(GIF87a), 0, GIF87a.length, 0, GIF87a.length) === 0 ||
            buf.compare(Buffer.from(GIF89a), 0, GIF89a.length, 0, GIF89a.length) === 0) {

            const imageData = new Uint8Array(props.imageBytes);
            await gifWorker<{buf: Uint8Array}>([imageData, x, y, w, h], (data) => {
                const finishedBlob = new Blob([data.buf]);
                setLoading(false);
                props.onConfirmCrop(finishedBlob);
            });
        } else {
            const canvas = document.createElement("canvas");
            canvas.style.position = "fixed";
            canvas.style.top = "0";
            canvas.height = 200;
            canvas.width = 200;
            canvas.style.visibility = "hidden";
            document.body.appendChild(canvas);
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, x, y, w, h, 0, 0, 200, 200);
            canvas.toBlob((blob) => {
                if (blob) {
                    setLoading(false);
                    props.onConfirmCrop(blob);
                    document.body.removeChild(canvas);
                }
            }, props.image.mimetype);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent bgColor="bgMain">
                <ModalHeader>
                    <Text>Crop Image</Text>
                </ModalHeader>
                <ModalBody as={VStack} width="full" py={0} spacing={4}>
                    <div className="bg-[color:var(--chakra-colors-bgPrimary)] w-full">
                        <div className="flex h-[300px] sm:h-[400px] max-h-[300px] sm:max-h-[400px] relative items-center justify-center overflow-hidden">
                            <img
                                id="image"
                                src={props.image.url}
                                style={{ transform: `translate3d(${transX}px, ${transY}px, 0) scale(${zoom})` }}
                                className={`absolute h-full ${isLoading ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"} max-w-[unset] touch-none`}
                                draggable="false"
                                onLoad={handleLoad}
                                onMouseMove={handleMove}
                                onMouseDown={() => setDragging(true)}
                                onMouseUp={() => setDragging(false)}
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                                onTouchMove={handleMove}
                            />
                            <div
                                ref={overlayRef}
                                style={{ width: overlayW, height: overlayH }}
                                className="border-[2px] absolute z-[1] border-white shadow-[0_0px_0px_9999px_rgba(0,0,0,0.5)] pointer-events-none"
                            />
                        </div>
                    </div>
                    <div className="w-full">
                        <div className="flex justify-between gap-4">
                            <ZoomOutIcon width="30px" />
                            <Slider aria-label="Image Zoom" defaultValue={100} min={100} max={300} onChange={handleZoom} isDisabled={isLoading}>
                                <SliderTrack>
                                    <SliderFilledTrack bg="var(--chakra-colors-accent-500)" />
                                </SliderTrack>
                                <SliderThumb boxSize={5} />
                            </Slider>
                            <ZoomInIcon width="30px" />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <ButtonGroup size="sm">
                        <Button colorScheme="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="accent" isLoading={isLoading} onClick={handleConfirm}>
                            Confirm
                        </Button>
                    </ButtonGroup>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
