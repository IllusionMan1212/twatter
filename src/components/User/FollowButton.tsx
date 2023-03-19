import { ReactElement, useState } from "react";
import { Button, Icon, IconButton } from "@chakra-ui/react";
import toast from "react-hot-toast";
import { UserCircleMinus, UserCirclePlus } from "phosphor-react";
import { axiosAuth } from "src/utils/axios";

interface UserFollowProps {
    isFollowing: boolean;
    size: string;
}

function UserFollow({ isFollowing, size }: UserFollowProps): ReactElement {
    if (isFollowing) return <UserCircleMinus size={size} weight="fill" />;
    return <UserCirclePlus size={size} weight="fill" />;
}

interface FollowButtonProps {
    isFollowing: boolean;
    userId: string;
    iconOnly: boolean;
    iconSize: string;
    followCB?: () => Promise<void>;
}

export default function FollowButton({ userId, iconOnly, iconSize, followCB, ...props }: FollowButtonProps): ReactElement {
    const [isSubmittingFollow, setSubmittingFollow] = useState(false);
    const [isFollowing, setFollowing] = useState(props.isFollowing);

    const handleFollow = (followOrUnfollow: string) => {
        setSubmittingFollow(true);
        axiosAuth.post(`users/${followOrUnfollow}/${userId}`)
            .then(async () => {
                setFollowing(!isFollowing);
                setSubmittingFollow(false);
                await followCB?.();
            })
            .catch((err) => {
                setSubmittingFollow(false);
                toast.error(err.response?.data.message ?? `Failed to ${followOrUnfollow} user`);
            });
    };

    if (iconOnly) {
        return (
            <IconButton
                aria-label={isFollowing ? "Unfollow" : "Follow"}
                icon={<Icon as={() => <UserFollow isFollowing={isFollowing} size={iconSize} />} />}
                onClick={() => handleFollow(isFollowing ? "unfollow" : "follow")}
                isLoading={isSubmittingFollow}
            />
        );
    }

    return (
        <Button
            variant="solid"
            leftIcon={<Icon as={() => <UserFollow isFollowing={isFollowing} size={iconSize} />} />}
            onClick={() => handleFollow(isFollowing ? "unfollow" : "follow")}
            isLoading={isSubmittingFollow}
        >
            {isFollowing ? "Unfollow" : "Follow"}
        </Button>
    );
}

FollowButton.defaultProps = {
    iconOnly: false
};
