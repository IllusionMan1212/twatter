import { Request, Response } from "express";
import { followUser, getUserByUsername, queryFollowers, queryFollowing, unfollowUser } from "../database/users";
import { FollowData, GetFollowersData, GetUserData } from "../validators/users";
import { DatabaseError } from "../database/utils";
import novu from "../novu";

export async function getUser(req: Request, res: Response) {
    const data = GetUserData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const user = await getUserByUsername(data.data.username);

    if (!user) {
        return res.status(404).json({ message: "User doesn't exist" });
    }

    return res.status(200).json({ message: "Successfully fetched user", user });
}

export async function follow(req: Request, res: Response) {
    const data = FollowData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    if (data.data.userId === req.session.user.id) {
        return res.status(403).json({ message: "You can't follow yourself" });
    }

    const error = await followUser(req.session.user.id, data.data.userId);

    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An internal error has occurred" });
    } else if (error === DatabaseError.DUPLICATE) {
        return res.status(200).json({ message: "Successfully followed user" });
    }

    await novu.trigger("follow", {
        to: [{ subscriberId: data.data.userId }],
        actor: {
            subscriberId: req.session.user.id,
        },
        payload: {
            name: `<b>${req.session.user.username}</b>`,
            username: req.session.user.username,
        },
    });

    return res.status(200).json({ message: "Successfully followed user" });
}

export async function unfollow(req: Request, res: Response) {
    const data = FollowData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    if (data.data.userId === req.session.user.id) {
        return res.status(403).json({ message: "You can't unfollow yourself" });
    }

    const error = await unfollowUser(req.session.user.id, data.data.userId);

    if (error === DatabaseError.UNKNOWN) {
        return res.status(500).json({ message: "An internal error has occurred" });
    } else if (error === DatabaseError.OPERATION_DEPENDS_ON_REQUIRED_RECORD_THAT_WAS_NOT_FOUND) {
        return res.status(400).json({ message: "Can't unfollow user" });
    }

    return res.status(200).json({ message: "Successfully unfollowed user" });
}

export async function getFollowers(req: Request, res: Response) {
    const data = GetFollowersData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const followers = await queryFollowers(data.data.userId, data.data.page);

    return res.status(200).json({ followers });
}

export async function getFollowing(req: Request, res: Response) {
    const data = GetFollowersData.safeParse(req.params);

    if (!data.success) {
        return res.status(400).json({ message: data.error.errors[0].message });
    }

    const following = await queryFollowing(data.data.userId, data.data.page);

    return res.status(200).json({ following });
}

