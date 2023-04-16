import {
    Box,
    Spacer,
    Icon,
    Button,
    Badge,
    useDisclosure,
} from "@chakra-ui/react";
import Clock from "@phosphor-icons/react/dist/icons/Clock";
import MapPinLine from "@phosphor-icons/react/dist/icons/MapPinLine";
import { ReactElement } from "react";
import { GetEventsRes, SearchAllRes } from "src/types/server";
import { formatEventDate } from "src/utils/helpers";
import { KeyedMutator } from "swr";
import EventModal from "src/components/Event/EventModal";

interface EventProps {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    imageURL: string;
    isInterested: boolean;
    interest: number;
    mutateEvents:
        | KeyedMutator<GetEventsRes[]>
        | KeyedMutator<GetEventsRes>
        | KeyedMutator<SearchAllRes>;
}

function ClockIcon(): ReactElement {
    return <Clock weight="bold" size="18" />;
}

function LocationIcon(): ReactElement {
    return <MapPinLine weight="bold" size="18" />;
}

export type EventType = Omit<EventProps, "onModalOpen" | "setModalEvent">;

export default function Event({
    id,
    title,
    description,
    date,
    location,
    imageURL,
    isInterested,
    interest,
    mutateEvents,
}: EventProps): ReactElement {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const isExpired = Date.now() >= new Date(date).getTime();

    return (
        <div className="flex flex-col relative rounded overflow-hidden gap-6 p-5 pb-4 items-start w-full text-[color:var(--chakra-colors-gray-100)]">
            {imageURL ? (
                <Box
                    width="full"
                    height="full"
                    position="absolute"
                    top={0}
                    right={0}
                    zIndex={-1}
                    filter="blur(2px)"
                    bgImg={imageURL}
                    bgRepeat="no-repeat"
                    bgPosition="center"
                    bgSize="cover"
                />
            ) : (
                <div
                    className="w-full h-full absolute top-0 right-0 -z-[1] bg-gradient-135 from-[#81FFEF] from-10% to-[#F067B4]"
                />
            )}
            <div
                className="absolute -z-[1] top-0 right-0 w-full h-full bg-[rgba(0,0,0,0.45)]"
            />
            <div className="flex w-full items-between">
                <p className="font-semibold text-lg truncate">
                    {title}
                </p>
                {isExpired ? (
                    <Badge
                        position="absolute"
                        top={3}
                        right={4}
                        variant="subtle"
                        colorScheme="red"
                    >
                        Expired
                    </Badge>
                ) : null}
            </div>
            <Spacer />
            <div className="flex w-full justify-between items-end">
                <div className="flex flex-col items-start gap-0">
                    <div className="flex items-center gap-1">
                        <Icon as={ClockIcon} />
                        <p className="text-sm">{formatEventDate(date)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <Icon as={LocationIcon} />
                        <p className="text-sm">{location}</p>
                    </div>
                </div>
                <Button size="sm" colorScheme="button" onClick={onOpen}>
                    See Details
                </Button>
            </div>
            <EventModal
                isOpen={isOpen}
                onClose={onClose}
                event={{
                    id,
                    title,
                    description,
                    interest,
                    isInterested,
                    date,
                    imageURL,
                    location,
                    mutateEvents,
                }}
            />
        </div>
    );
}
