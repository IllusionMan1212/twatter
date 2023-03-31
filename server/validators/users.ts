import z from "zod";
import { GetPagedData } from "./general";

export const GetUserData = z.object({
    username: z.string({ required_error: "username is required" }).min(1, "Username cannot be empty"),
});

export const FollowData = z.object({
    userId: z.string({ required_error: "User ID is required" }).min(1, "User ID cannot be empty"),
});

export const GetFollowersData = GetPagedData.extend({
    userId: z.string({ required_error: "User ID is required" }).min(1, "User ID cannot be empty"),
});

export const RefreshTokenData = z.object({
    refreshToken: z.string({ required_error: "refreshToken is required" }).min(1, "Refresh token cannot be empty"),
});

