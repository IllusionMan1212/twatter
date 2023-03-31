import {
    Flex,
    HStack,
    Icon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    VStack,
    Image,
    Divider,
    ModalFooter,
    Button,
} from "@chakra-ui/react";
import { MapPinLine } from "@phosphor-icons/react";
import { ReactElement, useState } from "react";
import { EventType } from "src/components/Event/Event";
import { formatEventDate } from "src/utils/helpers";
import CalendarDaysIcon from "src/components/Icons/CalendarDaysIcon";
import { BellIcon, CheckIcon } from "@heroicons/react/solid";
import toast from "react-hot-toast";
import { parsingOptions } from "../Post/Post";
import HTMLToJSX from "html-react-parser";
import { axiosInstance } from "src/utils/axios";

function ModalLocationIcon(): ReactElement {
    return <MapPinLine size="22" />;
}

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: EventType | null;
}

export default function EventModal({
    isOpen,
    onClose,
    ...props
}: EventModalProps): ReactElement {
    const [isSubmitting, setSubmitting] = useState(false);

    const isExpired = Date.now() >= new Date(props.event?.date ?? 0).getTime();

    const EventInfo = (): string => {
        if (isExpired) {
            return "This event has expired!";
        } else {
            if (props.event?.isInterested) {
                return `You and ${props.event.interest - 1} other ${
                    props.event.interest - 1 === 1 ? "person" : "people"
                } are interested`;
            } else {
                return `${props.event?.interest} ${
                    props.event?.interest ?? 1 - 1 === 1 ? "person is" : "people are"
                } interested`;
            }
        }
    };

    const toggleInterest = () => {
        setSubmitting(true);
        axiosInstance
            .patch(`events/toggle-interest/${props.event?.id}`, {
                interest: !props.event?.isInterested,
            })
            .then(async () => {
                await props.event?.mutateEvents?.();
                setSubmitting(false);
            })
            .catch(() => {
                toast.error(
                    `An error occurred while ${
                        props.event?.isInterested
                            ? "removing interest from"
                            : "showing interest in"
                    } the event`,
                );
            });
    };

    if (!props.event) {
        return <></>;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent bgColor="bgMain">
                <ModalHeader>
                    <HStack spacing={1}>
                        <Icon
                            color="accent.500"
                            as={CalendarDaysIcon}
                            strokeWidth={2}
                            w={8}
                            h={8}
                        />
                        <Text fontSize="14px" color="textMain">
                            {formatEventDate(props.event.date)}
                        </Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton size="lg" />
                <ModalBody>
                    <Flex
                        direction={{ base: "column", md: "row" }}
                        align="start"
                        width="full"
                        gap={4}
                    >
                        <VStack
                            spacing={1}
                            align="start"
                            width="full"
                            maxWidth={{
                                base: "100%",
                                md: props.event.imageURL ? "60%" : "100%",
                            }}
                        >
                            <Text fontSize="lg" fontWeight="semibold">
                                {props.event.title}
                            </Text>
                            <Text fontSize="sm" fontWeight="medium" color="textSecondary">
                                {HTMLToJSX(props.event.description, parsingOptions)}
                            </Text>
                        </VStack>
                        {props.event.imageURL ? (
                            <Flex
                                direction="column"
                                width="full"
                                maxWidth={{ base: "100%", md: "60%" }}
                            >
                                <Image
                                    fit="cover"
                                    rounded="sm"
                                    src={props.event.imageURL}
                                    alt={props.event.title}
                                />
                            </Flex>
                        ) : null}
                    </Flex>
                    <Text
                        color={isExpired ? "red" : "textMain"}
                        width="full"
                        mt={4}
                        textAlign="right"
                        fontSize="14px"
                    >
                        {EventInfo()}
                    </Text>
                </ModalBody>
                <Divider height="1px" bgColor="bgSecondary" />
                <ModalFooter>
                    <Flex width="full" justifyContent="space-between">
                        <HStack color="textMain">
                            <Icon as={ModalLocationIcon} />
                            <Text fontSize="14px">{props.event.location}</Text>
                        </HStack>
                        {!isExpired ? (
                            <Button
                                leftIcon={
                                    <Icon
                                        as={
                                            props.event.isInterested
                                                ? CheckIcon
                                                : BellIcon
                                        }
                                        w={5}
                                        h={5}
                                    />
                                }
                                colorScheme="accent"
                                onClick={toggleInterest}
                                isLoading={isSubmitting}
                            >
                                {props.event.isInterested
                                    ? "Interested"
                                    : "Show interest"}
                            </Button>
                        ) : null}
                    </Flex>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
