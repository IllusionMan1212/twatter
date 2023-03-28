import {
    Box,
    Flex,
    Text,
    Spacer,
    HStack,
    VStack,
    Icon,
    Button,
    Badge,
    useDisclosure,
} from "@chakra-ui/react";
import { Clock, MapPinLine } from "@phosphor-icons/react";
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
        <Flex
            position="relative"
            rounded="4px"
            overflow="hidden"
            direction="column"
            gap={6}
            p={5}
            pb={4}
            align="start"
            width="full"
            color="gray.100"
        >
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
                <Box
                    width="full"
                    height="full"
                    position="absolute"
                    top={0}
                    right={0}
                    zIndex={-1}
                    bgImg="linear-gradient(135deg, #81FFEF 10%, #F067B4 100%)"
                />
            )}
            <Box
                position="absolute"
                zIndex={-1}
                top={0}
                right={0}
                width="full"
                height="full"
                bgColor="rgba(0, 0, 0, 0.45)"
            />
            <HStack width="full" align="space-between">
                <Text fontWeight="semibold" noOfLines={1} fontSize="18px">
                    {title}
                </Text>
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
            </HStack>
            <Spacer />
            <HStack width="full" justify="space-between" align="flex-end">
                <VStack align="start" spacing={0}>
                    <Flex align="center" gap={1}>
                        <Icon as={ClockIcon} />
                        <Text fontSize="sm">{formatEventDate(date)}</Text>
                    </Flex>
                    <Flex align="center" gap={1}>
                        <Icon as={LocationIcon} />
                        <Text fontSize="sm">{location}</Text>
                    </Flex>
                </VStack>
                <Button size="sm" colorScheme="button" onClick={onOpen}>
                    See Details
                </Button>
            </HStack>
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
        </Flex>
    );
}
